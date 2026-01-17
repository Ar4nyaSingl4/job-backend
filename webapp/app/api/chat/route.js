import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabaseUrl = process.env.supabaseUrl;
const supabaseKey = process.env.supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// temporary session skills (fallback)
let sessionSkills = [];

export async function POST(req) {
try {
const body = await req.json();
const text = body.text?.toLowerCase().trim();
if (!text) {
  return NextResponse.json({ answer: "Please say something!" });
}

// get authenticated user session
const { data: userSession } = await supabase.auth.getUser();
const user_email = userSession?.user?.email || null;

// load saved skills from DB for this user
let savedSkills = [];
if (user_email) {
  const { data: skillRows } = await supabase
    .from("user_skills")
    .select("*")
    .eq("user_email", user_email)
    .order("created_at", { ascending: false })
    .limit(1);

  if (skillRows && skillRows.length > 0) {
    savedSkills = skillRows[0].skills.split(",").map(s => s.trim());
  }
}

// detect skills in input
const skillPattern = /(python|java|sql|kotlin|javascript|react|excel|power[- ]?bi|machine learning|data analysis|android|docker|kubernetes|spring)/g;
const found = text.match(skillPattern);

// CASE: user asks for recommendations
if (text.includes("suggest") || text.includes("recommend")) {

  let skillsToUse = [];

  if (found) {
    skillsToUse = found.map(s => s.toLowerCase());
    sessionSkills = skillsToUse;
  } else if (savedSkills.length > 0) {
    skillsToUse = savedSkills;
  } else if (sessionSkills.length > 0) {
    skillsToUse = sessionSkills;
  } else {
    return NextResponse.json({
      answer: "Tell me your skills first (example: python, react, sql)!"
    });
  }

  const { data: jobs } = await supabase.from("jobs").select("*");

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ answer: "No jobs found in database." });
  }

  const matched = jobs
    .map(job => {
      const score = skillsToUse.filter(skill =>
        job.required_skills?.toLowerCase().includes(skill)
      ).length;
      return { ...job, score };
    })
    .filter(job => job.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (matched.length === 0) {
    return NextResponse.json({
      answer: "Sorry, I couldn't match your skills to any jobs!"
    });
  }

  const reply = matched
    .map(job => `• ${job.job_title}\n   required: ${job.required_skills}`)
    .join("\n\n");

  const finalAnswer = `Based on your skills, you may fit:\n${reply}`;

  if (user_email) {
    await supabase.from("chats").insert({ user_email, message: text, sender: "user" });
    await supabase.from("chats").insert({ user_email, message: finalAnswer, sender: "bot" });
  }

  return NextResponse.json({ answer: finalAnswer });
}

// CASE: user sends skills only
if (found) {
  const newSkills = found.map(s => s.toLowerCase());
  sessionSkills = newSkills;

  if (user_email) {
    await supabase.from("user_skills").delete().eq("user_email", user_email);

    await supabase.from("user_skills").insert({
      user_email,
      skills: newSkills.join(", ")
    });
  }

  const finalAnswer = `Got it! I saved your skills: ${newSkills.join(", ")}. Now type "suggest jobs"!`;

  if (user_email) {
    await supabase.from("chats").insert({ user_email, message: text, sender: "user" });
    await supabase.from("chats").insert({ user_email, message: finalAnswer, sender: "bot" });
  }

  return NextResponse.json({ answer: finalAnswer });
}

// fallback to AI for general chat
const aiResult = await model.generateContent(text);
const aiReply = aiResult.response.text();

if (user_email) {
  await supabase.from("chats").insert({ user_email, message: text, sender: "user" });
  await supabase.from("chats").insert({ user_email, message: aiReply, sender: "bot" });
}

return NextResponse.json({ answer: aiReply });
} catch (err) {
  return NextResponse.json({ answer: "Server error: " + err.message });
  }
}
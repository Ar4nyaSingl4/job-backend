import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// supabase uses your env names here
const supabase = createClient(
  process.env.supabaseUrl,
  process.env.supabaseKey
);

// gemini uses your env name here
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { user_id } = await req.json();

    // 1. Fetch user skills
    const { data: userSkills } = await supabase
      .from("user_skills")
      .select("skills")
      .eq("user_id", user_id);

    if (!userSkills || userSkills.length === 0) {
      return NextResponse.json({ error: "User has no skills" }, { status: 400 });
    }

    const skills = userSkills.map(s => s.skills).join(" ");

    // 2. Fetch jobs
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, job_title, job_description, required_skills");

    // 3. LLM Prompt
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
Match this user with jobs.
User skills: ${skills}

Jobs:
${jobs.map(j => `${j.job_title} - requires: ${j.required_skills}`).join("\n")}

Return ONLY a JSON array of job titles. Example: ["Data Analyst","Web Developer"]
`;

    const result = await model.generateContent(prompt);
    const raw = await result.response.text();

    // 4. Safe JSON extraction
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "LLM did not return valid JSON" }, { status: 500 });
    }

    const matchedTitles = JSON.parse(jsonMatch[0]);

    // 5. Filter job objects
    const enrich = jobs.filter(j => matchedTitles.includes(j.job_title));

    // 6. Save to Supabase
    await supabase.from("recommendations").insert([
      {
        user_id,
        matched_jobs: enrich,
        llm_reasoning: raw
      }
    ]);

    // 7. Return to frontend
    return NextResponse.json({ matched_jobs: enrich });

  } catch (error) {
    return NextResponse.json({ error: error.toString() }, { status: 500 });
  }
}

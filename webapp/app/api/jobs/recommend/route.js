import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.supabaseUrl,
  process.env.supabaseKey
)

export async function POST(req) {
  try {
    const body = await req.json()
    const user_id = body.user_id

    if (!user_id) {
      return NextResponse.json({ error: "user_id required" }, { status: 400 })
    }

    // 1. fetch skills for this user_id
    const { data: userSkills, error: skillErr } = await supabase
      .from("user_skills")
      .select("skills")
      .eq("user_id", user_id)

    if (skillErr) {
      return NextResponse.json(
        { error: "failed to fetch user skills", details: skillErr.message },
        { status: 500 }
      )
    }

    if (!userSkills || userSkills.length === 0) {
      return NextResponse.json(
        { error: "no skills found for this user_id" },
        { status: 404 }
      )
    }

    const userSkillsText = userSkills.map(s => s.skills).join(" ").toLowerCase()

    // 2. fetch all jobs
    const { data: jobs, error: jobsErr } = await supabase
      .from("jobs")
      .select("job_title, required_skills, job_description")

    if (jobsErr) {
      return NextResponse.json(
        { error: "failed to fetch jobs", details: jobsErr.message },
        { status: 500 }
      )
    }

    // 3. match algorithm
    const matched = []
    for (const job of jobs) {
      const required = job.required_skills.toLowerCase().split(" ")
      const matches = required.filter(skill => userSkillsText.includes(skill))

      if (matches.length > 0) {
        matched.push({
          job_title: job.job_title,
          reason: `Matches skills: ${matches.join(", ")}`,
          job_description: job.job_description
        })
      }
    }

    if (matched.length === 0) {
      matched.push({
        job_title: "No direct match found",
        reason: "Try adding more skills",
        job_description: "N/A"
      })
    }

    return NextResponse.json(
      {
        message: "ok",
        matched_jobs: matched
      },
      { status: 200 }
    )

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

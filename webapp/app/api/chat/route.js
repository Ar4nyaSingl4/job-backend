import { NextResponse } from "next/server";

export async function POST(req) {
  const BACKEND = "https://skill-job-backend.onrender.com";

  try {
    const body = await req.json();

    const res = await fetch(`${BACKEND}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        message: body.text,       // 👈 send user message to backend
        userId: body.userId || null
      })
    });

    const data = await res.json();

    return NextResponse.json({
      answer: data.reply || data.answer || "No response from server"
    });

  } catch (err) {
    console.error("CHAT ERROR:", err);
    return NextResponse.json({
      answer: "Server error: " + err.message
    });
  }
}

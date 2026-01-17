import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const body = await req.json();
    const { skills } = body;

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Based on these skills: ${skills.join(", ")}
Suggest 5 suitable job roles with one-line descriptions.
Return in JSON format like:
[{ "role": "...", "description": "..." }]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let jobs;
    try {
      jobs = JSON.parse(text);
    } catch {
      jobs = [{ role: "Error parsing AI response", description: text }];
    }

    return new Response(JSON.stringify({ jobs }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("LLM Error:", error);
    return new Response(JSON.stringify({ error: "LLM failed" }), { status: 500 });
  }
}

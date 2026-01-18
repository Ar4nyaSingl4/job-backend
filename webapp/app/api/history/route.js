import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.supabaseUrl, process.env.supabaseKey);

export async function GET() {
  const BACKEND = "https://skill-job-backend.onrender.com";

  try {
    const res = await fetch(`${BACKEND}/history`, {
      credentials: "include",
    });

    const data = await res.json();
    return Response.json({ chats: data.chats || [] });

  } catch (err) {
    return Response.json({ chats: [] });
  }
}

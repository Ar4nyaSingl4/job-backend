import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.supabaseUrl, process.env.supabaseKey);

export async function GET() {
try {
const { data: userSession } = await supabase.auth.getUser();
const user_email = userSession?.user?.email;

if (!user_email) {
    return NextResponse.json({ chats: [] });
  }
  
  const { data } = await supabase
    .from("chats")
    .select("*")
    .eq("user_email", user_email)
    .order("created_at", { ascending: true });
  
  return NextResponse.json({ chats: data || [] });
} catch (err) {
    return NextResponse.json({ chats: [], error: err.message });
    }
}  
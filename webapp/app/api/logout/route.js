import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.supabaseUrl, process.env.supabaseKey);

export async function POST() {
await supabase.auth.signOut();
return NextResponse.json({ success: true });
}
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.supabaseUrl, process.env.supabaseKey);

export async function GET() {
const { data } = await supabase.auth.getUser();
return NextResponse.json({ email: data?.user?.email || null });
}
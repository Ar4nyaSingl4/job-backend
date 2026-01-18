import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ email: null, id: null });
  }

  return NextResponse.json({
    email: data.user.email,
    id: data.user.id
  });
}

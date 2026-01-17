import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.supabaseUrl,
  process.env.supabaseKey
);

export async function POST(req) {
  try {
    const payload = await req.json();
    const record = payload.record;

    if (!record) {
      return NextResponse.json(
        { message: "No record found in webhook" },
        { status: 400 }
      );
    }

    console.log("Webhook received record:", record);

    // Insert raw webhook data into Supabase for logging or debugging
    await supabase.from("webhook_logs").insert({
      user_id: record.user_id || null,
      payload: record
    });

    return NextResponse.json(
      { message: "Webhook processed" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

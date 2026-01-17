import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.supabaseUrl || process.env.NEXT_PUBLIC_supabaseUrl;
const supabaseKey = process.env.supabaseKey || process.env.NEXT_PUBLIC_supabaseKey;

if (!supabaseUrl) throw new Error("supabaseUrl env missing");
if (!supabaseKey) throw new Error("supabaseKey env missing");

export const supabase = createClient(supabaseUrl, supabaseKey);
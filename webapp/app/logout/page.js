"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    async function doLogout() {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
    doLogout();
  }, []);

  return <div style={{ color: "#fff", padding: 20 }}>Logging out...</div>;
}

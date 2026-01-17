"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("login"); // login or register
  const [msg, setMsg] = useState("");

  async function handleSubmit() {
    setMsg("");

    if (!email || !password) {
      setMsg("Email and password are required.");
      return;
    }

    if (type === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) setMsg(error.message);
      else window.location.href = "/chat";
    }

    if (type === "register") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) setMsg(error.message);
      else setMsg("Account created! Check your email if confirmation is enabled.");
    }
  }

  return (
    <div style={{ background: "#000", color: "#fff", height: "100vh", padding: "40px" }}>
      <h2>{type === "login" ? "Login" : "Register"}</h2>

      <div style={{ display: "flex", flexDirection: "column", width: "300px", gap: "10px" }}>
        <input
          type="email"
          placeholder="Email"
          style={{ padding: 10 }}
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          style={{ padding: 10 }}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button onClick={handleSubmit} style={{ padding: 10 }}>
          {type === "login" ? "Login" : "Register"}
        </button>

        <button
          style={{ marginTop: 10, padding: 10 }}
          onClick={() => setType(type === "login" ? "register" : "login")}
        >
          Switch to {type === "login" ? "Register" : "Login"}
        </button>

        {msg && <p style={{ color: "orange" }}>{msg}</p>}
      </div>
    </div>
  );
}

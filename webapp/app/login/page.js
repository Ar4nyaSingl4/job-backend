"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("login"); // login or register
  const [msg, setMsg] = useState("");

  const BACKEND = "https://skill-job-backend.onrender.com";

  async function handleSubmit() {
    setMsg("");

    if (!email || !password) {
      setMsg("Email and password are required.");
      return;
    }

    try {
      if (type === "login") {
        const res = await fetch(`${BACKEND}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // important for cookie/session
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
          window.location.href = "/chat";
        } else {
          setMsg(data.error || "Login failed");
        }
      }

      if (type === "register") {
        const res = await fetch(`${BACKEND}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
          setMsg("Account created! You can now login.");
          setType("login");
        } else {
          setMsg(data.error || "Registration failed");
        }
      }
    } catch (err) {
      setMsg("Network error: " + err.message);
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

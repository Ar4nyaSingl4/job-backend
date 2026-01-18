"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userEmail, setUserEmail] = useState("");

  async function loadUser() {
    const res = await fetch("/api/me");
    const data = await res.json();

    if (!data.email) {
      router.push("/login");
    } else {
      setUserEmail(data.email); // save email
    }
  }

  async function loadHistory() {
    if (!userEmail) return;

    try {
      const res = await fetch(`https://skill-job-backend.onrender.com/history?userId=${userEmail}`);
      const data = await res.json();

      if (data.history) {
        setMessages(
          data.history.map(c => ({
            sender: c.role === "user" ? "user" : "bot",
            text: c.message
          }))
        );
      }
    } catch (err) {
      console.log("History error:", err);
    }
  }

  async function sendMessage() {
    if (!input.trim() || !userEmail) return;

    const userText = input;
    setMessages(prev => [...prev, { sender: "user", text: userText }]);
    setInput("");

    try {
      const res = await fetch("https://skill-job-backend.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          userId: userEmail
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { sender: "bot", text: data.reply || data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "bot", text: "Error contacting backend." }]);
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  // load user once
  useEffect(() => {
    loadUser();
  }, []);

  // load history once we have userEmail
  useEffect(() => {
    if (userEmail) loadHistory();
  }, [userEmail]);

  return (
    <div style={{ padding: 20, background: "#000", color: "#fff", height: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <h2>AI Job Chatbot</h2>
        <div>
          <span style={{ marginRight: 10 }}>{userEmail}</span>
          <button onClick={logout} style={{ padding: "5px 10px" }}>Logout</button>
        </div>
      </div>

      <div
        style={{
          border: "1px solid gray",
          height: "70vh",
          padding: 10,
          overflowY: "auto",
          marginBottom: 20
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: "10px 0" }}>
            <strong>{msg.sender === "user" ? "You" : "Bot"}:</strong>{" "}
            {msg.text}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          style={{ flex: 1, padding: 10 }}
          placeholder="Say something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} style={{ padding: "10px 20px" }}>
          Send
        </button>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";

export default function Home() {
  const [userId, setUserId] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchRecommendations() {
    if (!userId) return alert("Enter user_id first!");

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch("/api/jobs/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: Number(userId) })
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Unknown error");
        return;
      }

      setResults(data.matched_jobs || []);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Skill-Based Job Matcher</h1>

      <label>Enter User ID:</label>
      <br />
      <input
        placeholder="example: 1"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        style={{ padding: "8px", width: "300px", marginTop: "5px" }}
      />

      <br /><br />

      <button
        onClick={fetchRecommendations}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        Get Recommendations
      </button>

      <br /><br />

      {loading && <p>Loading AI recommendations...</p>}

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && results.length > 0 && (
        <div>
          <h2>Recommended Jobs:</h2>
          {results.map((job, index) => (
            <div key={index} style={{ padding: 10, border: "1px solid #333", marginTop: 10 }}>
              <strong>{job.job_title}</strong>
              <p>{job.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

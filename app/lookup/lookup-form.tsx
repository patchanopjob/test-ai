"use client";

import { useState } from "react";

export default function LookupForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/submissions/login", {
      method: "POST",
      body: JSON.stringify({
        referenceCode: formData.get("referenceCode"),
        password: formData.get("password"),
      }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(result.error || "Unable to find submission.");
      return;
    }
    window.location.href = `/submission/${result.referenceCode}`;
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <h2>Lookup details</h2>
      <div className="grid">
        <label>
          Reference code
          <input name="referenceCode" required placeholder="EVT-2026-ABC123" />
        </label>
        <label>
          Password
          <input name="password" required type="password" />
        </label>
      </div>
      <div className="actions">
        <button disabled={busy}>{busy ? "Checking..." : "View submission"}</button>
      </div>
      {error ? <div className="message error">{error}</div> : null}
    </form>
  );
}

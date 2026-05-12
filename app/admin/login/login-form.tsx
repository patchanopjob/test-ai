"use client";

import { useState } from "react";

export default function AdminLoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password"),
      }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(result.error || "Login failed.");
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <h2>Admin login</h2>
      <div className="grid">
        <label>
          Username
          <input name="username" required />
        </label>
        <label>
          Password
          <input name="password" required type="password" />
        </label>
      </div>
      <div className="actions">
        <button disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
      </div>
      {error ? <div className="message error">{error}</div> : null}
    </form>
  );
}

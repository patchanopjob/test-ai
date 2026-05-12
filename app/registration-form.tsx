"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicRegistration } from "@/lib/types";

type Props = {
  mode: "create" | "edit";
  registration?: PublicRegistration;
};

export default function RegistrationForm({ mode, registration }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const url =
      mode === "create"
        ? "/api/registrations"
        : `/api/registrations/${registration?.referenceCode}`;
    const response = await fetch(url, {
      method: mode === "create" ? "POST" : "PUT",
      body: formData,
    });
    const result = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(result.error || "Something went wrong.");
      return;
    }

    if (mode === "create") {
      setMessage(`Submitted. Your reference code is ${result.referenceCode}.`);
      router.refresh();
      return;
    }

    setMessage("Submission updated.");
    router.refresh();
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <h2>{mode === "create" ? "Attendee details" : "Edit submission"}</h2>
      <div className="grid">
        <label>
          Full name
          <input name="name" required defaultValue={registration?.name} />
        </label>
        <label>
          Email
          <input name="email" required type="email" defaultValue={registration?.email} />
        </label>
        <label>
          Phone
          <input name="phone" required defaultValue={registration?.phone} />
        </label>
        <label>
          Organization
          <input name="organization" required defaultValue={registration?.organization} />
        </label>
        <label>
          Job title
          <input name="jobTitle" required defaultValue={registration?.jobTitle} />
        </label>
        <label>
          Ticket type
          <select name="ticketType" defaultValue={registration?.ticketType || "General Admission"}>
            <option>General Admission</option>
            <option>Speaker</option>
            <option>Workshop Pass</option>
            <option>VIP</option>
          </select>
        </label>
        <label>
          Dietary needs
          <input name="dietaryNeeds" defaultValue={registration?.dietaryNeeds} />
        </label>
        <label>
          Accessibility needs
          <input name="accessibilityNeeds" defaultValue={registration?.accessibilityNeeds} />
        </label>
        <label className="full">
          Emergency contact
          <input name="emergencyContact" required defaultValue={registration?.emergencyContact} />
        </label>
        <label className="full">
          Notes
          <textarea name="notes" defaultValue={registration?.notes} />
        </label>
        {mode === "create" ? (
          <label>
            Password
            <input name="password" required minLength={6} type="password" />
          </label>
        ) : null}
        <label className={mode === "create" ? "" : "full"}>
          Supporting documents
          <input name="documents" type="file" multiple />
        </label>
      </div>
      {mode === "edit" && registration?.documents.length ? (
        <div className="full">
          <p style={{ marginTop: 18 }}>Existing documents stay attached unless replaced below.</p>
          <div className="documents">
            {registration.documents.map((document) => (
              <label className="document-row" key={document.id}>
                <span>{document.originalName}</span>
                <input name="removeDocumentIds" type="checkbox" value={document.id} />
                Remove
              </label>
            ))}
          </div>
        </div>
      ) : null}
      <div className="actions">
        <button disabled={busy}>{busy ? "Saving..." : mode === "create" ? "Submit" : "Save"}</button>
      </div>
      {message ? <div className="message ok">{message}</div> : null}
      {error ? <div className="message error">{error}</div> : null}
    </form>
  );
}

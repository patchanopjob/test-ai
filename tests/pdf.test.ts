import { describe, expect, it } from "vitest";
import { createNameTagPdf, createRegistrationDetailsPdf } from "@/lib/pdf";
import type { Registration } from "@/lib/types";

const registration: Registration = {
  referenceCode: "EVT-2026-ABC123",
  passwordHash: "hash",
  name: "Ada (Countess) \\ Lovelace",
  email: "ada@example.com",
  phone: "+66123456789",
  organization: "Analytical Engines",
  jobTitle: "Program Chair",
  ticketType: "Speaker",
  dietaryNeeds: "",
  accessibilityNeeds: "",
  emergencyContact: "Charles",
  notes: "",
  documents: [],
  createdAt: "2026-05-12T00:00:00.000Z",
  updatedAt: "2026-05-12T00:00:00.000Z",
};

describe("createNameTagPdf", () => {
  it("creates a valid PDF buffer with escaped attendee content", () => {
    const pdf = createNameTagPdf(registration);
    const body = pdf.toString("utf8");

    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(body.startsWith("%PDF-1.4")).toBe(true);
    expect(body).toContain("xref");
    expect(body).toContain("%%EOF");
    expect(body).toContain("Ada \\(Countess\\) \\\\ Lovelace");
    expect(body).toContain("Reference: EVT-2026-ABC123");
  });
});

describe("createRegistrationDetailsPdf", () => {
  it("creates a registration export PDF with attendee details", () => {
    const pdf = createRegistrationDetailsPdf(registration);
    const body = pdf.toString("utf8");

    expect(body.startsWith("%PDF-1.4")).toBe(true);
    expect(body).toContain("Registration Details");
    expect(body).toContain("ada@example.com");
    expect(body).toContain("Speaker");
    expect(body).toContain("EVT-2026-ABC123");
  });
});

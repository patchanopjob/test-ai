import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Registration } from "@/lib/types";

const queryMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({
  query: queryMock,
}));

import {
  createRegistration,
  deleteUploadedFile,
  findRegistration,
  readRegistrations,
  readUploadedFile,
  referenceCodeExists,
  registrationFromForm,
  toPublicRegistration,
  updateRegistration,
  validateRegistrationFields,
} from "@/lib/storage";

const row = {
  reference_code: "EVT-2026-ABC123",
  password_hash: "salt:hash",
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+66123456789",
  organization: "Analytical Engines",
  job_title: "Program Chair",
  ticket_type: "Speaker",
  dietary_needs: "Vegetarian",
  accessibility_needs: "",
  emergency_contact: "Charles Babbage",
  notes: "Arrives Friday",
  documents: [
    {
      id: "doc-1",
      originalName: "passport.pdf",
      storedName: "doc-1-passport.pdf",
      mimeType: "application/pdf",
      size: 123,
      uploadedAt: "2026-05-12T00:00:00.000Z",
    },
  ],
  created_at: new Date("2026-05-12T00:00:00.000Z"),
  updated_at: new Date("2026-05-12T01:00:00.000Z"),
};

const registration: Registration = {
  referenceCode: row.reference_code,
  passwordHash: row.password_hash,
  name: row.name,
  email: row.email,
  phone: row.phone,
  organization: row.organization,
  jobTitle: row.job_title,
  ticketType: row.ticket_type,
  dietaryNeeds: row.dietary_needs,
  accessibilityNeeds: row.accessibility_needs,
  emergencyContact: row.emergency_contact,
  notes: row.notes,
  documents: row.documents,
  createdAt: "2026-05-12T00:00:00.000Z",
  updatedAt: "2026-05-12T01:00:00.000Z",
};

describe("storage helpers", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("maps registration rows from Postgres shape to app shape", async () => {
    queryMock.mockResolvedValueOnce({ rows: [row] });

    await expect(readRegistrations()).resolves.toEqual([registration]);
  });

  it("finds one registration by reference code", async () => {
    queryMock.mockResolvedValueOnce({ rows: [row] });

    await expect(findRegistration("EVT-2026-ABC123")).resolves.toEqual(registration);
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("where reference_code = $1"), [
      "EVT-2026-ABC123",
    ]);
  });

  it("returns null when a registration is not found", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });

    await expect(findRegistration("EVT-2026-MISSING")).resolves.toBeNull();
  });

  it("checks reference code existence", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ exists: true }] });

    await expect(referenceCodeExists("EVT-2026-ABC123")).resolves.toBe(true);
  });

  it("inserts registration values in database column order", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });

    await createRegistration(registration);

    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("insert into registrations"), [
      "EVT-2026-ABC123",
      "salt:hash",
      "Ada Lovelace",
      "ada@example.com",
      "+66123456789",
      "Analytical Engines",
      "Program Chair",
      "Speaker",
      "Vegetarian",
      "",
      "Charles Babbage",
      "Arrives Friday",
      JSON.stringify(registration.documents),
      "2026-05-12T00:00:00.000Z",
      "2026-05-12T01:00:00.000Z",
    ]);
  });

  it("updates registration values without changing password or created date", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });

    await updateRegistration({ ...registration, name: "Ada Byron" });

    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("update registrations"), [
      "EVT-2026-ABC123",
      "Ada Byron",
      "ada@example.com",
      "+66123456789",
      "Analytical Engines",
      "Program Chair",
      "Speaker",
      "Vegetarian",
      "",
      "Charles Babbage",
      "Arrives Friday",
      JSON.stringify(registration.documents),
      "2026-05-12T01:00:00.000Z",
    ]);
  });

  it("reads uploaded document bytes from Postgres", async () => {
    const data = Buffer.from("document");
    queryMock.mockResolvedValueOnce({ rows: [{ data }] });

    await expect(readUploadedFile("EVT-2026-ABC123", "doc.pdf")).resolves.toBe(data);
  });

  it("deletes uploaded document bytes from Postgres", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });

    await deleteUploadedFile("EVT-2026-ABC123", "doc.pdf");

    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("delete from registration_documents"),
      ["EVT-2026-ABC123", "doc.pdf"],
    );
  });

  it("parses and trims registration form fields", () => {
    const form = new FormData();
    form.set("name", " Ada Lovelace ");
    form.set("email", " ada@example.com ");
    form.set("phone", " +66123456789 ");
    form.set("organization", " Analytical Engines ");
    form.set("jobTitle", " Program Chair ");
    form.set("emergencyContact", " Charles ");

    expect(registrationFromForm(form)).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "+66123456789",
      organization: "Analytical Engines",
      jobTitle: "Program Chair",
      ticketType: "General Admission",
      emergencyContact: "Charles",
    });
  });

  it("validates required registration fields", () => {
    const form = new FormData();
    form.set("email", "ada@example.com");
    const fields = registrationFromForm(form);

    expect(validateRegistrationFields(fields)).toEqual([
      "name",
      "phone",
      "organization",
      "job title",
      "emergency contact",
    ]);
  });

  it("removes password hash from public registration data", () => {
    expect(toPublicRegistration(registration)).not.toHaveProperty("passwordHash");
  });
});

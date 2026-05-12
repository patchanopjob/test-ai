import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type { PublicRegistration, Registration, SupportingDocument } from "./types";
import { query } from "./db";

const root = process.cwd();
const uploadDir = path.join(root, "uploads");

async function ensureStorage() {
  await fs.mkdir(uploadDir, { recursive: true });
}

type RegistrationRow = {
  reference_code: string;
  password_hash: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  job_title: string;
  ticket_type: string;
  dietary_needs: string;
  accessibility_needs: string;
  emergency_contact: string;
  notes: string;
  documents: SupportingDocument[];
  created_at: Date;
  updated_at: Date;
};

function rowToRegistration(row: RegistrationRow): Registration {
  return {
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
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function readRegistrations(): Promise<Registration[]> {
  const result = await query<RegistrationRow>(`
    select *
    from registrations
    order by created_at desc
  `);
  return result.rows.map(rowToRegistration);
}

export async function findRegistration(referenceCode: string) {
  const result = await query<RegistrationRow>(
    `
      select *
      from registrations
      where reference_code = $1
    `,
    [referenceCode],
  );
  return result.rows[0] ? rowToRegistration(result.rows[0]) : null;
}

export async function referenceCodeExists(referenceCode: string) {
  const result = await query<{ exists: boolean }>(
    "select exists(select 1 from registrations where reference_code = $1)",
    [referenceCode],
  );
  return result.rows[0]?.exists || false;
}

export async function createRegistration(registration: Registration) {
  await query(
    `
      insert into registrations (
        reference_code,
        password_hash,
        name,
        email,
        phone,
        organization,
        job_title,
        ticket_type,
        dietary_needs,
        accessibility_needs,
        emergency_contact,
        notes,
        documents,
        created_at,
        updated_at
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14, $15)
    `,
    [
      registration.referenceCode,
      registration.passwordHash,
      registration.name,
      registration.email,
      registration.phone,
      registration.organization,
      registration.jobTitle,
      registration.ticketType,
      registration.dietaryNeeds,
      registration.accessibilityNeeds,
      registration.emergencyContact,
      registration.notes,
      JSON.stringify(registration.documents),
      registration.createdAt,
      registration.updatedAt,
    ],
  );
}

export async function updateRegistration(registration: Registration) {
  await query(
    `
      update registrations
      set
        name = $2,
        email = $3,
        phone = $4,
        organization = $5,
        job_title = $6,
        ticket_type = $7,
        dietary_needs = $8,
        accessibility_needs = $9,
        emergency_contact = $10,
        notes = $11,
        documents = $12::jsonb,
        updated_at = $13
      where reference_code = $1
    `,
    [
      registration.referenceCode,
      registration.name,
      registration.email,
      registration.phone,
      registration.organization,
      registration.jobTitle,
      registration.ticketType,
      registration.dietaryNeeds,
      registration.accessibilityNeeds,
      registration.emergencyContact,
      registration.notes,
      JSON.stringify(registration.documents),
      registration.updatedAt,
    ],
  );
}

export function toPublicRegistration(registration: Registration): PublicRegistration {
  const { passwordHash: _passwordHash, ...publicRegistration } = registration;
  return publicRegistration;
}

export function createReferenceCode() {
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `EVT-${new Date().getFullYear()}-${suffix}`;
}

export function registrationFromForm(form: FormData) {
  return {
    name: String(form.get("name") || "").trim(),
    email: String(form.get("email") || "").trim(),
    phone: String(form.get("phone") || "").trim(),
    organization: String(form.get("organization") || "").trim(),
    jobTitle: String(form.get("jobTitle") || "").trim(),
    ticketType: String(form.get("ticketType") || "General Admission").trim(),
    dietaryNeeds: String(form.get("dietaryNeeds") || "").trim(),
    accessibilityNeeds: String(form.get("accessibilityNeeds") || "").trim(),
    emergencyContact: String(form.get("emergencyContact") || "").trim(),
    notes: String(form.get("notes") || "").trim(),
  };
}

export function validateRegistrationFields(fields: ReturnType<typeof registrationFromForm>) {
  const missing = [];
  if (!fields.name) missing.push("name");
  if (!fields.email) missing.push("email");
  if (!fields.phone) missing.push("phone");
  if (!fields.organization) missing.push("organization");
  if (!fields.jobTitle) missing.push("job title");
  if (!fields.emergencyContact) missing.push("emergency contact");
  return missing;
}

export async function saveUploadedFiles(referenceCode: string, files: File[]) {
  await ensureStorage();
  const referenceDir = path.join(uploadDir, referenceCode);
  await fs.mkdir(referenceDir, { recursive: true });

  const documents: SupportingDocument[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const id = crypto.randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storedName = `${id}-${safeName}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(referenceDir, storedName), bytes);
    documents.push({
      id,
      originalName: file.name,
      storedName,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      uploadedAt: new Date().toISOString(),
    });
  }
  return documents;
}

export function documentPath(referenceCode: string, storedName: string) {
  return path.join(uploadDir, referenceCode, storedName);
}

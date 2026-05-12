import { NextResponse } from "next/server";
import { hashPassword, setSubmissionAuth } from "@/lib/auth";
import {
  createRegistration,
  createReferenceCode,
  referenceCodeExists,
  registrationFromForm,
  saveUploadedFiles,
  updateRegistration,
  validateRegistrationFields,
} from "@/lib/storage";

export async function POST(request: Request) {
  const form = await request.formData();
  const fields = registrationFromForm(form);
  const missing = validateRegistrationFields(fields);
  const password = String(form.get("password") || "");

  if (missing.length) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}.` }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  let referenceCode = createReferenceCode();
  while (await referenceCodeExists(referenceCode)) {
    referenceCode = createReferenceCode();
  }

  const now = new Date().toISOString();
  const registration = {
    referenceCode,
    passwordHash: hashPassword(password),
    ...fields,
    documents: [],
    createdAt: now,
    updatedAt: now,
  };

  await createRegistration(registration);
  const files = form.getAll("documents").filter((item): item is File => item instanceof File);
  const documents = await saveUploadedFiles(referenceCode, files);
  if (documents.length) {
    await updateRegistration({ ...registration, documents });
  }
  await setSubmissionAuth(referenceCode);

  return NextResponse.json({ referenceCode });
}

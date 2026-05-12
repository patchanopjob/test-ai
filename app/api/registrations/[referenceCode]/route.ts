import { NextResponse } from "next/server";
import { getSubmissionAuth, isAdminAuthenticated } from "@/lib/auth";
import {
  deleteUploadedFile,
  findRegistration,
  registrationFromForm,
  saveUploadedFiles,
  updateRegistration,
  validateRegistrationFields,
} from "@/lib/storage";

type Context = {
  params: Promise<{ referenceCode: string }>;
};

export async function PUT(request: Request, { params }: Context) {
  const { referenceCode } = await params;
  const authCode = await getSubmissionAuth();
  const admin = await isAdminAuthenticated();
  if (authCode !== referenceCode && !admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const form = await request.formData();
  const fields = registrationFromForm(form);
  const missing = validateRegistrationFields(fields);
  if (missing.length) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}.` }, { status: 400 });
  }

  const current = await findRegistration(referenceCode);
  if (!current) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }

  const removeIds = form.getAll("removeDocumentIds").map(String);
  const remainingDocuments = [];
  for (const document of current.documents) {
    if (removeIds.includes(document.id)) {
      await deleteUploadedFile(referenceCode, document.storedName);
    } else {
      remainingDocuments.push(document);
    }
  }

  const files = form.getAll("documents").filter((item): item is File => item instanceof File);
  const newDocuments = await saveUploadedFiles(referenceCode, files);

  await updateRegistration({
    ...current,
    ...fields,
    documents: [...remainingDocuments, ...newDocuments],
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

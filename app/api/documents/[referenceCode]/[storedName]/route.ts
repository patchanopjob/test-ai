import { NextResponse } from "next/server";
import { getSubmissionAuth, isAdminAuthenticated } from "@/lib/auth";
import { findRegistration, readUploadedFile } from "@/lib/storage";

type Context = {
  params: Promise<{ referenceCode: string; storedName: string }>;
};

export async function GET(_request: Request, { params }: Context) {
  const { referenceCode, storedName } = await params;
  const authCode = await getSubmissionAuth();
  const admin = await isAdminAuthenticated();
  if (authCode !== referenceCode && !admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const registration = await findRegistration(referenceCode);
  const document = registration?.documents.find((item) => item.storedName === storedName);
  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const file = await readUploadedFile(referenceCode, storedName);
  if (!file) {
    return NextResponse.json({ error: "Document file not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `attachment; filename="${document.originalName.replace(/"/g, "")}"`,
    },
  });
}

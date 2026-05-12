import fs from "fs/promises";
import { NextResponse } from "next/server";
import { getSubmissionAuth, isAdminAuthenticated } from "@/lib/auth";
import { documentPath, findRegistration } from "@/lib/storage";

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

  const file = await fs.readFile(documentPath(referenceCode, storedName));
  return new NextResponse(file, {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `attachment; filename="${document.originalName.replace(/"/g, "")}"`,
    },
  });
}

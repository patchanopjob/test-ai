import { NextResponse } from "next/server";
import { setSubmissionAuth, verifyPassword } from "@/lib/auth";
import { findRegistration } from "@/lib/storage";

export async function POST(request: Request) {
  const body = await request.json();
  const referenceCode = String(body.referenceCode || "").trim();
  const password = String(body.password || "");
  const registration = await findRegistration(referenceCode);

  if (!registration || !verifyPassword(password, registration.passwordHash)) {
    return NextResponse.json({ error: "Invalid reference code or password." }, { status: 401 });
  }

  await setSubmissionAuth(referenceCode);
  return NextResponse.json({ referenceCode });
}

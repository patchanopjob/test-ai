import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createRegistrationDetailsPdf } from "@/lib/pdf";
import { findRegistration } from "@/lib/storage";

type Context = {
  params: Promise<{ referenceCode: string }>;
};

export async function GET(_request: Request, { params }: Context) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { referenceCode } = await params;
  const registration = await findRegistration(referenceCode);
  if (!registration) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }

  const pdf = createRegistrationDetailsPdf(registration);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${registration.referenceCode}-registration.pdf"`,
    },
  });
}

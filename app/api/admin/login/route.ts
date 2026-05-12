import { NextResponse } from "next/server";
import { checkAdminCredentials, setAdminAuth } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  if (!checkAdminCredentials(String(body.username || ""), String(body.password || ""))) {
    return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
  }

  await setAdminAuth();
  return NextResponse.json({ ok: true });
}

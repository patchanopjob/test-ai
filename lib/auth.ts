import crypto from "crypto";
import { cookies } from "next/headers";

const USER_COOKIE = "submission_auth";
const ADMIN_COOKIE = "admin_auth";

function secret() {
  return process.env.APP_SECRET || "dev-secret-change-me";
}

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), check);
}

export function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export function signedValue(value: string) {
  return `${value}.${sign(value)}`;
}

export function readSignedValue(raw?: string) {
  if (!raw) return null;
  const index = raw.lastIndexOf(".");
  if (index < 0) return null;
  const value = raw.slice(0, index);
  const sig = raw.slice(index + 1);
  const expected = sign(value);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return value;
}

export async function getSubmissionAuth() {
  const cookieStore = await cookies();
  return readSignedValue(cookieStore.get(USER_COOKIE)?.value);
}

export async function setSubmissionAuth(referenceCode: string) {
  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE, signedValue(referenceCode), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return readSignedValue(cookieStore.get(ADMIN_COOKIE)?.value) === "admin";
}

export async function setAdminAuth() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, signedValue("admin"), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export function checkAdminCredentials(username: string, password: string) {
  return (
    username === (process.env.ADMIN_USERNAME || "admin") &&
    password === (process.env.ADMIN_PASSWORD || "password")
  );
}

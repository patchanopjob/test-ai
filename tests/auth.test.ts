import { beforeEach, describe, expect, it } from "vitest";
import {
  checkAdminCredentials,
  hashPassword,
  readSignedValue,
  signedValue,
  verifyPassword,
} from "@/lib/auth";

describe("auth helpers", () => {
  beforeEach(() => {
    process.env.APP_SECRET = "test-secret";
    process.env.ADMIN_USERNAME = "admin";
    process.env.ADMIN_PASSWORD = "change-me";
  });

  it("hashes and verifies passwords", () => {
    const stored = hashPassword("secret123", "fixed-salt");

    expect(stored).toMatch(/^fixed-salt:/);
    expect(verifyPassword("secret123", stored)).toBe(true);
    expect(verifyPassword("wrong-password", stored)).toBe(false);
  });

  it("signs values and rejects tampered values", () => {
    const signed = signedValue("EVT-2026-ABC123");

    expect(readSignedValue(signed)).toBe("EVT-2026-ABC123");
    expect(readSignedValue(`${signed}tampered`)).toBeNull();
    expect(readSignedValue("not-signed")).toBeNull();
  });

  it("checks admin credentials from env", () => {
    expect(checkAdminCredentials("admin", "change-me")).toBe(true);
    expect(checkAdminCredentials("admin", "wrong")).toBe(false);
    expect(checkAdminCredentials("other", "change-me")).toBe(false);
  });
});

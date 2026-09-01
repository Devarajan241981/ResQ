import { describe, expect, it } from "vitest";
import { normalizePhone } from "./phone";

describe("normalizePhone", () => {
  it("accepts an already-valid E.164 number unchanged", () => {
    expect(normalizePhone("+919876543210")).toBe("+919876543210");
  });

  it("auto-prepends +91 to a bare 10-digit Indian mobile number", () => {
    expect(normalizePhone("9876543210")).toBe("+919876543210");
  });

  it("auto-prepends + to digits that already include a country code", () => {
    expect(normalizePhone("919663397727")).toBe("+919663397727");
  });

  it("strips spaces and dashes before validating", () => {
    expect(normalizePhone("+91 98765 43210")).toBe("+919876543210");
    expect(normalizePhone("91-966-339-7727")).toBe("+919663397727");
  });

  it("rejects empty input", () => {
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone("   ")).toBeNull();
  });

  it("rejects obviously invalid input", () => {
    expect(normalizePhone("abc")).toBeNull();
    expect(normalizePhone("12345")).toBeNull();
    expect(normalizePhone("+91")).toBeNull();
  });
});

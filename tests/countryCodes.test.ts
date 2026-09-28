import { describe, it, expect } from "bun:test";
import { validatePhoneNumber, COUNTRIES } from "@/lib/countryCodes";

describe("Country Codes & Phone Validation Module", () => {
  it("should have fallback country codes available", () => {
    expect(COUNTRIES.length).toBeGreaterThan(10);
    const us = COUNTRIES.find((c) => c.code === "US");
    expect(us).toBeDefined();
    expect(us?.dialCode).toBe("+1");

    const pk = COUNTRIES.find((c) => c.code === "PK");
    expect(pk).toBeDefined();
    expect(pk?.dialCode).toBe("+92");
  });

  it("should validate phone numbers correctly", () => {
    // Valid phone numbers (7 to 15 digits)
    expect(validatePhoneNumber("1234567").isValid).toBe(true);
    expect(validatePhoneNumber("+1 (555) 234-5678").isValid).toBe(true);
    expect(validatePhoneNumber("+92 314 2189730").isValid).toBe(true);

    // Empty is valid (optional field)
    expect(validatePhoneNumber("").isValid).toBe(true);

    // Too short (less than 7 digits)
    const tooShort = validatePhoneNumber("12345");
    expect(tooShort.isValid).toBe(false);
    expect(tooShort.error).toBeDefined();

    // Too long (more than 15 digits)
    const tooLong = validatePhoneNumber("123456789012345678");
    expect(tooLong.isValid).toBe(false);
  });
});

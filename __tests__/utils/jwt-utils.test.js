import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import jwt from "jsonwebtoken";
import { getPayloadFromJWT, createJWT } from "../../utils/jwt-utils.js";

// Mock the jsonwebtoken library
vi.mock("jsonwebtoken", () => {
  return {
    default: {
      sign: vi.fn(),
      verify: vi.fn()
    }
  };
});

describe("JWT Utilities", () => {
  // Store original environment variable
  const originalEnv = process.env;

  beforeEach(() => {
    // Setup mock environment variables for tests
    process.env = { ...originalEnv, JWT_KEY: "test-secret-key" };

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe("createJWT", () => {
    it("should call jwt.sign with correct parameters", () => {
      // Setup mock implementation
      jwt.sign.mockReturnValue("mocked-token");

      // Test data
      const payload = { userId: "123", role: "admin" };

      // Execute the function
      const token = createJWT(payload);

      // Assertions
      expect(jwt.sign).toHaveBeenCalledWith(payload, "test-secret-key", { expiresIn: "24h" });
      expect(token).toBe("mocked-token");
    });

    it("should use custom expiry time if provided", () => {
      // Setup mock implementation
      jwt.sign.mockReturnValue("mocked-token");

      // Test data
      const payload = { userId: "123", role: "admin" };
      const customExpiry = "1h";

      // Execute the function
      createJWT(payload, customExpiry);

      // Assertions
      expect(jwt.sign).toHaveBeenCalledWith(payload, "test-secret-key", {
        expiresIn: customExpiry
      });
    });
  });

  describe("getPayloadFromJWT", () => {
    it("should return payload when token is valid", () => {
      // Setup mock implementation
      const mockPayload = { userId: "123", role: "user" };
      jwt.verify.mockReturnValue(mockPayload);

      // Test data
      const token = "valid.token.here";

      // Execute the function
      const result = getPayloadFromJWT(token);

      // Assertions
      expect(jwt.verify).toHaveBeenCalledWith(token, "test-secret-key");
      expect(result).toEqual(mockPayload);
    });

    it("should throw error when jwt.verify throws an error", () => {
      // Setup mock implementation to throw error
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      // Test data
      const token = "invalid.token.here";

      // Assertions
      expect(() => getPayloadFromJWT(token)).toThrow();
    });

    it("should throw error when decoded payload is falsy", () => {
      // Setup mock implementation
      jwt.verify.mockReturnValue(null);

      // Test data
      const token = "empty.payload.token";

      // Assertions
      expect(() => getPayloadFromJWT(token)).toThrow("JWT is valid but did not contain a payload.");
    });
  });

  describe("Integration tests with real JWT", () => {
    // For these tests, we'll use the actual jwt library, not the mock
    beforeEach(() => {
      vi.doUnmock("jsonwebtoken");
      // Re-import the actual jwt module
      vi.resetModules();
    });

    it("should create and verify a real JWT", async () => {
      // We need to re-import the functions to use the real implementation
      const { createJWT, getPayloadFromJWT } = await import("../../utils/jwt-utils.js");

      // Test data
      const payload = { userId: "456", role: "editor" };

      // Create a real token
      const token = createJWT(payload);

      // Verify the token
      const decoded = getPayloadFromJWT(token);

      // Assertions - check that our payload data is in the decoded result
      expect(decoded).toMatchObject(payload);
      // The decoded token should also have iat (issued at) and exp (expiration) claims
      expect(decoded).toHaveProperty("iat");
      expect(decoded).toHaveProperty("exp");
    });
  });
});

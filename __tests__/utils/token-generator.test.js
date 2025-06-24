import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import jwt from "jsonwebtoken";
import TokenGenerator from "#utils/token-generator.js";

// Mock the jsonwebtoken library
vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn()
  }
}));

describe("TokenGenerator", () => {
  // Test data
  const privateKey = "test-private-key";
  const publicKey = "test-public-key";
  const options = {
    algorithm: "HS256",
    expiresIn: "1h",
    issuer: "test-issuer",
    audience: "test-audience",
    notBefore: "0s"
  };
  const payload = {
    userId: "user123",
    role: "admin"
  };

  // Store original environment variable
  const originalEnv = process.env;

  let tokenGenerator;

  beforeEach(() => {
    // Setup test environment
    process.env = { ...originalEnv };

    // Create a new instance for each test
    tokenGenerator = new TokenGenerator(privateKey, publicKey, options);

    // Clear mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe("constructor", () => {
    it("should store keys and options as instance properties", () => {
      expect(tokenGenerator.secretOrPrivateKey).toBe(privateKey);
      expect(tokenGenerator.secretOrPublicKey).toBe(publicKey);
      expect(tokenGenerator.options).toBe(options);
    });
  });

  describe("sign", () => {
    it("should call jwt.sign with correct parameters", () => {
      // Setup mock implementation
      jwt.sign.mockReturnValue("mocked-token");

      // Additional sign options
      const signOptions = { audience: "app-users", expiresIn: "2h", jwtid: "unique-id" };

      // Execute the function
      const token = tokenGenerator.sign(payload, signOptions);

      // Expected combined options
      const expectedOptions = { ...signOptions, ...options };

      // Assertions
      expect(jwt.sign).toHaveBeenCalledWith(payload, privateKey, expectedOptions);
      expect(token).toBe("mocked-token");
    });

    it("should call jwt.sign with just the class options when no signOptions provided", () => {
      // Setup mock implementation
      jwt.sign.mockReturnValue("mocked-token");

      // Execute the function with no sign options
      const token = tokenGenerator.sign(payload);

      // Assertions
      expect(jwt.sign).toHaveBeenCalledWith(payload, privateKey, options);
      expect(token).toBe("mocked-token");
    });
  });

  describe("verify", () => {
    it("should call jwt.verify with correct parameters", () => {
      // Setup mock implementation
      const mockPayload = { ...payload, iat: 1624546789 };
      jwt.verify.mockReturnValue(mockPayload);

      // Token to verify
      const token = "valid.token.here";

      // Execute the function
      const result = tokenGenerator.verify(token);

      // Assertions
      expect(jwt.verify).toHaveBeenCalledWith(token, publicKey);
      expect(result).toEqual(mockPayload);
    });
  });

  describe("refresh", () => {
    it("should refresh token by removing standard claims and signing again", () => {
      // Mock payload with standard JWT claims
      const fullPayload = {
        ...payload,
        iat: 1624546789,
        exp: 1624550389,
        nbf: 1624546789,
        jti: "original-token-id"
      };

      // Setup verify to return the payload with claims
      jwt.verify.mockReturnValue(fullPayload);

      // Setup sign to return a new token
      jwt.sign.mockReturnValue("refreshed-token");

      // Refresh options
      const refreshOptions = {
        verify: { audience: "app-users" },
        jwtid: "new-token-id"
      };

      // Token to refresh
      const token = "expired.but.valid";

      // Expected payload (without standard claims)
      const expectedPayload = { ...payload };

      // Expected combined options for the new token
      const expectedOptions = { ...options, jwtid: refreshOptions.jwtid };

      // Execute the refresh
      const refreshedToken = tokenGenerator.refresh(token, refreshOptions);

      // Assertions
      expect(jwt.verify).toHaveBeenCalledWith(token, publicKey, refreshOptions.verify);
      expect(jwt.sign).toHaveBeenCalledWith(expectedPayload, privateKey, expectedOptions);
      expect(refreshedToken).toBe("refreshed-token");
    });
  });

  describe("Integration tests with real JWT", () => {
    // For these tests, we'll use the actual jwt library, not the mock
    let TokenGeneratorActual;
    let actualGenerator;

    beforeEach(async () => {
      vi.doUnmock("jsonwebtoken");
      // Re-import the actual jwt module
      vi.resetModules();

      // Import fresh TokenGenerator class that will use the real jsonwebtoken library
      TokenGeneratorActual = (await import("#utils/token-generator.js")).default;

      // Create a shared instance for all tests
      actualGenerator = new TokenGeneratorActual("test-secret-key", "test-secret-key", {
        expiresIn: "1h"
      });
    });

    it("should sign and verify a real token", async () => {
      // Test data
      const testPayload = { userId: "real-user", role: "member" };

      // Sign a token
      const token = actualGenerator.sign(testPayload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");

      // Verify the token
      const verified = actualGenerator.verify(token);

      // The verified token should contain our payload data
      expect(verified.userId).toBe(testPayload.userId);
      expect(verified.role).toBe(testPayload.role);

      // And should have standard JWT claims
      expect(verified).toHaveProperty("iat"); // Issued at
      expect(verified).toHaveProperty("exp"); // Expiration time
    });

    it("should refresh a token and maintain custom claims", async () => {
      // Test data with custom claims
      const testPayload = {
        userId: "refresh-user",
        role: "editor",
        customData: { department: "marketing" }
      };

      // Sign a token with a specific jwtid
      const originalToken = actualGenerator.sign(testPayload, { jwtid: "original-id" });

      // Refresh the token
      const refreshedToken = actualGenerator.refresh(originalToken, {
        verify: {}, // No special verify options
        jwtid: "refreshed-id"
      });

      // Verify the refreshed token
      const verified = actualGenerator.verify(refreshedToken);

      // Should maintain custom claims
      expect(verified.userId).toBe(testPayload.userId);
      expect(verified.role).toBe(testPayload.role);
      expect(verified.customData).toEqual(testPayload.customData);

      // Should have a new exp date and the new jwtid
      expect(verified).toHaveProperty("exp");
      expect(verified.jti).toBe("refreshed-id");
    });
  });
});

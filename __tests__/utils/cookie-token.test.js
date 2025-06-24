import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import TokenGenerator from "#utils/token-generator.js";

// Mock dependencies
vi.mock("#utils/token-generator.js", () => {
  const mockSign = vi.fn().mockReturnValue("mock-token");
  const mockVerify = vi.fn().mockReturnValue({ userId: "mock-user" });
  const mockRefresh = vi.fn().mockReturnValue("refreshed-mock-token");

  return {
    default: vi.fn().mockImplementation(() => ({
      sign: mockSign,
      verify: mockVerify,
      refresh: mockRefresh
    }))
  };
});

vi.mock("dotenv", () => ({
  default: {
    config: vi.fn().mockImplementation(() => {
      if (process.env.__TEST_WITH_KEY__) {
        process.env.JWT_KEY = "test-secret-key";
        return { parsed: { JWT_KEY: "test-secret-key" } };
      } else {
        return { parsed: {} };
      }
    })
  }
}));

describe("Cookie Token Generator", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("should export an instance of TokenGenerator", async () => {
    const cookieToken = (await import("#utils/cookie-token.js")).default;
    expect(cookieToken).toBeDefined();
    expect(typeof cookieToken.sign).toBe("function");
    expect(typeof cookieToken.verify).toBe("function");
    expect(typeof cookieToken.refresh).toBe("function");
  });

  it("should initialize TokenGenerator with JWT_KEY and options", async () => {
    // Test JWT_KEY that loaded by dotenv
    process.env.__TEST_WITH_KEY__ = true;
    vi.resetModules();
    await import("#utils/cookie-token.js");

    // Check if TokenGenerator was called with correct parameters
    expect(TokenGenerator).toHaveBeenCalledWith("test-secret-key", "test-secret-key", {
      expiresIn: "24h"
    });
  });

  it("should handle missing JWT_KEY environment variable", async () => {
    // No JWT_KEY that loaded by dotenv
    process.env.__TEST_WITH_KEY__ = false;

    vi.resetModules();
    // Should still initialize but with default key
    await import("#utils/cookie-token.js");

    expect(TokenGenerator).toHaveBeenCalledWith(undefined, undefined, {
      expiresIn: "24h"
    });
  });
});

// Real integration tests (with actual TokenGenerator)
describe("Cookie Token Integration Tests", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    vi.doUnmock("#utils/token-generator.js");
    process.env.JWT_KEY = "integration-test-key";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should sign and verify tokens", async () => {
    const cookieToken = (await import("#utils/cookie-token.js")).default;

    const payload = { userId: "123", role: "admin" };
    const token = cookieToken.sign(payload);

    // Verify the token and content
    const verified = cookieToken.verify(token);
    expect(verified.userId).toBe(payload.userId);
    expect(verified.role).toBe(payload.role);
  });

  it("should refresh tokens and maintain custom claims", async () => {
    const cookieToken = (await import("#utils/cookie-token.js")).default;

    // Create token with custom data
    const payload = { userId: "789", data: { permissions: ["read"] } };
    const token = cookieToken.sign(payload, { jwtid: "test-id" });

    // Refresh token
    const refreshed = cookieToken.refresh(token, {
      verify: {},
      jwtid: "new-id"
    });

    // Verify refreshed token
    const verified = cookieToken.verify(refreshed);
    expect(verified.userId).toBe(payload.userId);
    expect(verified.data).toEqual(payload.data);
    expect(verified.jti).toBe("new-id");
  });

  it("should create tokens with custom options", async () => {
    const cookieToken = (await import("#utils/cookie-token.js")).default;

    const payload = { userId: "456", role: "user" };
    const customOptions = { jwtid: "custom-id", audience: "test-audience" };
    const token = cookieToken.sign(payload, customOptions);

    const verified = cookieToken.verify(token);
    expect(verified.userId).toBe(payload.userId);
    expect(verified.jti).toBe("custom-id");
    expect(verified.aud).toBe("test-audience");
  });

  it("should throw error on invalid token verification", async () => {
    const cookieToken = (await import("#utils/cookie-token.js")).default;

    const invalidToken = "invalid.token.format";

    // Should throw an error when verifying an invalid token
    expect(() => {
      cookieToken.verify(invalidToken);
    }).toThrow();
  });
});

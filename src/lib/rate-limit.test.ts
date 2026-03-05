import { checkRateLimit, getClientId } from "./rate-limit";

describe("rate-limit", () => {
  describe("getClientId", () => {
    it("uses x-forwarded-for first segment", () => {
      const req = new Request("https://example.com", {
        headers: { "x-forwarded-for": " 1.2.3.4 , 5.6.7.8 " },
      });
      expect(getClientId(req)).toBe("1.2.3.4");
    });

    it("uses x-real-ip when x-forwarded-for missing", () => {
      const req = new Request("https://example.com", {
        headers: { "x-real-ip": " 10.0.0.1 " },
      });
      expect(getClientId(req)).toBe("10.0.0.1");
    });

    it("returns unknown when no IP headers", () => {
      const req = new Request("https://example.com");
      expect(getClientId(req)).toBe("unknown");
    });
  });

  describe("checkRateLimit", () => {
    it("allows first 5 requests for a key", () => {
      const key = "test-key-" + Date.now();
      expect(checkRateLimit(key)).toBe(true);
      expect(checkRateLimit(key)).toBe(true);
      expect(checkRateLimit(key)).toBe(true);
      expect(checkRateLimit(key)).toBe(true);
      expect(checkRateLimit(key)).toBe(true);
    });

    it("rejects 6th request within window", () => {
      const key = "test-key-over-" + Date.now();
      for (let i = 0; i < 5; i++) {
        checkRateLimit(key);
      }
      expect(checkRateLimit(key)).toBe(false);
    });

    it("allows different keys independently", () => {
      const keyA = "key-a-" + Date.now();
      const keyB = "key-b-" + Date.now();
      for (let i = 0; i < 5; i++) {
        checkRateLimit(keyA);
      }
      expect(checkRateLimit(keyA)).toBe(false);
      expect(checkRateLimit(keyB)).toBe(true);
    });
  });
});

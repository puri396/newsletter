/**
 * Tests for POST /api/subscribe: validation, honeypot, duplicate, success.
 */
import { POST } from "../route";

const mockSubscriber = {
  id: "sub-1",
  email: "existing@example.com",
  name: null,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
  unsubscribedAt: null,
  meta: null,
};

const mockFindUnique = jest.fn();
const mockCreate = jest.fn();

jest.mock("../../../../lib/db", () => ({
  prisma: {
    subscriber: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

const mockCheckRateLimit = jest.fn().mockReturnValue(true);
jest.mock("../../../../lib/rate-limit", () => ({
  getClientId: () => "test-client",
  checkRateLimit: (key: string) => mockCheckRateLimit(key),
}));

jest.mock("../../../../lib/logger", () => ({ log: jest.fn() }));

function jsonRequest(body: unknown): Request {
  return new Request("https://example.com/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/subscribe", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
    mockCreate.mockReset();
    mockCheckRateLimit.mockReturnValue(true);
  });

  it("returns 429 when rate limit exceeded", async () => {
    mockCheckRateLimit.mockReturnValue(false);
    const res = await POST(jsonRequest({ email: "any@example.com" }));
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toContain("Too many");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("returns 400 when email is missing", async () => {
    const res = await POST(jsonRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Email");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when email is invalid", async () => {
    const res = await POST(jsonRequest({ email: "not-an-email" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when honeypot (website) is filled", async () => {
    const res = await POST(
      jsonRequest({ email: "good@example.com", website: "https://spam.com" }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid request.");
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 200 when already subscribed", async () => {
    mockFindUnique.mockResolvedValue(mockSubscriber);
    const res = await POST(
      jsonRequest({ email: "existing@example.com" }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Already subscribed.");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 201 and creates subscriber when new", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      ...mockSubscriber,
      email: "new@example.com",
    });
    const res = await POST(
      jsonRequest({ email: "new@example.com", name: "Jane" }),
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.message).toBe("Subscribed successfully.");
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        email: "new@example.com",
        name: "Jane",
        phone: null,
        whatsappOptIn: false,
        status: "active",
      },
    });
  });

  it("returns 400 when whatsappOptIn is true but phone is missing", async () => {
    mockFindUnique.mockResolvedValue(null);
    const res = await POST(
      jsonRequest({ email: "new@example.com", whatsappOptIn: true }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Phone");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when phone is invalid E.164", async () => {
    mockFindUnique.mockResolvedValue(null);
    const res = await POST(
      jsonRequest({
        email: "new@example.com",
        phone: "short",
        whatsappOptIn: true,
      }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/phone|digit|country/i);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 201 and creates subscriber with phone and whatsappOptIn when valid", async () => {
    mockFindUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    mockCreate.mockResolvedValue({
      ...mockSubscriber,
      email: "new@example.com",
      phone: "+15551234567",
      whatsappOptIn: true,
    });
    const res = await POST(
      jsonRequest({
        email: "new@example.com",
        name: "Jane",
        phone: "+1 555 123 4567",
        whatsappOptIn: true,
      }),
    );
    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        email: "new@example.com",
        name: "Jane",
        phone: "+15551234567",
        whatsappOptIn: true,
        status: "active",
      },
    });
  });
});

/**
 * Integration test: Create newsletter (draft) then schedule it.
 * Verifies state transition draft → scheduled via API route handlers with mocked Prisma.
 */
import { POST as createNewsletter } from "../route";
import { POST as scheduleNewsletter } from "../[id]/schedule/route";

const mockNewsletter = {
  id: "news-1",
  subject: "Test",
  body: "Body",
  description: null,
  status: "draft" as const,
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSchedule = {
  id: "sched-1",
  newsletterId: "news-1",
  sendAt: new Date(Date.now() + 86400000),
  status: "pending" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  errorMessage: null,
};

const mockCreate = jest.fn().mockResolvedValue(mockNewsletter);
const mockFindUnique = jest.fn();
const mockScheduleCreate = jest.fn().mockResolvedValue(mockSchedule);
const mockNewsletterUpdate = jest.fn().mockResolvedValue({ ...mockNewsletter, status: "scheduled" });
const mockTransaction = jest.fn().mockImplementation((arg: unknown) => {
  if (Array.isArray(arg)) {
    return Promise.all(arg.map((p: Promise<unknown>) => p));
  }
  return Promise.resolve(arg);
});

jest.mock("../../../../lib/db", () => ({
  prisma: {
    newsletter: {
      create: (...args: unknown[]) => mockCreate(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockNewsletterUpdate(...args),
    },
    schedule: {
      create: (...args: unknown[]) => mockScheduleCreate(...args),
    },
    $transaction: (arg: unknown) => mockTransaction(arg),
  },
}));

jest.mock("../../../../lib/logger", () => ({ log: jest.fn() }));

describe("Create newsletter and schedule (integration)", () => {
  beforeEach(() => {
    mockCreate.mockClear();
    mockFindUnique.mockClear();
    mockScheduleCreate.mockClear();
    mockNewsletterUpdate.mockClear();
    mockTransaction.mockClear();
    mockCreate.mockResolvedValue(mockNewsletter);
    mockFindUnique.mockResolvedValue({
      id: "news-1",
      status: "draft",
      schedules: [],
    });
    mockTransaction.mockImplementation((arg: unknown) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg.map((p: Promise<unknown>) => p));
      }
      return Promise.resolve(arg);
    });
  });

  it("creates draft then schedule returns 201 and newsletter becomes scheduled", async () => {
    const createRes = await createNewsletter(
      new Request("http://localhost/api/newsletters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "Test",
          body: "Body",
          status: "draft",
        }),
      }),
    );
    expect(createRes.status).toBe(201);
    const createJson = await createRes.json();
    expect(createJson.data).toBeDefined();
    expect(createJson.data.id).toBe("news-1");
    expect(createJson.data.status).toBe("draft");

    const sendAt = new Date(Date.now() + 86400000).toISOString();
    const scheduleRes = await scheduleNewsletter(
      new Request("http://localhost/api/newsletters/news-1/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendAt }),
      }),
      { params: Promise.resolve({ id: "news-1" }) },
    );
    expect(scheduleRes.status).toBe(201);
    const scheduleJson = await scheduleRes.json();
    expect(scheduleJson.data).toBeDefined();
    expect(scheduleJson.data.id).toBe("sched-1");
    expect(mockNewsletterUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "news-1" },
        data: { status: "scheduled" },
      }),
    );
  });
});

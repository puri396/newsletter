import { generateNewsletterDraft } from "./generate-newsletter";

const mockCreate = jest.fn();

jest.mock("./gemini-client", () => ({
  getGeminiClient: () => null,
}));
jest.mock("./client", () => ({
  getOpenAIClient: () => ({
    chat: {
      completions: {
        create: (...args: unknown[]) => mockCreate(...args),
      },
    },
  }),
}));

describe("generateNewsletterDraft", () => {
  beforeEach(() => {
    mockCreate.mockClear();
  });

  it("returns structured draft when AI returns valid JSON", async () => {
    const validOutput = {
      title: "Test Title",
      description: "A short summary.",
      body: "Paragraph one.\n\nParagraph two.",
      keyPoints: ["Point A", "Point B"],
    };
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(validOutput) } }],
    });

    const result = await generateNewsletterDraft({
      topic: "AI",
      tone: "professional",
      targetAudience: "developers",
    });

    expect(result).toEqual({
      title: "Test Title",
      description: "A short summary.",
      body: "Paragraph one.\n\nParagraph two.",
      keyPoints: ["Point A", "Point B"],
    });
  });

  it("uses Untitled and empty body when title/body missing", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: "",
              description: "Desc",
              body: "",
              keyPoints: [],
            }),
          },
        },
      ],
    });

    const result = await generateNewsletterDraft({
      topic: "X",
      tone: "casual",
      targetAudience: "all",
    });

    expect(result.title).toBe("Untitled");
    expect(result.body).toBe("");
    expect(result.keyPoints).toEqual([]);
  });

  it("throws when AI returns invalid JSON", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "not valid json {" } }],
    });

    await expect(
      generateNewsletterDraft({
        topic: "T",
        tone: "t",
        targetAudience: "a",
      }),
    ).rejects.toThrow();
  });

  it("throws when AI returns empty content", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "" } }],
    });

    await expect(
      generateNewsletterDraft({
        topic: "T",
        tone: "t",
        targetAudience: "a",
      }),
    ).rejects.toThrow(/empty|invalid/);
  });

  it("returns defaults when AI returns array (non-object)", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '["array"]' } }],
    });

    const result = await generateNewsletterDraft({
      topic: "T",
      tone: "t",
      targetAudience: "a",
    });

    expect(result.title).toBe("Untitled");
    expect(result.body).toBe("");
  });

  it("filters keyPoints to strings only", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: "T",
              description: "D",
              body: "B",
              keyPoints: ["ok", 1, null, "yes"],
            }),
          },
        },
      ],
    });

    const result = await generateNewsletterDraft({
      topic: "T",
      tone: "t",
      targetAudience: "a",
    });

    expect(result.keyPoints).toEqual(["ok", "yes"]);
  });
});

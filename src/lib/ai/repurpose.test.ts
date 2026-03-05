import { generateRepurposeContent } from "./repurpose";

const mockCreate = jest.fn();

jest.mock("./client", () => ({
  getOpenAIClient: () => ({
    chat: {
      completions: {
        create: (...args: unknown[]) => mockCreate(...args),
      },
    },
  }),
}));

describe("generateRepurposeContent", () => {
  beforeEach(() => {
    mockCreate.mockClear();
  });

  it("returns structured output when AI returns valid JSON", async () => {
    const valid = {
      reelScript: "Script here",
      hooks: ["Hook 1", "Hook 2"],
      ctas: ["CTA 1"],
      linkedin: "LinkedIn caption",
      twitter: "Twitter caption",
      instagram: "Instagram caption",
      hashtags: ["#tag1", "#tag2"],
    };
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(valid) } }],
    });

    const result = await generateRepurposeContent({
      newsletterBody: "Some newsletter body.",
    });

    expect(result.reelScript).toBe("Script here");
    expect(result.hooks).toEqual(["Hook 1", "Hook 2"]);
    expect(result.hashtags).toEqual(["#tag1", "#tag2"]);
  });

  it("throws when AI returns invalid JSON", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "not json" } }],
    });

    await expect(
      generateRepurposeContent({ newsletterBody: "Body" }),
    ).rejects.toThrow();
  });

  it("throws when AI returns empty content", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "" } }],
    });

    await expect(
      generateRepurposeContent({ newsletterBody: "Body" }),
    ).rejects.toThrow(/empty|invalid/);
  });
});

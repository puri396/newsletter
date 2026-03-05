import { generateImagePrompts } from "./image-prompts";

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

describe("generateImagePrompts", () => {
  beforeEach(() => {
    mockCreate.mockClear();
  });

  it("returns imagePrompts array when AI returns valid JSON", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              imagePrompts: ["Prompt one", "Prompt two"],
            }),
          },
        },
      ],
    });

    const result = await generateImagePrompts({
      newsletterBody: "Some body.",
    });

    expect(result.imagePrompts).toEqual(["Prompt one", "Prompt two"]);
  });

  it("filters non-strings from imagePrompts", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              imagePrompts: ["Ok", 1, null, "Yes"],
            }),
          },
        },
      ],
    });

    const result = await generateImagePrompts({
      newsletterBody: "Body",
    });

    expect(result.imagePrompts).toEqual(["Ok", "Yes"]);
  });

  it("throws when AI returns invalid JSON", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "not json" } }],
    });

    await expect(
      generateImagePrompts({ newsletterBody: "Body" }),
    ).rejects.toThrow();
  });

  it("throws when AI returns empty content", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "" } }],
    });

    await expect(
      generateImagePrompts({ newsletterBody: "Body" }),
    ).rejects.toThrow(/empty|invalid/);
  });
});

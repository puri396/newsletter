const ENV_KEY = "OPENAI_API_KEY";

describe("getOpenAIClient", () => {
  const original = process.env[ENV_KEY];

  afterEach(() => {
    if (original !== undefined) process.env[ENV_KEY] = original;
    else delete process.env[ENV_KEY];
    jest.resetModules();
  });

  it("throws when OPENAI_API_KEY is missing", async () => {
    process.env[ENV_KEY] = "";
    jest.resetModules();
    const { getOpenAIClient } = await import("./client");
    expect(() => getOpenAIClient()).toThrow(/OPENAI_API_KEY/);
  });

  it("throws when OPENAI_API_KEY is not set", async () => {
    delete process.env[ENV_KEY];
    jest.resetModules();
    const { getOpenAIClient } = await import("./client");
    expect(() => getOpenAIClient()).toThrow(/OPENAI_API_KEY/);
  });

  it("returns a client when OPENAI_API_KEY is set", async () => {
    process.env[ENV_KEY] = "sk-test-key";
    jest.resetModules();
    const { getOpenAIClient } = await import("./client");
    const client = getOpenAIClient();
    expect(client).toBeDefined();
    expect(typeof (client as { chat?: unknown }).chat).toBe("object");
  });
});

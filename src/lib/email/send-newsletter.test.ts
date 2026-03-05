import { sendNewsletterEmail } from "./send-newsletter";
import type { SendNewsletterEmailParams } from "./types";

const mockSend = jest.fn();
const mockRender = jest.fn();

jest.mock("./provider-resend", () => ({
  resendProvider: { send: (...args: unknown[]) => mockSend(...args) },
  getFromEmail: () => "from@test.com",
}));

jest.mock("./render-newsletter", () => ({
  renderNewsletterToHtml: (...args: unknown[]) => mockRender(...args),
}));

jest.mock("../logger", () => ({
  log: jest.fn(),
}));

const baseParams: SendNewsletterEmailParams = {
  newsletter: {
    id: "n1",
    subject: "Test",
    description: null,
    body: "Body",
  },
  subscriber: {
    id: "s1",
    email: "to@test.com",
    name: null,
  },
};

describe("sendNewsletterEmail", () => {
  beforeEach(() => {
    mockSend.mockClear();
    mockRender.mockClear();
    mockRender.mockResolvedValue({ html: "<p>Hi</p>", text: "Hi" });
  });

  it("sends with correct payload and returns success when provider succeeds", async () => {
    mockSend.mockResolvedValue({ id: "msg-123" });

    const result = await sendNewsletterEmail(baseParams);

    expect(result).toEqual({ success: true, messageId: "msg-123" });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      from: "from@test.com",
      to: "to@test.com",
      subject: "Test",
      html: "<p>Hi</p>",
      text: "Hi",
    });
  });

  it("returns error when provider throws", async () => {
    mockSend.mockRejectedValue(new Error("Provider failed"));

    const result = await sendNewsletterEmail(baseParams);

    expect(result).toEqual({ success: false, error: "Provider failed" });
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("succeeds on retry when first call throws and second succeeds", async () => {
    mockSend
      .mockRejectedValueOnce(new Error("Temporary failure"))
      .mockResolvedValueOnce({ id: "msg-retry" });

    const result = await sendNewsletterEmail(baseParams);

    expect(result).toEqual({ success: true, messageId: "msg-retry" });
    expect(mockSend).toHaveBeenCalledTimes(2);
  });
});

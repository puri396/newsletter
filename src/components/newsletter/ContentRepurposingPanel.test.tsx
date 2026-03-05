/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ContentRepurposingPanel } from "./ContentRepurposingPanel";

describe("ContentRepurposingPanel", () => {
  it("renders heading and description", () => {
    render(<ContentRepurposingPanel newsletterBody="" />);
    expect(screen.getByText("Content Repurposing")).toBeInTheDocument();
    expect(
      screen.getByText(/reel script, hooks, CTAs, and platform captions/i),
    ).toBeInTheDocument();
  });

  it("shows message when newsletter body is empty", () => {
    render(<ContentRepurposingPanel newsletterBody="" />);
    expect(
      screen.getByText(/no body to repurpose|add content above first/i),
    ).toBeInTheDocument();
  });

  it("shows Generate repurposed content button when body is non-empty", () => {
    render(<ContentRepurposingPanel newsletterBody="Some content here." />);
    expect(
      screen.getByRole("button", { name: /generate repurposed content/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate image prompts/i }),
    ).toBeInTheDocument();
  });

  it("calls POST /api/ai/repurpose on generate and shows loading then content or error", async () => {
    const mockRepurpose = {
      reelScript: "Script",
      hooks: ["Hook 1"],
      ctas: ["CTA"],
      linkedin: "LI",
      twitter: "TW",
      instagram: "IG",
      hashtags: ["#x"],
    };
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockRepurpose,
    } as Response);
    render(<ContentRepurposingPanel newsletterBody="Newsletter body." />);
    fireEvent.click(screen.getByRole("button", { name: /generate repurposed content/i }));
    expect(screen.getByRole("button", { name: /generating/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/ai/repurpose",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
    });
    await waitFor(() => {
      expect(screen.getByText("Reel script")).toBeInTheDocument();
    });
    fetchSpy.mockRestore();
  });

  it("shows error when repurpose API fails", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: "API error" } }),
    } as Response);
    render(<ContentRepurposingPanel newsletterBody="Body." />);
    fireEvent.click(screen.getByRole("button", { name: /generate repurposed content/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/API error|failed/i);
    });
  });
});

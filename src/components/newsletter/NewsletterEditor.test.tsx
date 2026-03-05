/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NewsletterEditor } from "./NewsletterEditor";

describe("NewsletterEditor", () => {
  it("renders main fields and Generate with AI section", () => {
    render(<NewsletterEditor />);
    expect(screen.getByLabelText(/title|headline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/summary|description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/body/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByText("Generate with AI")).toBeInTheDocument();
    expect(screen.getByLabelText(/topic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target audience/i)).toBeInTheDocument();
  });

  it("updates title in preview when typing", () => {
    render(<NewsletterEditor />);
    const titleInput = screen.getByLabelText(/title|headline/i);
    fireEvent.change(titleInput, { target: { value: "My Newsletter" } });
    expect(screen.getByText("My Newsletter")).toBeInTheDocument();
  });

  it("shows validation errors and does not submit when required fields are empty", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({ ok: true } as Response);
    render(<NewsletterEditor />);
    const submitButton = screen.getByRole("button", { name: /save draft/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText("Title is required.")).toBeInTheDocument();
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("submits POST to /api/newsletters with valid data", async () => {
    const mockData = {
      data: {
        id: "1",
        subject: "Test",
        description: null,
        body: "Body",
        status: "draft",
        tags: [],
        createdAt: "",
        updatedAt: "",
      },
    };
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);
    render(<NewsletterEditor />);
    fireEvent.change(screen.getByLabelText(/title|headline/i), {
      target: { value: "Test Title" },
    });
    fireEvent.change(screen.getByLabelText(/body/i), {
      target: { value: "Test body content" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save draft/i }));
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/newsletters",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
    });
    const callBody = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
    expect(callBody.subject).toBe("Test Title");
    expect(callBody.body).toBe("Test body content");
    fetchSpy.mockRestore();
  });

  it("shows error and no request when Generate Draft is clicked without topic/tone/audience", async () => {
    const fetchSpy = jest.spyOn(global, "fetch");
    render(<NewsletterEditor />);
    fireEvent.click(screen.getByRole("button", { name: /generate draft/i }));
    await waitFor(() => {
      expect(screen.getByText(/topic, tone, and target audience are required/i)).toBeInTheDocument();
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("shows loading state when generating draft", async () => {
    jest.spyOn(global, "fetch").mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ title: "T", description: "", body: "", keyPoints: [] }),
              } as Response),
            100,
          );
        }),
    );
    render(<NewsletterEditor />);
    fireEvent.change(screen.getByLabelText(/topic/i), { target: { value: "AI" } });
    fireEvent.change(screen.getByLabelText(/target audience/i), {
      target: { value: "Developers" },
    });
    fireEvent.click(screen.getByRole("button", { name: /generate draft/i }));
    expect(screen.getByRole("button", { name: /generating/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /generate draft/i })).toBeInTheDocument();
    });
  });
});

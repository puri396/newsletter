import "@testing-library/jest-dom";

if (typeof globalThis.fetch === "undefined") {
  (globalThis as { fetch?: unknown }).fetch = jest.fn();
}

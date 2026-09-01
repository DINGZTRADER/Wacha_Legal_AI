import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ConciergePanel } from "./concierge-panel";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

class FakeSpeechRecognition {
  static instance: FakeSpeechRecognition | null = null;
  continuous = false;
  interimResults = false;
  lang = "";
  onstart: (() => void) | null = null;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn(() => this.onstart?.());
  stop = vi.fn(() => this.onend?.());

  constructor() {
    FakeSpeechRecognition.instance = this;
  }

  emitResult(transcript: string) {
    this.onresult?.({ results: [{ 0: { transcript } }] });
  }
}

beforeEach(() => {
  vi.stubGlobal("SpeechRecognition", FakeSpeechRecognition);
  vi.stubGlobal("webkitSpeechRecognition", undefined);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ConciergePanel voice intake", () => {
  test("puts a browser transcript into the story box and lets the user stop listening", async () => {
    const user = userEvent.setup();
    render(<ConciergePanel />);

    await user.click(screen.getByRole("button", { name: /speak your situation/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/listening/i);

    await act(async () => {
      FakeSpeechRecognition.instance?.emitResult("My landlord locked me out of my home.");
    });
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: /describe your situation/i })).toHaveValue(
        "My landlord locked me out of my home.",
      ),
    );

    await user.click(screen.getByRole("button", { name: /stop listening/i }));
    expect(FakeSpeechRecognition.instance?.stop).toHaveBeenCalledOnce();
    expect(screen.getByRole("status")).toHaveTextContent(/stopped/i);
  });

  test("explains the typed fallback when speech input is unavailable", async () => {
    vi.stubGlobal("SpeechRecognition", undefined);
    const user = userEvent.setup();
    render(<ConciergePanel />);

    await user.click(screen.getByRole("button", { name: /speak your situation/i }));

    expect(screen.getByRole("status")).toHaveTextContent(/not available/i);
    expect(screen.getByRole("textbox", { name: /describe your situation/i })).toBeEnabled();
  });
});

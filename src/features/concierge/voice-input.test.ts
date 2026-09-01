import { describe, expect, test, vi } from "vitest";
import {
  getSpeechRecognitionConstructor,
  transcriptFromSpeechEvent,
  type SpeechRecognitionConstructor,
} from "./voice-input";

const Recognition = vi.fn() as unknown as SpeechRecognitionConstructor;

describe("browser voice input helpers", () => {
  test("prefers the standard speech recognition constructor and supports webkit fallback", () => {
    const webkitOnly = { webkitSpeechRecognition: Recognition };
    expect(getSpeechRecognitionConstructor({ SpeechRecognition: Recognition, ...webkitOnly })).toBe(Recognition);
    expect(getSpeechRecognitionConstructor(webkitOnly)).toBe(Recognition);
    expect(getSpeechRecognitionConstructor({})).toBeNull();
  });

  test("combines final and interim browser results without losing earlier words", () => {
    expect(
      transcriptFromSpeechEvent({
        resultIndex: 1,
        results: [
          { 0: { transcript: "My landlord" } },
          { 0: { transcript: "locked me out" } },
        ],
      }),
    ).toBe("My landlord locked me out");
  });
});

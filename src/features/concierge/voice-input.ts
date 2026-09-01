export interface SpeechRecognitionResultLike {
  0?: { transcript?: string };
}

export interface SpeechRecognitionEventLike {
  resultIndex?: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

export interface SpeechRecognitionErrorLike {
  error?: string;
}

export interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort?: () => void;
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionWindow = {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export function getSpeechRecognitionConstructor(
  scope?: SpeechRecognitionWindow,
): SpeechRecognitionConstructor | null {
  const target = scope ?? (typeof window !== "undefined" ? (window as SpeechRecognitionWindow) : undefined);
  return target?.SpeechRecognition ?? target?.webkitSpeechRecognition ?? null;
}

export function transcriptFromSpeechEvent(event: SpeechRecognitionEventLike): string {
  const parts: string[] = [];

  for (let index = 0; index < event.results.length; index += 1) {
    const transcript = event.results[index]?.[0]?.transcript?.trim();
    if (transcript) parts.push(transcript);
  }

  return parts.join(" ");
}

import { useEffect, useRef, useState } from "react";

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    [index: number]: { isFinal: boolean; 0: { transcript: string } };
    length: number;
  };
};

type SpeechRecognitionErrorEvent = {
  error: string;
  message?: string;
};

export function useSpeechToText(onFinal: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interim, setInterim] = useState("");

  const recognitionRef = useRef<any>(null);
  const onFinalRef = useRef(onFinal);
  const interimRef = useRef("");

  onFinalRef.current = onFinal;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => setIsListening(true);

    rec.onend = () => {
      setIsListening(false);
      if (interimRef.current.trim()) {
        onFinalRef.current(interimRef.current.trim());
        setInterim("");
        interimRef.current = "";
      }
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let finalChunk = "";
      let interimChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += transcript;
        } else {
          interimChunk += transcript;
        }
      }

      if (finalChunk) {
        onFinalRef.current(finalChunk.trim());
        setInterim("");
        interimRef.current = "";
      } else {
        setInterim(interimChunk);
        interimRef.current = interimChunk;
      }
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        setError("Microphone permission was denied.");
      } else if (event.error === "no-speech") {
        // Ignore short silences; the user can stop manually.
      } else {
        setError("Voice input failed. Please try again.");
      }
      setIsListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      try {
        rec.stop();
      } catch {
        // Recognition may already be stopped.
      }
    };
  }, []);

  function toggleListening() {
    const rec = recognitionRef.current;
    if (!rec) {
      setError("Voice input is not available on this device.");
      return;
    }

    if (isListening) {
      rec.stop();
    } else {
      setError(null);
      try {
        rec.start();
      } catch {
        setError("Voice input failed. Please try again.");
      }
    }
  }

  function clearError() {
    setError(null);
  }

  const displayInterim = notesWithInterim(notes, interim);

  return {
    isListening,
    supported,
    error,
    interim: displayInterim,
    toggleListening,
    clearError,
  };
}

function notesWithInterim(notes: string, interim: string): string {
  if (!interim) return notes;
  const base = notes.trim();
  return base ? `${base} ${interim}` : interim;
}

import { useEffect, useRef, useState } from "react";

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    [index: number]: { isFinal: boolean; 0: { transcript: string } } | undefined;
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
  const mountedRef = useRef(true);

  onFinalRef.current = onFinal;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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

    const safeSetIsListening = (value: boolean) => {
      if (mountedRef.current) setIsListening(value);
    };
    const safeSetInterim = (value: string) => {
      if (mountedRef.current) setInterim(value);
    };
    const safeSetError = (value: string | null) => {
      if (mountedRef.current) setError(value);
    };

    rec.onstart = () => safeSetIsListening(true);

    rec.onend = () => {
      safeSetIsListening(false);
      if (interimRef.current.trim()) {
        onFinalRef.current(interimRef.current.trim());
      }
      interimRef.current = "";
      safeSetInterim("");
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let finalChunk = "";
      let interimChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result) continue;
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalChunk += transcript;
        } else {
          interimChunk += transcript;
        }
      }

      if (finalChunk) {
        onFinalRef.current(finalChunk.trim());
        interimRef.current = "";
        safeSetInterim("");
      } else {
        interimRef.current = interimChunk;
        safeSetInterim(interimChunk);
      }
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        safeSetError("Microphone permission was denied.");
      } else if (event.error === "no-speech") {
        // Ignore short silences; the user can stop manually.
      } else {
        safeSetError("Voice input failed. Please try again.");
      }
      safeSetIsListening(false);
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

  return {
    isListening,
    supported,
    error,
    interim,
    toggleListening,
    clearError,
  };
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkle, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar, type CueTab } from "@/components/cue/Sidebar";
import { GlassCard } from "@/components/cue/Glass";
import { MissionControl } from "@/components/cue/MissionControl";
import { FloatingChat, type ChatMessage } from "@/components/cue/FloatingChat";
import { useSpeechToText } from "@/hooks/use-speech-to-text";
import { askCue } from "@/lib/cue-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cue — Paste your chaos. Get your clarity." },
      {
        name: "description",
        content:
          "Cue turns messy notes, tasks and links into an executive summary, action items and key decisions.",
      },
      { property: "og:title", content: "Cue — Paste your chaos. Get your clarity." },
      {
        property: "og:description",
        content:
          "Cue turns messy notes, tasks and links into an executive summary, action items and key decisions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CuePage,
});

const STORAGE_KEY = "cue.mission-control";
const CHAT_KEY = "cue.chat";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function CuePage() {
  const [tab, setTab] = useState<CueTab>("dashboard");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [hello, setHello] = useState("Hello");

  const {
    isListening,
    interim,
    supported: voiceSupported,
    error: voiceError,
    toggleListening,
    clearError,
  } = useSpeechToText((chunk) => {
    setNotes((prev) => {
      const base = prev.trim();
      return base ? `${base} ${chunk}` : chunk;
    });
  });

  const displayNotes = useMemo(() => {
    if (!interim) return notes;
    const base = notes.trim();
    return base ? `${base} ${interim}` : interim;
  }, [notes, interim]);


  // Restore persisted output — never cleared on unmount.
  // The input itself is never persisted: it lives only in React state and
  // any browser form-restoration value is discarded on mount.
  useEffect(() => {
    setNotes("");
    localStorage.removeItem("cue.notes");
    sessionStorage.removeItem("cue.notes");
  }, []);

  useEffect(() => {
    setResult(localStorage.getItem(STORAGE_KEY) ?? "");
    try {
      setMessages(JSON.parse(localStorage.getItem(CHAT_KEY) ?? "[]") as ChatMessage[]);
    } catch {
      setMessages([]);
    }
    setHello(greeting());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, result);
  }, [result, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  }, [messages, hydrated]);

  useEffect(() => {
    if (tab === "chat") setChatOpen(true);
  }, [tab]);

  async function runCue() {
    if (!notes.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const content = await askCue({ mode: "summary", input: notes });
      setResult(content);
      setNotes("");
      setTab("summary");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cue could not complete this run.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      <Sidebar active={tab} onSelect={setTab} />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-10">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold sm:text-4xl">Cue</h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                {hello}, Olwethu
              </p>
            </div>
          </header>

          <GlassCard className="p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Paste your chaos. Get your clarity.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Drop your notes, ideas, tasks, links or questions...
            </p>
            <div className="relative mt-5">
              <textarea
                value={displayNotes}
                onChange={(e) => setNotes(e.target.value)}
                readOnly={isListening}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                name="cue-notes"
                id="cue-notes"
                rows={8}
                placeholder="Meeting notes, brain dumps, half-formed plans…"
                className="w-full resize-y rounded-2xl border border-white/70 bg-white/65 p-4 pr-12 text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => {
                  clearError();
                  toggleListening();
                }}
                disabled={!voiceSupported}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
                className={cn(
                  "absolute right-3 top-3 inline-flex items-center justify-center rounded-full p-2 transition",
                  isListening
                    ? "glow-active animate-pulse text-foreground"
                    : "glass-soft text-muted-foreground hover:text-foreground",
                  !voiceSupported && "cursor-not-allowed opacity-50",
                )}
              >
                <Mic className="h-5 w-5" aria-hidden />
              </button>
            </div>
            {voiceError && (
              <p className="mt-2 text-sm text-destructive">{voiceError}</p>
            )}
            {!voiceSupported && (
              <p className="mt-2 text-sm text-destructive">
                Voice input is not available on this device.
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-3">

              <button
                type="button"
                onClick={() => void runCue()}
                disabled={loading || !notes.trim()}
                className="btn-cue inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-55"
              >
                <Sparkle className="h-4 w-4" aria-hidden />
                {loading ? "Running Cue…" : "Run Cue"}
              </button>
              {result && (
                <button
                  type="button"
                  onClick={() => setChatOpen(true)}
                  className="glass-soft rounded-2xl px-4 py-3 text-sm font-medium"
                >
                  Ask about this
                </button>
              )}
            </div>
          </GlassCard>

          <MissionControl loading={loading} result={result} error={error} />
        </main>

        <footer className="px-4 pb-24 text-center sm:px-6">
          <p className="text-xs text-muted-foreground">
            AI generates suggestions, not decisions. Always review outputs for accuracy.
          </p>
        </footer>
      </div>

      <FloatingChat
        open={chatOpen}
        onOpenChange={setChatOpen}
        context={result}
        messages={messages}
        setMessages={(updater) => setMessages((prev) => updater(prev))}
      />
    </div>
  );
}

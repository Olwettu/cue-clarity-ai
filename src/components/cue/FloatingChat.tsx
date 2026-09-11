import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageSquare, X, Send } from "lucide-react";
import { askCue } from "@/lib/cue-api";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function FloatingChat({
  open,
  onOpenChange,
  context,
  messages,
  setMessages,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  context: string;
  messages: ChatMessage[];
  setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void;
}) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(() => next);
    setBusy(true);
    try {
      const reply = await askCue({ mode: "chat", context, messages: next });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: e instanceof Error ? e.message : "Something went wrong." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close Cue Assistant" : "Open Cue Assistant"}
        onClick={() => onOpenChange(!open)}
        className="glass btn-cue fixed right-5 bottom-5 z-50 grid h-14 w-14 place-items-center rounded-full active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {open && (
        <div className="glass fixed right-4 bottom-24 z-50 flex h-[70vh] w-[calc(100vw-2rem)] max-w-sm flex-col rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold">Cue Assistant</h3>
            <span className="text-[11px] text-muted-foreground">
              {context ? "Context loaded" : "No context yet"}
            </span>
          </div>

          <div className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Ask me anything about your notes, tasks or the latest Cue run.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl bg-lavender/80 px-3 py-2 text-sm"
                    : "max-w-[92%] rounded-2xl bg-white/60 px-3 py-2 text-sm"
                }
              >
                {m.role === "assistant" ? (
                  <div className="cue-prose text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
              </div>
            ))}
            {busy && (
              <div className="max-w-[60%] animate-pulse rounded-2xl bg-white/60 px-3 py-2 text-sm text-muted-foreground">
                Cue is thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            className="mt-3 flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Ask Cue…"
              className="max-h-28 flex-1 resize-none rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={busy}
              aria-label="Send message"
              className="btn-cue grid h-10 w-10 shrink-0 place-items-center rounded-2xl disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

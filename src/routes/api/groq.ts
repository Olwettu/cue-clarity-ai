import { createFileRoute } from "@tanstack/react-router";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b";

const SUMMARIZER_PROMPT =
  "You are a precision corporate assistant. Extract the following into a structured format: 1. A 3-bullet executive summary. 2. A table of Action Items (Task | Owner | Deadline | Priority). 3. Key Decisions made. If any detail is missing, label it as [Unknown] instead of making it up.";

const CHAT_PROMPT =
  "You are Cue, an AI Workplace Assistant. Use the provided context to answer the user's questions proactively.";

type Msg = { role: "user" | "assistant" | "system"; content: string };

type Body = {
  mode?: "summary" | "chat";
  input?: string;
  context?: string;
  messages?: Msg[];
};

export const Route = createFileRoute("/api/groq")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["GROQ_API_KEY"] ?? process.env["VITE_OPENAI_API_KEY"];
        if (!apiKey) {
          return Response.json(
            { error: "Cue is not connected to its AI provider yet. Add the Groq API key." },
            { status: 500 },
          );
        }

        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }

        const messages: Msg[] =
          body.mode === "chat"
            ? [
                {
                  role: "system",
                  content:
                    CHAT_PROMPT +
                    (body.context ? `\n\nContext from the user's latest Cue run:\n${body.context}` : ""),
                },
                ...(body.messages ?? []).slice(-20),
              ]
            : [
                { role: "system", content: SUMMARIZER_PROMPT },
                { role: "user", content: (body.input ?? "").slice(0, 20000) },
              ];

        const res = await fetch(GROQ_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ model: MODEL, messages, temperature: 0.3 }),
        });

        if (!res.ok) {
          const detail = await res.text();
          console.error("Groq error", res.status, detail);
          const message =
            res.status === 429
              ? "Rate limit reached. Please try again in a moment."
              : res.status === 401
                ? "The AI provider rejected the key. Please check the Groq API key."
                : "The AI provider could not complete this request.";
          return Response.json({ error: message }, { status: res.status });
        }

        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const content = data.choices?.[0]?.message?.content ?? "";
        return Response.json({ content });
      },
    },
  },
});

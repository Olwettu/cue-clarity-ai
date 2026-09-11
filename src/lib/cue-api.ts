type ChatMessage = { role: "user" | "assistant"; content: string };

export async function askCue(payload: {
  mode: "summary" | "chat";
  input?: string;
  context?: string;
  messages?: ChatMessage[];
}): Promise<string> {
  const res = await fetch("/api/groq", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as { content?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Cue could not reach the AI service.");
  return data.content ?? "";
}

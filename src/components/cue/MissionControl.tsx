import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GlassCard, Tag } from "./Glass";

type Section = { title: string; body: string; tag: string };

function tagFor(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("action")) return "Critical Path";
  if (t.includes("risk") || t.includes("block")) return "Blocking";
  if (t.includes("decision")) return "Decisions";
  return "Summary";
}

export function splitSections(markdown: string): Section[] {
  const lines = markdown.split("\n");
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const line of lines) {
    const heading = line.match(/^\s{0,3}(?:#{1,4}\s+|\*\*)?(?:\d+[.)]\s*)?([A-Za-z][^*#\n]{2,60})(?:\*\*)?\s*:?\s*$/);
    const isHeading = /^\s{0,3}(#{1,4}\s|\*\*.+\*\*\s*:?\s*$|\d+[.)]\s+[A-Z])/.test(line) && line.trim().length < 80;
    if (isHeading && heading) {
      const title = (heading[1] ?? "Section").replace(/\*\*/g, "").trim();
      current = { title, body: "", tag: tagFor(title) };
      sections.push(current);
    } else if (current) {
      current.body += line + "\n";
    } else if (line.trim()) {
      current = { title: "Overview", body: line + "\n", tag: "Summary" };
      sections.push(current);
    }
  }
  return sections.filter((s) => s.body.trim().length > 0);
}

function Skeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Generating clarity">
      {[0, 1, 2].map((i) => (
        <div key={i} className="glass-soft rounded-2xl p-5">
          <div className="h-4 w-32 animate-pulse rounded-full bg-white/70" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full animate-pulse rounded-full bg-white/60" />
            <div className="h-3 w-11/12 animate-pulse rounded-full bg-white/60" />
            <div className="h-3 w-8/12 animate-pulse rounded-full bg-white/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MissionControl({
  loading,
  result,
  error,
}: {
  loading: boolean;
  result: string;
  error: string;
}) {
  const sections = result ? splitSections(result) : [];

  return (
    <GlassCard className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold sm:text-2xl">Mission Control</h2>
        {result && !loading && <Tag label="Ready" />}
      </div>

      <div className="mt-5">
        {loading ? (
          <Skeleton />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : sections.length > 0 ? (
          <div className="space-y-4">
            {sections.map((s, i) => (
              <article key={`${s.title}-${i}`} className="glass-soft rounded-2xl p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-base font-semibold">{s.title}</h3>
                  <Tag label={s.tag} />
                </div>
                <div className="cue-prose text-sm leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.body}</ReactMarkdown>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Your executive summary, action items and key decisions will appear here.
          </p>
        )}
      </div>
    </GlassCard>
  );
}

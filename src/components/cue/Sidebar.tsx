import { useState } from "react";
import { LayoutDashboard, FileText, MessageSquare, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type CueTab = "dashboard" | "summary" | "chat";

const items: { id: CueTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "chat", label: "Chat", icon: MessageSquare },
];

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="glass grid h-9 w-9 place-items-center rounded-2xl font-display text-lg font-bold">
        C
      </span>
      <span className="font-display text-xl font-bold tracking-tight">Cue</span>
    </div>
  );
}

function NavList({
  active,
  onSelect,
}: {
  active: CueTab;
  onSelect: (t: CueTab) => void;
}) {
  return (
    <nav className="flex flex-col gap-2">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          aria-current={active === id ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all",
            active === id ? "glow-active" : "glass-soft hover:bg-white/60",
          )}
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl border border-white/70 bg-white/60">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          {label}
        </button>
      ))}
    </nav>
  );
}

export function Sidebar({
  active,
  onSelect,
}: {
  active: CueTab;
  onSelect: (t: CueTab) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile bar */}
      <div className="glass sticky top-0 z-40 flex items-center justify-between rounded-none px-4 py-3 lg:hidden">
        <Logo />
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="glass-soft grid h-10 w-10 place-items-center rounded-2xl"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="glass mx-4 mt-3 rounded-3xl p-3 lg:hidden">
          <NavList
            active={active}
            onSelect={(t) => {
              onSelect(t);
              setOpen(false);
            }}
          />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="glass sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-8 rounded-none p-5 lg:flex">
        <Logo />
        <NavList active={active} onSelect={onSelect} />
      </aside>
    </>
  );
}

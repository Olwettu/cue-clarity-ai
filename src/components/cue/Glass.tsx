import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("glass rounded-3xl", className)}>{children}</div>;
}

export function Tag({ label }: { label: string }) {
  const tone =
    label === "Blocking"
      ? "bg-peach/70"
      : label === "Critical Path"
        ? "bg-skyblue/70"
        : label === "Decisions"
          ? "bg-lavender/70"
          : "bg-paleyellow/80";
  return (
    <span
      className={cn(
        "rounded-full border border-white/70 px-3 py-1 text-[11px] font-medium tracking-wide uppercase",
        tone,
      )}
    >
      {label}
    </span>
  );
}

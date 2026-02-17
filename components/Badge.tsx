import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "default" | "solid" | "muted";
}

export default function Badge({ children, tone = "default" }: BadgeProps) {
  const toneClass =
    tone === "solid"
      ? "bg-white text-black"
      : tone === "muted"
        ? "bg-white/5 text-white/40 border border-white/5"
        : "border border-white/20 text-white/60";

  return (
    <span className={`inline-flex items-center px-4 py-1.5 font-polar text-[8px] font-bold uppercase tracking-[0.3em] ${toneClass}`}>
      {children}
    </span>
  );
}


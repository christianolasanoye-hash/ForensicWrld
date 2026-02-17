import { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function SectionHeader({ eyebrow, title, subtitle, actions }: SectionHeaderProps) {
  return (
    <div className="mb-20 pt-32">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1">
          {eyebrow ? (
            <div className="font-polar text-[10px] tracking-[0.5em] text-white/60 mb-4 uppercase border-l border-white/20 pl-4 py-1">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="text-6xl sm:text-8xl font-giants italic font-black uppercase tracking-tighter leading-none">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-8 max-w-2xl text-lg text-white/60 font-medium leading-relaxed uppercase tracking-wider">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}










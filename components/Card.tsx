import { ReactNode } from "react";

interface CardProps {
  title: string;
  desc?: string;
  children?: ReactNode;
  right?: ReactNode;
}

export default function Card({ title, desc, children, right }: CardProps) {
  return (
    <div className="border border-white/10 bg-black p-8 transition-all hover:border-white/20">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">{title}</h3>
          {desc ? <div className="text-xs uppercase tracking-widest text-white/40">{desc}</div> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {children ? <div className="text-sm text-white/60 leading-relaxed">{children}</div> : null}
    </div>
  );
}


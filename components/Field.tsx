import { ReactNode } from "react";

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export default function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="block mb-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-polar text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">{label}</span>
        {hint ? <span className="font-polar text-[8px] uppercase tracking-widest text-white/20">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}










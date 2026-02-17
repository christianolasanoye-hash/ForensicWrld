import { TextareaHTMLAttributes } from "react";

export default function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full border-b border-white/20 bg-transparent px-0 py-4 text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/40 focus:border-white focus:outline-none transition-all ${className}`}
    />
  );
}










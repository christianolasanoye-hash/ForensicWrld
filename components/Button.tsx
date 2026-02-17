import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  as?: "button" | "a";
}

export default function Button({ 
  children, 
  variant = "primary", 
  className = "",
  as = "button",
  ...props 
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center px-6 py-3 text-sm font-medium uppercase tracking-wider transition-all duration-300 focus:outline-none";
  const styles =
    variant === "primary"
      ? "bg-white text-black hover:bg-white/90 border border-white"
      : variant === "ghost"
      ? "bg-transparent text-white border border-white/30 hover:border-white hover:bg-white/10"
      : "border border-white/30 text-white hover:border-white hover:bg-white/10";
  
  const combinedClassName = `${base} ${styles} ${className}`;
  
  if (as === "a") {
    const anchorProps = props as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a className={combinedClassName} {...anchorProps}>
        {children}
      </a>
    );
  }
  
  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}


"use client";

import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  as?: "button" | "a";
  useTheme?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  as = "button",
  useTheme = false,
  style,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center px-6 py-3 text-sm font-medium uppercase tracking-wider transition-all duration-300 focus:outline-none";

  // Default styles (used in admin or when useTheme is false)
  const defaultStyles =
    variant === "primary"
      ? "bg-white text-black hover:bg-white/90 border border-white"
      : variant === "ghost"
      ? "bg-transparent text-white border border-white/30 hover:border-white hover:bg-white/10"
      : "border border-white/30 text-white hover:border-white hover:bg-white/10";

  // Theme-aware styles using CSS variables
  const themeStyles = useTheme
    ? {
        backgroundColor: variant === "primary" ? "var(--site-primary)" : "transparent",
        color: variant === "primary" ? "var(--site-secondary)" : "var(--site-text)",
        borderRadius: "var(--site-button-radius, 0px)",
        borderColor: variant === "primary" ? "var(--site-primary)" : "var(--site-border)",
        ...style,
      }
    : style;

  const combinedClassName = `${base} ${useTheme ? "border" : defaultStyles} ${className}`;

  if (as === "a") {
    const anchorProps = props as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a className={combinedClassName} style={themeStyles} {...anchorProps}>
        {children}
      </a>
    );
  }

  return (
    <button className={combinedClassName} style={themeStyles} {...props}>
      {children}
    </button>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { key: "/", label: "Home" },
  { key: "/film", label: "Film" },
  { key: "/photography", label: "Photography" },
  { key: "/social", label: "Social" },
  { key: "/events", label: "Events" },
  { key: "/blog", label: "Blog" },
  { key: "/merch", label: "Merch" },
  { key: "/model-team", label: "Model Team" },
  { key: "/connections", label: "Connections" },
  { key: "/intake", label: "Intake" },
];

export default function Nav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/5">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="group flex flex-col -gap-1 hover:opacity-80 transition-opacity"
            aria-label="Go to home"
          >
            <span className="font-giants text-2xl italic font-black uppercase tracking-tighter leading-none">FORENSIC</span>
            <span className="font-polar text-[10px] tracking-[0.4em] text-white/50 -mt-1">WRLD STUDIO</span>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            {navItems.slice(1, 8).map((it) => (
              <Link
                key={it.key}
                href={it.key}
                className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:text-white ${pathname === it.key
                  ? "text-white"
                  : "text-white/50"
                  }`}
              >
                {it.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/intake" className="hidden sm:block">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all">
                Book Intake
              </span>
            </Link>
            <button
              className="lg:hidden text-white/50 hover:text-white transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black pt-32 px-6 flex flex-col gap-8 lg:hidden">
          {navItems.map((it) => (
            <Link
              key={it.key}
              href={it.key}
              onClick={() => setIsOpen(false)}
              className={`text-4xl font-giants italic font-black uppercase tracking-tighter ${pathname === it.key ? "text-white" : "text-white/20"}`}
            >
              {it.label}
            </Link>
          ))}
          <Link
            href="/intake"
            onClick={() => setIsOpen(false)}
            className="mt-8 text-center text-xs font-bold uppercase tracking-[0.3em] bg-white text-black py-6"
          >
            Book Intake →
          </Link>
        </div>
      )}
    </>
  );
}


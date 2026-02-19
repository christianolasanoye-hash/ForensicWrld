"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";

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
  const supabase = getSupabaseClient();
  const [headerContent, setHeaderContent] = useState({
    header_brand_primary: "FORENSIC",
    header_brand_secondary: "WRLD STUDIO",
    header_cta_text: "Book Intake",
    header_cta_link: "/intake",
  });

  useEffect(() => {
    async function fetchHeaderContent() {
      const { data } = await supabase
        .from("site_content")
        .select("*")
        .in("key", [
          "header_brand_primary",
          "header_brand_secondary",
          "header_cta_text",
          "header_cta_link",
        ]);
      if (data) {
        const merged = { ...headerContent };
        data.forEach((item: { key: string; value: string }) => {
          merged[item.key as keyof typeof headerContent] = item.value;
        });
        setHeaderContent(merged);
      }
    }

    fetchHeaderContent();
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const { type, payload } = event.data || {};
      if (type !== "site_preview" || !payload?.content) return;

      setHeaderContent((prev) => ({
        header_brand_primary: payload.content.header_brand_primary ?? prev.header_brand_primary,
        header_brand_secondary: payload.content.header_brand_secondary ?? prev.header_brand_secondary,
        header_cta_text: payload.content.header_cta_text ?? prev.header_cta_text,
        header_cta_link: payload.content.header_cta_link ?? prev.header_cta_link,
      }));
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/5">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="group flex flex-col -gap-1 hover:opacity-80 transition-opacity"
            aria-label="Go to home"
          >
            <span className="font-giants text-2xl italic font-black uppercase tracking-tighter leading-none">
              {headerContent.header_brand_primary}
            </span>
            <span className="font-polar text-[10px] tracking-[0.4em] text-white/50 -mt-1">
              {headerContent.header_brand_secondary}
            </span>
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
            <Link href={headerContent.header_cta_link || "/intake"} className="hidden sm:block">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all">
                {headerContent.header_cta_text || "Book Intake"}
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
            href={headerContent.header_cta_link || "/intake"}
            onClick={() => setIsOpen(false)}
            className="mt-8 text-center text-xs font-bold uppercase tracking-[0.3em] bg-white text-black py-6"
          >
            {headerContent.header_cta_text || "Book Intake"} →
          </Link>
        </div>
      )}
    </>
  );
}

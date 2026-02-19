"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";

export default function Footer() {
  const supabase = getSupabaseClient();
  const [isPreview, setIsPreview] = useState(false);
  const [footerContent, setFooterContent] = useState({
    footer_tagline: "MANIFESTING THE NEXT ERA OF CULTURE THROUGH IMMERSIVE VISUALS AND STRATEGIC CREATIVE DIRECTION.",
    footer_location_1: "NYC",
    footer_location_2: "LDN",
    footer_location_3: "TYO",
    footer_copyright: "© {year} FORENSIC WRLD // ALL RIGHTS RESERVED // CONCEPT TO MANIFESTATION",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setIsPreview(params.get("preview") === "1");
    }

    async function fetchFooterContent() {
      const { data } = await supabase
        .from("site_content")
        .select("*")
        .in("key", [
          "footer_tagline",
          "footer_location_1",
          "footer_location_2",
          "footer_location_3",
          "footer_copyright",
        ]);
      if (data) {
        const merged = { ...footerContent };
        data.forEach((item: { key: string; value: string }) => {
          merged[item.key as keyof typeof footerContent] = item.value;
        });
        setFooterContent(merged);
      }
    }

    fetchFooterContent();
  }, []);

  const sendPreviewEdit = (key: string, value: string) => {
    if (!isPreview) return;
    window.parent?.postMessage(
      { type: "site_preview_edit", payload: { kind: "content", key, value } },
      window.location.origin
    );
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const { type, payload } = event.data || {};
      if (type !== "site_preview" || !payload?.content) return;

      setFooterContent((prev) => ({
        footer_tagline: payload.content.footer_tagline ?? prev.footer_tagline,
        footer_location_1: payload.content.footer_location_1 ?? prev.footer_location_1,
        footer_location_2: payload.content.footer_location_2 ?? prev.footer_location_2,
        footer_location_3: payload.content.footer_location_3 ?? prev.footer_location_3,
        footer_copyright: payload.content.footer_copyright ?? prev.footer_copyright,
      }));
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const copyrightText = footerContent.footer_copyright.replace(
    "{year}",
    new Date().getFullYear().toString()
  );

  return (
    <footer className="bg-black py-20 px-6 sm:px-12 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
          <div className="max-w-sm">
            <Link href="/" className="flex flex-col -gap-1 mb-8 opacity-50 hover:opacity-100 transition-opacity">
              <span className="font-giants text-2xl italic font-black uppercase tracking-tighter leading-none">FORENSIC</span>
              <span className="font-polar text-[10px] tracking-[0.4em] text-white/50 -mt-1">WRLD STUDIO</span>
            </Link>
            <p className="text-white/40 text-xs uppercase tracking-widest leading-relaxed">
              <span
                contentEditable={isPreview}
                suppressContentEditableWarning
                onBlur={(e) => sendPreviewEdit("footer_tagline", e.currentTarget.innerText)}
              >
                {footerContent.footer_tagline}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <span className="font-polar text-[10px] tracking-widest text-white/20 uppercase mb-2">Navigation</span>
              <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Home</Link>
              <Link href="/film" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Film</Link>
              <Link href="/photography" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Photography</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-polar text-[10px] tracking-widest text-white/20 uppercase mb-2">Collective</span>
              <Link href="/social" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Social</Link>
              <Link href="/model-team" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Models</Link>
              <Link href="/merch" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Merch</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-polar text-[10px] tracking-widest text-white/20 uppercase mb-2">Connect</span>
              <Link href="/intake" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Intake</Link>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white cursor-pointer transition-colors">Instagram</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5">
            <span className="font-polar text-[8px] tracking-[0.5em] text-white/20 uppercase text-center sm:text-left">
              <span
                contentEditable={isPreview}
                suppressContentEditableWarning
                onBlur={(e) => sendPreviewEdit("footer_copyright", e.currentTarget.innerText)}
              >
                {copyrightText}
              </span>
            </span>
            <div className="flex gap-8">
            <span className="font-polar text-[8px] tracking-[0.5em] text-white/20 uppercase">
              <span
                contentEditable={isPreview}
                suppressContentEditableWarning
                onBlur={(e) => sendPreviewEdit("footer_location_1", e.currentTarget.innerText)}
              >
                {footerContent.footer_location_1}
              </span>
            </span>
            <span className="font-polar text-[8px] tracking-[0.5em] text-white/20 uppercase">
              <span
                contentEditable={isPreview}
                suppressContentEditableWarning
                onBlur={(e) => sendPreviewEdit("footer_location_2", e.currentTarget.innerText)}
              >
                {footerContent.footer_location_2}
              </span>
            </span>
            <span className="font-polar text-[8px] tracking-[0.5em] text-white/20 uppercase">
              <span
                contentEditable={isPreview}
                suppressContentEditableWarning
                onBlur={(e) => sendPreviewEdit("footer_location_3", e.currentTarget.innerText)}
              >
                {footerContent.footer_location_3}
              </span>
            </span>
            </div>
        </div>
      </div>
    </footer>
  );
}

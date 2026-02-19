"use client";

export const dynamic = "force-dynamic";

import SectionPreview from "@/components/SectionPreview";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  caption?: string;
}

interface ContentItem {
  key: string;
  value: string;
}

interface SectionItem {
  id?: string;
  slug: string;
  title: string;
  description: string;
  tagline?: string | null;
  cta_text?: string | null;
  cta_link?: string | null;
  order_index?: number;
  link?: string;
}

const defaultSections: SectionItem[] = [];

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [sectionMedia, setSectionMedia] = useState<Record<string, MediaItem[]>>({});


  const [heroContent, setHeroContent] = useState({
    title: "",
    subtitle: "",
    video: ""
  });

  const [sectionList, setSectionList] = useState<SectionItem[]>(defaultSections);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setIsPreview(params.get("preview") === "1");
    }

    if (videoRef.current) {
      videoRef.current.play().catch(() => { });
    }

    async function fetchHeroContent() {
      if (!supabase) return;
      const { data, error } = await supabase.from("site_content").select("*");
      if (data && !error) {
        const title = data.find((c: ContentItem) => c.key === 'hero_title')?.value;
        const subtitle = data.find((c: ContentItem) => c.key === 'hero_subtitle')?.value;
        const video = data.find((c: ContentItem) => c.key === 'hero_video')?.value;

        setHeroContent(prev => ({
          title: title ?? prev.title,
          subtitle: subtitle ?? prev.subtitle,
          video: video ?? prev.video
        }));
      }
    }

    async function fetchSections() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .order("order_index", { ascending: true });

      if (data && !error) {
        const mapped = (data as SectionItem[]).map((section) => ({
          ...section,
          link: section.cta_link && section.cta_link.trim() ? section.cta_link : `/${section.slug}`,
        }));
        setSectionList(mapped);
      }
    }

    fetchHeroContent();
    fetchSections();
  }, []);

  useEffect(() => {
    async function fetchMedia(targetSections: SectionItem[]) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes("placeholder")) return;

      for (const section of targetSections) {
        try {
          if (!supabase) continue;
          const { data, error } = await supabase
            .from("gallery_assets")
            .select("*")
            .eq("category", section.slug)
            .order("order_index", { ascending: true })
            .limit(6);

          if (error) throw error;
          if (data && data.length > 0) {
            const mediaItems: MediaItem[] = data.map((item: { id: string; url: string; type: string; caption?: string }) => ({
              id: item.id,
              url: item.url,
              type: item.type as "image" | "video",
              caption: item.caption || undefined,
            }));
            setSectionMedia((prev) => ({ ...prev, [section.slug]: mediaItems }));
          }
        } catch (error) {
          console.error(`Error fetching media for ${section.slug}:`, error);
        }
      }
    }

    fetchMedia(sectionList);
  }, [sectionList]);

  const sendPreviewUpdate = (payload: Record<string, unknown>) => {
    if (!isPreview) return;
    window.parent?.postMessage({ type: "site_preview_edit", payload }, window.location.origin);
  };

  const reorderSections = (dragId: string, dropId: string) => {
    if (!dragId || !dropId || dragId === dropId) return;
    setSectionList((prev) => {
      const next = [...prev];
      const fromIndex = next.findIndex((s) => s.id === dragId);
      const toIndex = next.findIndex((s) => s.id === dropId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      const updated = next.map((s, idx) => ({ ...s, order_index: idx + 1 }));
      sendPreviewUpdate({ kind: "sections_order", order: updated.map((s) => s.id) });
      return updated;
    });
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const { type, payload } = event.data || {};
      if (type !== "site_preview") return;

      if (payload?.theme) {
        const root = document.documentElement;
        root.style.setProperty("--site-primary", payload.theme.primary_color);
        root.style.setProperty("--site-secondary", payload.theme.secondary_color);
        root.style.setProperty("--site-accent", payload.theme.accent_color);
        root.style.setProperty("--site-background", payload.theme.background_color);
        root.style.setProperty("--site-text", payload.theme.text_color);
        root.style.setProperty("--site-text-muted", payload.theme.text_muted_color);
        root.style.setProperty("--site-border", payload.theme.border_color);
        root.style.setProperty("--site-button-radius", payload.theme.button_radius);
        document.body.style.backgroundColor = payload.theme.background_color;
        document.body.style.color = payload.theme.text_color;
      }

      if (payload?.content) {
        setHeroContent((prev) => ({
          title: payload.content.hero_title ?? prev.title,
          subtitle: payload.content.hero_subtitle ?? prev.subtitle,
          video: payload.content.hero_video ?? prev.video,
        }));
      }

      if (payload?.sections) {
        const ordered = (payload.sections as SectionItem[])
          .slice()
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          .map((section) => ({
            ...section,
            link: section.cta_link && section.cta_link.trim() ? section.cta_link : `/${section.slug}`,
          }));
        setSectionList(ordered);
      }

      if (payload?.background?.url) {
        setHeroContent((prev) => ({ ...prev, video: payload.background.url }));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Background Video Layer */}
      <div className="fixed inset-0 h-screen w-full overflow-hidden z-0">
        {heroContent.video && (
          <video
            key={heroContent.video}
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover opacity-40 scale-105 transition-transform duration-[10s] ease-linear"
          >
            <source src={heroContent.video} type="video/quicktime" />
            <source src={heroContent.video} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        {(heroContent.title || heroContent.subtitle) && (
        <section className="h-screen flex flex-col justify-end px-6 pb-20 sm:px-12 sm:pb-32">
          <div className="max-w-[1400px] mx-auto w-full">
            <h1
              className="text-[14vw] sm:text-[12vw] leading-[0.85] font-giants italic font-black uppercase tracking-tighter mb-8 whitespace-pre-line"
              contentEditable={isPreview}
              suppressContentEditableWarning
              onBlur={(e) =>
                sendPreviewUpdate({ kind: "content", key: "hero_title", value: e.currentTarget.innerText })
              }
            >
              {heroContent.title.includes('\n') ? (
                heroContent.title.split('\n').map((line, i, arr) => (
                  <span key={i}>
                    {line.toLowerCase() === 'world' || line.toLowerCase() === 'wrld' ? <span className="text-outline">{line}</span> : line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))
              ) : (
                heroContent.title
              )}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-12">
              {heroContent.subtitle && (
                <p
                  className="max-w-md text-sm sm:text-lg text-white/60 font-medium leading-relaxed uppercase tracking-wider"
                  contentEditable={isPreview}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    sendPreviewUpdate({ kind: "content", key: "hero_subtitle", value: e.currentTarget.innerText })
                  }
                >
                  {heroContent.subtitle}
                </p>
              )}
            </div>
          </div>
        </section>
        )}

        {/* Feature Sections */}
        <div className="bg-black">
          {sectionList.map((section, idx) => (
            <section
              key={section.slug}
              className="relative py-32 sm:py-48 px-6 sm:px-12 border-t border-white/5"
              draggable={isPreview}
              onDragStart={(e) => {
                if (!section.id) return;
                e.dataTransfer.setData("text/plain", section.id);
              }}
              onDragOver={(e) => isPreview && e.preventDefault()}
              onDrop={(e) => {
                if (!isPreview || !section.id) return;
                const dragId = e.dataTransfer.getData("text/plain");
                reorderSections(dragId, section.id);
              }}
            >
              <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-20">
                  {/* Text Side */}
                  <div className="lg:w-1/3 pt-4">
                    <div className="flex items-start gap-6">
                      <span className="font-giants italic text-4xl text-white/20">0{idx + 1}</span>
                      <div>
                        {section.title && (
                          <h2
                            className="text-6xl sm:text-7xl font-giants italic font-black uppercase tracking-tighter mb-6"
                            contentEditable={isPreview}
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              section.id &&
                              sendPreviewUpdate({
                                kind: "section",
                                id: section.id,
                                field: "title",
                                value: e.currentTarget.innerText,
                              })
                            }
                          >
                            {section.title}
                          </h2>
                        )}
                        {section.tagline && (
                          <div
                            className="text-[11px] uppercase tracking-[0.3em] text-white/40 mb-3"
                            contentEditable={isPreview}
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              section.id &&
                              sendPreviewUpdate({
                                kind: "section",
                                id: section.id,
                                field: "tagline",
                                value: e.currentTarget.innerText,
                              })
                            }
                          >
                            {section.tagline}
                          </div>
                        )}
                        {section.description && (
                          <p
                            className="text-white/50 text-sm sm:text-base leading-relaxed mb-10 max-w-sm"
                            contentEditable={isPreview}
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              section.id &&
                              sendPreviewUpdate({
                                kind: "section",
                                id: section.id,
                                field: "description",
                                value: e.currentTarget.innerText,
                              })
                            }
                          >
                            {section.description}
                          </p>
                        )}
                        {(section.cta_text || section.cta_link) && (
                          <Link href={(section.cta_link && section.cta_link.trim()) || section.link || `/${section.slug}`} className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] group">
                            <span
                              contentEditable={isPreview}
                              suppressContentEditableWarning
                              onBlur={(e) =>
                                section.id &&
                                sendPreviewUpdate({
                                  kind: "section",
                                  id: section.id,
                                  field: "cta_text",
                                  value: e.currentTarget.innerText,
                                })
                              }
                            >
                              {section.cta_text || "View"}
                            </span>
                            <span className="w-12 h-[1px] bg-white/20 group-hover:w-20 group-hover:bg-white transition-all" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Media Side */}
                  <div className="lg:w-2/3">
                    <SectionPreview
                      items={sectionMedia[section.slug] || []}
                      sectionSlug={section.slug}
                    />
                  </div>
                </div>
              </div>

              {/* Decorative label */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:block">
                <span className="text-vertical font-polar text-[8px] tracking-[1em] text-white/10 uppercase">
                  {section.title} // FORENSIC WRLD //
                </span>
              </div>
            </section>
          ))}
        </div>

        {/* Final CTA */}
        <section className="py-40 px-6 sm:px-12 bg-white text-black">
          <div className="max-w-[1400px] mx-auto text-center">
            <h2 className="text-[10vw] leading-[0.8] font-giants italic font-black uppercase tracking-tighter mb-12">
              READY TO<br /><span className="text-white bg-black px-4">MANIFEST?</span>
            </h2>
            <Link href="/intake">
              <span className="inline-flex items-center gap-4 text-[12px] font-bold uppercase tracking-[0.3em] border-2 border-black px-12 py-8 hover:bg-black hover:text-white transition-all">
                The Intake Form →
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

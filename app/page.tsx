"use client";

import Link from "next/link";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import SectionPreview from "@/components/SectionPreview";
import { useEffect, useRef, useState } from "react";
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

const sections = [
  {
    slug: "film",
    title: "Film Campaigns",
    description: "With proven strategies, we position your brand in front of the right audiences at the right time.",
    link: "/film",
  },
  {
    slug: "photography",
    title: "Photography",
    description: "We don’t just chase likes—we convert attention into measurable revenue and long-term customer loyalty!",
    link: "/photography",
  },
  {
    slug: "social",
    title: "Social Marketing",
    description: "From viral videos to scroll-stopping visuals, we create content that cuts through the noise and drives action.",
    link: "/social",
  },
  {
    slug: "events",
    title: "Events",
    description: "Pop-ups, screenings, brand moments. Built to feel like culture — not a conference.",
    link: "/events",
  },
  {
    slug: "model-team",
    title: "Model Team",
    description: "Looking for models for your next project? Or interested in a joining the team.",
    link: "/model-team",
  },
];

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sectionMedia, setSectionMedia] = useState<Record<string, MediaItem[]>>({
    photography: [
      { id: '1', url: '/forensicBrandShoots.JPG', type: 'image' },
      { id: '2', url: '/forensicEditorials.JPG', type: 'image' },
      { id: '3', url: '/forensicLifestyle.JPG', type: 'image' },
    ],
    film: [
      { id: '4', url: '/forensicEvents.JPG', type: 'image' },
      { id: '5', url: '/forensicStudioPortraits.JPG', type: 'image' },
    ]
  });

  const [heroContent, setHeroContent] = useState({
    title: "CREATE\nYOUR\nWORLD",
    subtitle: "WE HELP ARTISTS AND BRANDS MANIFEST THEIR VISION THROUGH HIGH-FIDELITY CONTENT AND STRATEGIC POSITIONING.",
    video: "/backgroundVideo.mov"
  });

  useEffect(() => {
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
          title: title || prev.title,
          subtitle: subtitle || prev.subtitle,
          video: video || prev.video
        }));
      }
    }

    async function fetchMedia() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) return;

      for (const section of sections) {
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

    fetchHeroContent();
    fetchMedia();
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Background Video Layer */}
      <div className="fixed inset-0 h-screen w-full overflow-hidden z-0">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="h-screen flex flex-col justify-end px-6 pb-20 sm:px-12 sm:pb-32">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="inline-block font-polar text-[10px] tracking-[0.5em] text-white/40 mb-8 border-l border-white/20 pl-4 py-1">
              EST. MMXXIV / CREATIVE COLLECTIVE
            </div>
            <h1 className="text-[14vw] sm:text-[12vw] leading-[0.85] font-giants italic font-black uppercase tracking-tighter mb-8 whitespace-pre-line">
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
              <p className="max-w-md text-sm sm:text-lg text-white/60 font-medium leading-relaxed uppercase tracking-wider">
                {heroContent.subtitle}
              </p>
              <Link href="/intake" className="group">
                <span className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] bg-white text-black px-10 py-6 hover:bg-white/90 transition-all">
                  Start Project <span className="group-hover:translate-x-2 transition-transform">→</span>
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Sections */}
        <div className="bg-black">
          {sections.map((section, idx) => (
            <section key={section.slug} className="relative py-32 sm:py-48 px-6 sm:px-12 border-t border-white/5">
              <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-20">
                  {/* Text Side */}
                  <div className="lg:w-1/3 pt-4">
                    <div className="flex items-start gap-6">
                      <span className="font-giants italic text-4xl text-white/20">0{idx + 1}</span>
                      <div>
                        <h2 className="text-6xl sm:text-7xl font-giants italic font-black uppercase tracking-tighter mb-6">
                          {section.title}
                        </h2>
                        <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-10 max-w-sm">
                          {section.description}
                        </p>
                        <Link href={section.link} className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] group">
                          Explore Works <span className="w-12 h-[1px] bg-white/20 group-hover:w-20 group-hover:bg-white transition-all" />
                        </Link>
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

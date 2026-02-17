"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import Button from "@/components/Button";
import MediaGrid from "@/components/MediaGrid";

export default function FilmPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFilms() {
      if (!supabase) return;
      const { data } = await supabase
        .from("gallery_assets")
        .select("*")
        .eq("category", "film")
        .order("created_at", { ascending: false });

      if (data) setMedia(data);
      setLoading(false);
    }
    fetchFilms();
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-12 pb-32">
      <SectionHeader
        eyebrow="Film Campaigns"
        title="Film campaigns!"
        subtitle="“With proven strategies, we position your brand in front of the right audiences at the right time”"
        actions={
          <div className="flex flex-wrap gap-4">
            <Link href="/intake">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white text-black px-8 py-4 hover:bg-white/90 transition-all">
                Book Production
              </span>
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="py-20 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
          Syncing Media Registry...
        </div>
      ) : (
        <MediaGrid items={media} sectionTitle="Film Campaigns" />
      )}
    </div>
  );
}

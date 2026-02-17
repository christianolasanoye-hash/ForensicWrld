"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import Button from "@/components/Button";
import MediaGrid from "@/components/MediaGrid";

export default function PhotoPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotos() {
      if (!supabase) return;
      const { data } = await supabase
        .from("gallery_assets")
        .select("*")
        .eq("category", "photography")
        .order("created_at", { ascending: false });

      if (data) setMedia(data);
      setLoading(false);
    }
    fetchPhotos();
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-12 pb-32">
      <SectionHeader
        eyebrow="Photography Services"
        title="Photography services"
        subtitle="“We don’t just chase likes—we convert attention into measurable revenue and long-term customer loyalty!”"
        actions={
          <div className="flex flex-wrap gap-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white text-black px-8 py-4 hover:bg-white/90 transition-all cursor-pointer">
              Book via Calendly
            </span>
          </div>
        }
      />

      {loading ? (
        <div className="py-20 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
          Syncing Media Registry...
        </div>
      ) : (
        <MediaGrid items={media} sectionTitle="Photography" />
      )}
    </div>
  );
}

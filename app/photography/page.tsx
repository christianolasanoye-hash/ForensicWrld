"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import SectionHeader from "@/components/SectionHeader";
import MediaGrid from "@/components/MediaGrid";

export default function PhotoPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionInfo, setSectionInfo] = useState<{ title?: string; description?: string; tagline?: string } | null>(null);

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
    async function fetchSection() {
      if (!supabase) return;
      const { data } = await supabase
        .from("sections")
        .select("title, description, tagline")
        .eq("slug", "photography")
        .single();
      if (data) setSectionInfo(data);
    }
    fetchPhotos();
    fetchSection();
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-12 pb-32">
      {sectionInfo && (sectionInfo.title || sectionInfo.description) && (
        <SectionHeader
          eyebrow={sectionInfo.tagline || ""}
          title={sectionInfo.title || ""}
          subtitle={sectionInfo.description || ""}
        />
      )}

      {loading ? (
        <div className="py-20 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
          Syncing Media Registry...
        </div>
      ) : (
        media.length > 0 && <MediaGrid items={media} sectionTitle={sectionInfo?.title || "Photography"} />
      )}
    </div>
  );
}

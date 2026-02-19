"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import MediaGrid from "@/components/MediaGrid";
import { supabase } from "@/lib/supabase";

export default function MentorPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionInfo, setSectionInfo] = useState<{ title?: string; description?: string; tagline?: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!supabase) return;

      const [{ data: sectionData }, { data: mediaData }] = await Promise.all([
        supabase.from("sections").select("title, description, tagline").eq("slug", "mentorship").single(),
        supabase.from("gallery_assets").select("*").eq("category", "mentorship").order("order_index", { ascending: true }),
      ]);

      if (sectionData) setSectionInfo(sectionData);
      if (mediaData) setMedia(mediaData);
      setLoading(false);
    }

    fetchData();
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
        media.length > 0 && <MediaGrid items={media} sectionTitle={sectionInfo?.title || "Mentorship"} />
      )}
    </div>
  );
}

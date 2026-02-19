"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import MediaGrid from "@/components/MediaGrid";
import Badge from "@/components/Badge";
import { supabase } from "@/lib/supabase";

interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string | null;
  is_upcoming: boolean;
}

export default function EventsPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<EventItem[]>([]);
  const [past, setPast] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionInfo, setSectionInfo] = useState<{ title?: string; description?: string; tagline?: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!supabase) return;

      const [{ data: sectionData }, { data: mediaData }, { data: eventsData }] = await Promise.all([
        supabase.from("sections").select("title, description, tagline").eq("slug", "events").single(),
        supabase.from("gallery_assets").select("*").eq("category", "events").order("order_index", { ascending: true }),
        supabase.from("events").select("id,title,date,location,is_upcoming").order("date", { ascending: true }),
      ]);

      if (sectionData) setSectionInfo(sectionData);
      if (mediaData) setMedia(mediaData);
      if (eventsData) {
        setUpcoming(eventsData.filter((e: EventItem) => e.is_upcoming));
        setPast(eventsData.filter((e: EventItem) => !e.is_upcoming));
      }
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
        media.length > 0 && <MediaGrid items={media} sectionTitle={sectionInfo?.title || "Events"} />
      )}

      {(upcoming.length > 0 || past.length > 0) && (
        <div className="mt-20 grid gap-12 lg:grid-cols-2">
          {upcoming.length > 0 && (
            <div className="space-y-4">
              {upcoming.map((e) => (
                <div key={e.id} className="group border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.05] transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold uppercase tracking-tight text-white">{e.title}</div>
                    <Badge tone="solid">Upcoming</Badge>
                  </div>
                  <div className="font-polar text-[10px] tracking-[0.2em] text-white/40 uppercase">
                    <span className="text-white/60">{e.date}</span>{e.location ? ` // ${e.location}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-4">
              {past.map((e) => (
                <div key={e.id} className="group border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.05] transition-all">
                  <div className="text-lg font-bold uppercase tracking-tight text-white/60 group-hover:text-white transition-colors">
                    {e.title}
                  </div>
                  <div className="mt-4 font-polar text-[8px] tracking-[0.2em] text-white/20 uppercase">
                    {e.date}{e.location ? ` // ${e.location}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import SectionHeader from "@/components/SectionHeader";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import MediaGrid from "@/components/MediaGrid";
import { supabase } from "@/lib/supabase";

async function getMedia(sectionSlug: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('placeholder') || !supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("media")
      .select("*")
      .eq("section_slug", sectionSlug)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching media:", error);
    return [];
  }
}

export default async function EventsPage() {
  const mediaData = await getMedia("events");
  const upcoming = [
    { title: "WRLD Screening Night", date: "Jan 18", location: "Downtown — TBD" },
    { title: "Creator Workshop: Short-form", date: "Feb 2", location: "Studio — TBD" },
  ];
  const past = [
    { title: "Pop-up Portrait Day", date: "Nov 10", location: "Campus" },
    { title: "Brand Collab Mixer", date: "Oct 21", location: "Loft" },
    { title: "After Hours Recap", date: "Sep 14", location: "Warehouse" },
  ];

  const placeholderMedia = [
    { id: "1", url: "/placeholder-image.jpg", type: "image" as const, caption: "Event Image 1" },
  ];

  const media = mediaData.length > 0
    ? mediaData.map((item: any) => ({
      id: item.id,
      url: item.url,
      type: item.type as "image" | "video",
      caption: item.caption || undefined,
    }))
    : placeholderMedia;

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-12 pb-32">
      <SectionHeader
        eyebrow="Events"
        title="Events"
        subtitle="Upcoming and past moments. Built for culture — not a conference."
      />

      <MediaGrid items={media} sectionTitle="Events" />

      <div className="mt-20 grid gap-12 lg:grid-cols-2">
        <Card title="Upcoming" desc="The Next Chapter.">
          <div className="space-y-4">
            {upcoming.map((e) => (
              <div key={e.title} className="group border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.05] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold uppercase tracking-tight text-white">{e.title}</div>
                  <Badge tone="solid">TBD</Badge>
                </div>
                <div className="font-polar text-[10px] tracking-[0.2em] text-white/40 uppercase">
                  <span className="text-white/60">{e.date}</span> // {e.location}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Past" desc="Fragments of time.">
          <div className="space-y-4">
            {past.map((e) => (
              <div key={e.title} className="group border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.05] transition-all">
                <div className="text-lg font-bold uppercase tracking-tight text-white/60 group-hover:text-white transition-colors">{e.title}</div>
                <div className="mt-4 font-polar text-[8px] tracking-[0.2em] text-white/20 uppercase">
                  {e.date} // {e.location}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

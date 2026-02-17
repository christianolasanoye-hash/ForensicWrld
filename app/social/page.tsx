import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import MediaGrid from "@/components/MediaGrid";
import { supabase } from "@/lib/supabase";

async function getMedia(sectionSlug: string) {
  try {
    // Check if Supabase is properly configured
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

export default async function SocialPage() {
  const mediaData = await getMedia("social");
  const creators = [
    { handle: "@nyc.nights", niche: "Nightlife / culture", reach: "18k" },
    { handle: "@campus.edit", niche: "Student style", reach: "9k" },
    { handle: "@taste.tested", niche: "Food + local", reach: "24k" },
    { handle: "@fit.frames", niche: "Training / wellness", reach: "13k" },
    { handle: "@artroom.tv", niche: "Creative process", reach: "31k" },
  ];

  // Fallback placeholder media if no data from Supabase
  const placeholderMedia = [
    { id: "1", url: "/placeholder-image.jpg", type: "image" as const, caption: "Strategic Content Alignment" },
    { id: "2", url: "/placeholder-image.jpg", type: "image" as const, caption: "High-Fidelity Social Visuals" },
    { id: "3", url: "/placeholder-image.jpg", type: "image" as const, caption: "UGC Format Execution" },
    { id: "4", url: "/placeholder-video.mp4", type: "video" as const, caption: "Short-Form Performance Content" },
    { id: "5", url: "/placeholder-video.mp4", type: "video" as const, caption: "Viral Narrative Structures" },
    { id: "6", url: "/placeholder-video.mp4", type: "video" as const, caption: "Immersive Social Storytelling" },
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
        eyebrow="Social Media Marketing"
        title="Micro-influencer strategy"
        subtitle="We connect brands with niche creators to generate leads & sales — without the corporate bloat."
        actions={
          <Link href="/intake">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white text-black px-8 py-4 hover:bg-white/90 transition-all">
              Connect now
            </span>
          </Link>
        }
      />

      <MediaGrid items={media} sectionTitle="Social Media" />

      <div className="mt-20 grid gap-12 lg:grid-cols-2">
        <Card title="How it works" desc="Simple, measurable, and creator-first.">
          <ol className="list-inside list-decimal space-y-6 text-[10px] uppercase tracking-[0.1em] font-bold text-white/70">
            <li className="pl-2 border-l border-white/20 ml-2"><span className="text-white">Audience Mapping:</span> We map your audience and the subcultures they actually follow.</li>
            <li className="pl-2 border-l border-white/20 ml-2"><span className="text-white">Creator Vetting:</span> We shortlist creators with authentic trust and clean aesthetics.</li>
            <li className="pl-2 border-l border-white/20 ml-2"><span className="text-white">Campaign Brief:</span> We build the brief + content direction and manage delivery.</li>
            <li className="pl-2 border-l border-white/20 ml-2"><span className="text-white">Optimization:</span> We package outputs for ads, site, and socials.</li>
          </ol>
          <div className="mt-10 flex flex-wrap gap-2">
            <Badge tone="muted">Creators</Badge>
            <Badge tone="muted">UGC</Badge>
            <Badge tone="muted">Short-form</Badge>
            <Badge tone="muted">Performance</Badge>
          </div>
        </Card>

        <Card title="Example creators" desc="Network highlights.">
          <div className="overflow-hidden border border-white/5 bg-white/[0.02]">
            <table className="w-full text-left text-[10px] uppercase tracking-widest font-bold">
              <thead className="bg-white/5 text-white/40">
                <tr>
                  <th className="px-6 py-4">Handle</th>
                  <th className="px-6 py-4">Niche</th>
                  <th className="px-6 py-4 text-right">Reach</th>
                </tr>
              </thead>
              <tbody className="text-white/60">
                {creators.map((c) => (
                  <tr key={c.handle} className="border-t border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4 text-white">{c.handle}</td>
                    <td className="px-6 py-4">{c.niche}</td>
                    <td className="px-6 py-4 text-right">{c.reach}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

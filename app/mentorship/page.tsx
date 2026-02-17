import Link from "next/link";
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

export default async function MentorPage() {
  const mediaData = await getMedia("mentorship");

  const placeholderMedia = [
    { id: "1", url: "/placeholder-image.jpg", type: "image" as const, caption: "Mentorship Image 1" },
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
        eyebrow="Consulting / Mentorship"
        title="Clarity & Direction"
        subtitle="MANIFEST THE NEXT STAGE OF YOUR CREATIVE JOURNEY."
        actions={
          <Link href="/intake">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white text-black px-8 py-4 hover:bg-white/90 transition-all">
              Schedule Session
            </span>
          </Link>
        }
      />

      <MediaGrid items={media} sectionTitle="Mentorship" />

      <div className="mt-20 grid gap-12 lg:grid-cols-2">
        <Card title="The Framework" desc="A focused, high-fidelity session.">
          <ul className="space-y-6 text-[10px] uppercase tracking-widest font-bold text-white/50">
            <li className="flex gap-4 items-start"><span className="text-white">//</span> Strategic Roadmap: Define what to ship and what to skip.</li>
            <li className="flex gap-4 items-start"><span className="text-white">//</span> Creative Audit: Feedback on brand consistency and direction.</li>
            <li className="flex gap-4 items-start"><span className="text-white">//</span> Production Planning: Realistic scopes for content & distribution.</li>
            <li className="flex gap-4 items-start"><span className="text-white">//</span> Handoff Notes: Actionable items for you or your team.</li>
          </ul>
        </Card>

        <Card title="Session Lanes" desc="Pick a lane — we'll manifest it.">
          <div className="flex flex-wrap gap-2 mb-8">
            <Badge tone="muted">Launch strategy</Badge>
            <Badge tone="muted">Content plan</Badge>
            <Badge tone="muted">Creative direction</Badge>
            <Badge tone="muted">Production scope</Badge>
            <Badge tone="muted">Creator marketing</Badge>
          </div>
          <div className="font-polar text-[8px] tracking-[0.2em] text-white/20 uppercase">
            Direct calendar integration pending // Book via intake.
          </div>
        </Card>
      </div>
    </div>
  );
}

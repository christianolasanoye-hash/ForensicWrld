"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface ModelItem {
  id: string;
  name: string;
  role: string | null;
  image_url: string | null;
}

export default function ModelTeamPage() {
  const [models, setModels] = useState<ModelItem[]>([]);
  const [sectionInfo, setSectionInfo] = useState<{ title?: string; description?: string; tagline?: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!supabase) return;

      const [{ data: sectionData }, { data: modelData }] = await Promise.all([
        supabase.from("sections").select("title, description, tagline").eq("slug", "model-team").single(),
        supabase.from("model_team").select("id,name,role,image_url").order("created_at", { ascending: false }),
      ]);

      if (sectionData) setSectionInfo(sectionData);
      if (modelData) setModels(modelData as ModelItem[]);
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

      {models.length > 0 && (
        <div className="mt-20 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <div key={model.id} className="group relative aspect-[3/4] overflow-hidden bg-white/[0.02] border border-white/5">
              {model.image_url && (
                <Image
                  src={model.image_url}
                  alt={`Model portfolio for ${model.name}`}
                  fill
                  className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-transparent to-transparent">
                <h3 className="font-giants italic text-2xl text-white uppercase tracking-tighter mb-1">{model.name}</h3>
                {model.role && (
                  <p className="font-polar text-[8px] tracking-[0.2em] text-white/60 uppercase">{model.role}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

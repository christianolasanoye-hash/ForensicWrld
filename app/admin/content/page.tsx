"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import SectionHeader from "@/components/SectionHeader";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Button from "@/components/Button";
import Field from "@/components/Field";
import FileUpload from "@/components/admin/FileUpload";

interface SiteContent {
  id: string;
  key: string;
  value: string;
  type: string;
}

interface Section {
  id: string;
  slug: string;
  title: string;
  description: string;
  tagline: string;
  cta_text: string;
  cta_link: string;
}

export default function ContentManagement() {
  const [content, setContent] = useState<SiteContent[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = getSupabaseClient();

  // Form states
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [networkTagline, setNetworkTagline] = useState("");
  const [networkDescription, setNetworkDescription] = useState("");

  useEffect(() => {
    fetchContent();
    fetchSections();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase.from("site_content").select("*");
    if (data) {
      setContent(data);
      setHeroTitle(data.find((c: SiteContent) => c.key === "hero_title")?.value || "");
      setHeroSubtitle(data.find((c: SiteContent) => c.key === "hero_subtitle")?.value || "");
      setNetworkTagline(data.find((c: SiteContent) => c.key === "network_tagline")?.value || "");
      setNetworkDescription(data.find((c: SiteContent) => c.key === "network_description")?.value || "");
    }
    setLoading(false);
  };

  const fetchSections = async () => {
    const { data } = await supabase
      .from("sections")
      .select("*")
      .order("order_index");
    if (data) {
      setSections(data);
    }
  };

  const saveContent = async (key: string, value: string) => {
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("site_content")
      .upsert({ key, value, type: "text" }, { onConflict: "key" });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    }

    setSaving(false);
    fetchContent();
  };

  const updateSection = async (section: Section) => {
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("sections")
      .update({
        title: section.title,
        description: section.description,
        tagline: section.tagline,
        cta_text: section.cta_text,
        cta_link: section.cta_link,
      })
      .eq("id", section.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Section updated!");
      setTimeout(() => setMessage(""), 3000);
    }

    setSaving(false);
  };

  const handleMediaUpload = async (url: string, key: string) => {
    const { error } = await supabase
      .from("site_content")
      .upsert({ key, value: url, type: "media" }, { onConflict: "key" });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Media uploaded!");
      setTimeout(() => setMessage(""), 3000);
    }
    fetchContent();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <SectionHeader
        eyebrow="CMS"
        title="SITE CONTENT"
        subtitle="Manage all text and media across the website."
      />

      {message && (
        <div className={`border p-4 text-[10px] font-bold uppercase tracking-widest ${
          message.includes("Error")
            ? "border-red-500/50 bg-red-500/10 text-red-400"
            : "border-green-500/50 bg-green-500/10 text-green-400"
        }`}>
          {message}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Hero Section */}
        <Card title="Hero Section" desc="Homepage entrance content">
          <div className="space-y-6 py-4">
            <Field label="Main Title">
              <div className="flex gap-4">
                <Input
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="CREATE YOUR WORLD"
                />
                <Button
                  onClick={() => saveContent("hero_title", heroTitle)}
                  disabled={saving}
                  className="px-4 py-2 text-[8px]"
                >
                  SAVE
                </Button>
              </div>
            </Field>

            <Field label="Subtitle">
              <Textarea
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="Using our vast network..."
                rows={3}
              />
              <Button
                onClick={() => saveContent("hero_subtitle", heroSubtitle)}
                disabled={saving}
                className="mt-2 px-4 py-2 text-[8px]"
              >
                SAVE SUBTITLE
              </Button>
            </Field>

            <Field label="Hero Video/Background">
              <FileUpload
                folder="hero"
                onUploadComplete={(url) => handleMediaUpload(url, "hero_video")}
                onError={(err) => setMessage(`Error: ${err}`)}
                label="Upload Hero Video or Image"
              />
              {content.find((c: SiteContent) => c.key === "hero_video") && (
                <div className="mt-2 text-[9px] text-white/40 truncate">
                  Current: {content.find((c: SiteContent) => c.key === "hero_video")?.value}
                </div>
              )}
            </Field>
          </div>
        </Card>

        {/* Network Section */}
        <Card title="Network Section" desc="Creator network messaging">
          <div className="space-y-6 py-4">
            <Field label="Tagline">
              <div className="flex gap-4">
                <Input
                  value={networkTagline}
                  onChange={(e) => setNetworkTagline(e.target.value)}
                  placeholder="Nationwide Network of..."
                />
                <Button
                  onClick={() => saveContent("network_tagline", networkTagline)}
                  disabled={saving}
                  className="px-4 py-2 text-[8px]"
                >
                  SAVE
                </Button>
              </div>
            </Field>

            <Field label="Description">
              <Textarea
                value={networkDescription}
                onChange={(e) => setNetworkDescription(e.target.value)}
                placeholder="Gain instant access..."
                rows={3}
              />
              <Button
                onClick={() => saveContent("network_description", networkDescription)}
                disabled={saving}
                className="mt-2 px-4 py-2 text-[8px]"
              >
                SAVE DESCRIPTION
              </Button>
            </Field>
          </div>
        </Card>
      </div>

      {/* Section Content */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 border-b border-white/10 pb-4">
          Page Sections
        </h3>

        <div className="grid gap-6">
          {sections.map((section) => (
            <div key={section.id} className="border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">
                  {section.slug.toUpperCase()}
                </h4>
                <Button
                  onClick={() => updateSection(section)}
                  disabled={saving}
                  className="px-3 py-1 text-[8px]"
                >
                  SAVE SECTION
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Title">
                  <Input
                    value={section.title}
                    onChange={(e) => {
                      const updated = sections.map((s) =>
                        s.id === section.id ? { ...s, title: e.target.value } : s
                      );
                      setSections(updated);
                    }}
                  />
                </Field>

                <Field label="Tagline">
                  <Input
                    value={section.tagline || ""}
                    onChange={(e) => {
                      const updated = sections.map((s) =>
                        s.id === section.id ? { ...s, tagline: e.target.value } : s
                      );
                      setSections(updated);
                    }}
                  />
                </Field>
              </div>

              <Field label="Description">
                <Textarea
                  value={section.description || ""}
                  onChange={(e) => {
                    const updated = sections.map((s) =>
                      s.id === section.id ? { ...s, description: e.target.value } : s
                    );
                    setSections(updated);
                  }}
                  rows={2}
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="CTA Text">
                  <Input
                    value={section.cta_text || ""}
                    onChange={(e) => {
                      const updated = sections.map((s) =>
                        s.id === section.id ? { ...s, cta_text: e.target.value } : s
                      );
                      setSections(updated);
                    }}
                    placeholder="BOOK NOW →"
                  />
                </Field>

                <Field label="CTA Link">
                  <Input
                    value={section.cta_link || ""}
                    onChange={(e) => {
                      const updated = sections.map((s) =>
                        s.id === section.id ? { ...s, cta_link: e.target.value } : s
                      );
                      setSections(updated);
                    }}
                    placeholder="https://calendly.com/..."
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Content Items */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 border-b border-white/10 pb-4">
          All Content Items
        </h3>

        <div className="grid gap-2">
          {content.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border border-white/5 p-4 text-[9px] uppercase tracking-widest"
            >
              <span className="font-bold text-white">{item.key}</span>
              <span className="text-white/40 truncate max-w-[300px] mx-4">
                {item.value}
              </span>
              <span className="border border-white/10 px-2 py-1 text-white/40">
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

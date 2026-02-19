"use client";

import { useState, useEffect, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import Button from "@/components/Button";
import Field from "@/components/Field";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";

interface BackgroundMedia {
  id: string;
  url: string;
  type: "video" | "image";
  name: string;
  is_active: boolean;
  created_at: string;
}

interface ThemeSettings {
  id?: string;
  // Site Colors
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  text_muted_color: string;
  border_color: string;
  // Typography
  heading_font: string;
  body_font: string;
  accent_font: string;
  // Admin Colors
  admin_bg_color: string;
  admin_sidebar_color: string;
  admin_accent_color: string;
  admin_text_color: string;
  admin_border_color: string;
  // Styles
  button_radius: string;
}

interface SectionItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  tagline?: string | null;
  cta_text?: string | null;
  cta_link?: string | null;
  order_index: number;
}

interface SiteVersion {
  id: string;
  label: string | null;
  data: {
    theme: ThemeSettings;
    content: Record<string, string>;
    sections: SectionItem[];
    active_background_id?: string | null;
  };
  created_at: string;
}

const defaultTheme: ThemeSettings = {
  primary_color: "#FFFFFF",
  secondary_color: "#000000",
  accent_color: "#FFFFFF",
  background_color: "#000000",
  text_color: "#FFFFFF",
  text_muted_color: "#999999",
  border_color: "#333333",
  heading_font: "Giants",
  body_font: "Polar Vortex",
  accent_font: "Jamday",
  admin_bg_color: "#000000",
  admin_sidebar_color: "#0A0A0A",
  admin_accent_color: "#FFFFFF",
  admin_text_color: "#FFFFFF",
  admin_border_color: "#1A1A1A",
  button_radius: "0px",
};

const fontOptions = [
  { label: "Giants", value: "Giants" },
  { label: "Polar Vortex", value: "Polar Vortex" },
  { label: "Jamday", value: "Jamday" },
];

const themePresets = [
  {
    name: "Dark (Default)",
    theme: { ...defaultTheme },
  },
  {
    name: "Midnight Blue",
    theme: {
      ...defaultTheme,
      primary_color: "#3B82F6",
      accent_color: "#3B82F6",
      background_color: "#0F172A",
      border_color: "#1E293B",
      admin_bg_color: "#0F172A",
      admin_sidebar_color: "#020617",
      admin_accent_color: "#3B82F6",
      admin_border_color: "#1E293B",
    },
  },
  {
    name: "Forest",
    theme: {
      ...defaultTheme,
      primary_color: "#22C55E",
      accent_color: "#22C55E",
      background_color: "#052E16",
      border_color: "#14532D",
      admin_bg_color: "#052E16",
      admin_sidebar_color: "#022C22",
      admin_accent_color: "#22C55E",
      admin_border_color: "#14532D",
    },
  },
  {
    name: "Sunset",
    theme: {
      ...defaultTheme,
      primary_color: "#F97316",
      accent_color: "#F97316",
      background_color: "#1C1917",
      border_color: "#292524",
      admin_bg_color: "#1C1917",
      admin_sidebar_color: "#0C0A09",
      admin_accent_color: "#F97316",
      admin_border_color: "#292524",
    },
  },
  {
    name: "Minimal Light",
    theme: {
      ...defaultTheme,
      primary_color: "#000000",
      secondary_color: "#FFFFFF",
      accent_color: "#000000",
      background_color: "#FFFFFF",
      text_color: "#000000",
      text_muted_color: "#6B7280",
      border_color: "#E5E7EB",
      admin_bg_color: "#F9FAFB",
      admin_sidebar_color: "#FFFFFF",
      admin_accent_color: "#000000",
      admin_text_color: "#000000",
      admin_border_color: "#E5E7EB",
    },
  },
];

const defaultContent: Record<string, string> = {
  hero_title: "CREATE\nYOUR\nWORLD",
  hero_subtitle: "WE HELP ARTISTS AND BRANDS MANIFEST THEIR VISION THROUGH HIGH-FIDELITY CONTENT AND STRATEGIC POSITIONING.",
  hero_video: "",
  network_tagline: "Nationwide Network of Creators",
  network_description: "Gain instant access to collaborators, strategists, and production talent.",
  header_brand_primary: "FORENSIC",
  header_brand_secondary: "WRLD STUDIO",
  header_cta_text: "Book Intake",
  header_cta_link: "/intake",
  footer_tagline: "MANIFESTING THE NEXT ERA OF CULTURE THROUGH IMMERSIVE VISUALS AND STRATEGIC CREATIVE DIRECTION.",
  footer_location_1: "NYC",
  footer_location_2: "LDN",
  footer_location_3: "TYO",
  footer_copyright: "© {year} FORENSIC WRLD // ALL RIGHTS RESERVED // CONCEPT TO MANIFESTATION",
};

function keyType(key: string) {
  return key.includes("video") || key.includes("image") ? "media" : "text";
}

export default function ThemePage() {
  const [settings, setSettings] = useState<ThemeSettings>(defaultTheme);
  const [content, setContent] = useState<Record<string, string>>(defaultContent);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [backgroundMedia, setBackgroundMedia] = useState<BackgroundMedia[]>([]);
  const [activeBackground, setActiveBackground] = useState<BackgroundMedia | null>(null);
  const [deletedSectionIds, setDeletedSectionIds] = useState<string[]>([]);
  const [previewWide, setPreviewWide] = useState(false);
  const [versions, setVersions] = useState<SiteVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewReady, setPreviewReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    const handlePreviewEdit = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const { type, payload } = event.data || {};
      if (type !== "site_preview_edit" || !payload) return;

      if (payload.kind === "content" && payload.key) {
        updateContent(payload.key as string, String(payload.value ?? ""));
      }

      if (payload.kind === "section" && payload.id && payload.field) {
        updateSectionField(payload.id as string, {
          [payload.field as string]: String(payload.value ?? ""),
        } as Partial<SectionItem>);
      }

      if (payload.kind === "sections_order" && Array.isArray(payload.order)) {
        setSections((prev) => {
          const map = new Map(prev.map((s) => [s.id, s]));
          const ordered = payload.order
            .map((id: string, idx: number) => {
              const s = map.get(id);
              if (!s) return null;
              return { ...s, order_index: idx + 1 } as SectionItem;
            })
            .filter(Boolean) as SectionItem[];
          const remaining = prev.filter((s) => !payload.order.includes(s.id));
          return [...ordered, ...remaining];
        });
      }

      if (payload.kind === "section_add" && payload.section) {
        setSections((prev) => {
          const next = [...prev, payload.section as SectionItem];
          return next.map((s, idx) => ({ ...s, order_index: idx + 1 }));
        });
      }

      if (payload.kind === "section_delete" && payload.id) {
        const id = String(payload.id);
        setSections((prev) => prev.filter((s) => s.id !== id));
        if (!id.startsWith("temp_")) {
          setDeletedSectionIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
        }
      }
    };

    window.addEventListener("message", handlePreviewEdit);
    return () => window.removeEventListener("message", handlePreviewEdit);
  }, [sections]);

  useEffect(() => {
    if (!previewReady) return;
    const timeout = setTimeout(() => {
      sendPreview();
    }, 150);
    return () => clearTimeout(timeout);
  }, [settings, content, sections, activeBackground, previewReady]);

  const sendPreview = () => {
    const payload = {
      theme: settings,
      content,
      sections: sections.slice().sort((a, b) => a.order_index - b.order_index),
      background: activeBackground ? { url: activeBackground.url, type: activeBackground.type } : null,
    };
    previewFrameRef.current?.contentWindow?.postMessage(
      { type: "site_preview", payload },
      window.location.origin
    );
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchTheme(), fetchBackgroundMedia(), fetchContent(), fetchSections(), fetchVersions()]);
    setLoading(false);
  };

  const fetchTheme = async () => {
    try {
      const { data, error } = await supabase.from("theme_settings").select("*").single();
      if (data && !error) {
        setSettings({ ...defaultTheme, ...data });
      }
    } catch (err) {
      console.error("Error fetching theme:", err);
    }
  };

  const fetchContent = async () => {
    try {
      const { data } = await supabase.from("site_content").select("*");
      if (data) {
        const merged = { ...defaultContent } as Record<string, string>;
        data.forEach((item: { key: string; value: string }) => {
          merged[item.key] = item.value;
        });
        setContent(merged);
      }
    } catch (err) {
      console.error("Error fetching content:", err);
    }
  };

  const fetchSections = async () => {
    try {
      const { data } = await supabase
        .from("sections")
        .select("*")
        .order("order_index", { ascending: true });
      if (data) {
        setSections(data as SectionItem[]);
      }
    } catch (err) {
      console.error("Error fetching sections:", err);
    }
  };

  const fetchVersions = async () => {
    try {
      const { data } = await supabase
        .from("site_versions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        setVersions(data as SiteVersion[]);
      }
    } catch (err) {
      console.warn("Versions table not available:", err);
    }
  };

  const fetchBackgroundMedia = async () => {
    try {
      const { data } = await supabase
        .from("background_media")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setBackgroundMedia(data as BackgroundMedia[]);
        setActiveBackground(data.find((m: BackgroundMedia) => m.is_active) || null);
      }
    } catch (err) {
      console.error("Error fetching background media:", err);
    }
  };

  const createVersion = async (label?: string) => {
    try {
      const version = {
        theme: settings,
        content,
        sections,
        active_background_id: activeBackground?.id || null,
      };
      const timestamp = new Date().toLocaleString();
      const { error } = await supabase.from("site_versions").insert({
        label: label ? `${label} ${timestamp}` : `Auto ${timestamp}`,
        data: version,
      });
      if (error) throw error;
      await fetchVersions();
    } catch (err) {
      setMessage("Error: Version save failed - " + (err as Error).message);
    }
  };

  const handleSave = async (skipVersion?: boolean) => {
    setSaving(true);
    setMessage("");

    try {
      if (!skipVersion) {
        await createVersion();
      }

      const { id, ...settingsWithoutId } = settings;
      if (id) {
        await supabase
          .from("theme_settings")
          .update({ ...settingsWithoutId, updated_at: new Date().toISOString() })
          .eq("id", id);
      } else {
        const { data } = await supabase
          .from("theme_settings")
          .insert(settingsWithoutId)
          .select()
          .single();
        if (data) setSettings({ ...settings, id: data.id });
      }

      const contentRecords = Object.entries(content).map(([key, value]) => ({
        key,
        value: value ?? "",
        type: keyType(key),
      }));
      await supabase.from("site_content").upsert(contentRecords, { onConflict: "key" });

      const existingSections = sections.filter((s) => s.id && !s.id.startsWith("temp_"));
      const newSections = sections.filter((s) => s.id && s.id.startsWith("temp_"));

      if (deletedSectionIds.length > 0) {
        await supabase.from("sections").delete().in("id", deletedSectionIds);
        setDeletedSectionIds([]);
      }

      if (newSections.length > 0) {
        const { data: inserted, error: insertError } = await supabase
          .from("sections")
          .insert(
            newSections.map((section) => ({
              slug: section.slug,
              title: section.title,
              description: section.description,
              tagline: section.tagline,
              cta_text: section.cta_text,
              cta_link: section.cta_link,
              order_index: section.order_index,
            }))
          )
          .select();
        if (insertError) throw insertError;
        if (inserted && inserted.length > 0) {
          const tempMap = new Map(newSections.map((s, idx) => [s.id, inserted[idx]?.id]));
          setSections((prev) =>
            prev.map((s) =>
              s.id && s.id.startsWith("temp_") && tempMap.get(s.id)
                ? { ...s, id: tempMap.get(s.id) as string }
                : s
            )
          );
        }
      }

      await Promise.all(
        existingSections.map((section) =>
          supabase
            .from("sections")
            .update({
              title: section.title,
              description: section.description,
              tagline: section.tagline,
              cta_text: section.cta_text,
              cta_link: section.cta_link,
              order_index: section.order_index,
            })
            .eq("id", section.id)
        )
      );

      setMessage("Changes saved!");
      setPreviewKey((k) => k + 1);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error: " + (err as Error).message);
    }

    setSaving(false);
  };

  const applyPreset = (preset: typeof themePresets[0]) => {
    setSettings((prev) => ({ ...prev, ...preset.theme }));
    setMessage(`Applied "${preset.name}" preset - click Save to apply`);
    setTimeout(() => setMessage(""), 3000);
  };

  const resetToDefault = () => {
    if (confirm("Reset all colors to default? This will discard unsaved changes.")) {
      setSettings((prev) => ({ ...prev, ...defaultTheme }));
      setMessage("Reset to default - click Save to apply");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const updateColor = (field: keyof ThemeSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const updateContent = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const updateSectionField = (id: string, patch: Partial<SectionItem>) => {
    setSections((prev) =>
      prev.map((section) => (section.id === id ? { ...section, ...patch } : section))
    );
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    setSections((prev) => {
      const sorted = [...prev].sort((a, b) => a.order_index - b.order_index);
      const index = sorted.findIndex((s) => s.id === id);
      if (index === -1) return prev;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= sorted.length) return prev;
      const current = sorted[index];
      const target = sorted[targetIndex];
      const updated = sorted.map((s) => {
        if (s.id === current.id) return { ...s, order_index: target.order_index };
        if (s.id === target.id) return { ...s, order_index: current.order_index };
        return s;
      });
      return updated;
    });
  };

  const applyVersion = async (version: SiteVersion, saveNow?: boolean) => {
    setSettings({ ...defaultTheme, ...version.data.theme });
    setContent({ ...defaultContent, ...version.data.content });
    setSections(version.data.sections || []);

    const activeId = version.data.active_background_id || null;
    if (activeId) {
      const media = backgroundMedia.find((m) => m.id === activeId) || null;
      setActiveBackground(media);
    } else {
      setActiveBackground(null);
    }

    setMessage(saveNow ? "Restoring version..." : "Version loaded. Review and save.");
    if (saveNow) {
      await handleSave(true);
    }
  };

  // Background Media Functions
  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      setMessage("Please upload a video or image");
      return;
    }

    setUploading(true);
    try {
      const fileName = `background/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { data: uploadData, error } = await supabase.storage
        .from("media")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage.from("media").getPublicUrl(uploadData.path);

      const { data: mediaData } = await supabase
        .from("background_media")
        .insert({
          url: urlData.publicUrl,
          type: isVideo ? "video" : "image",
          name: file.name,
          is_active: false,
        })
        .select()
        .single();

      if (mediaData) {
        setBackgroundMedia((prev) => [mediaData as BackgroundMedia, ...prev]);
        setMessage("Uploaded! Click on it to set as active.");
      }
    } catch (err) {
      setMessage("Upload error: " + (err as Error).message);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleBackgroundUrlAdd = async () => {
    const url = backgroundUrl.trim();
    if (!url) return;
    setAddingUrl(true);
    try {
      const lower = url.toLowerCase();
      const isVideo = lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".webm");
      const { data: mediaData, error } = await supabase
        .from("background_media")
        .insert({
          url,
          type: isVideo ? "video" : "image",
          name: url.split("/").pop() || "background",
          is_active: false,
        })
        .select()
        .single();

      if (error) throw error;
      if (mediaData) {
        setBackgroundMedia((prev) => [mediaData as BackgroundMedia, ...prev]);
        setMessage("Added! Click on it to set as active.");
      }
      setBackgroundUrl("");
    } catch (err) {
      setMessage("URL error: " + (err as Error).message);
    }
    setAddingUrl(false);
  };

  const setBackgroundActive = async (media: BackgroundMedia | null) => {
    try {
      await supabase.from("background_media").update({ is_active: false }).neq("id", "");

      if (media) {
        await supabase.from("background_media").update({ is_active: true }).eq("id", media.id);
        await supabase.from("site_content").upsert(
          { key: "hero_video", value: media.url, type: "media" },
          { onConflict: "key" }
        );
      } else {
        await supabase.from("site_content").upsert(
          { key: "hero_video", value: "", type: "media" },
          { onConflict: "key" }
        );
      }

      setActiveBackground(media);
      setBackgroundMedia((prev) =>
        prev.map((m) => ({ ...m, is_active: media ? m.id === media.id : false }))
      );
      updateContent("hero_video", media ? media.url : "");
      setPreviewKey((k) => k + 1);
      setMessage(media ? "Background set!" : "Background removed!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error: " + (err as Error).message);
    }
  };

  const deleteBackground = async (media: BackgroundMedia) => {
    if (media.is_active) {
      setMessage("Remove it as active first");
      return;
    }
    if (!confirm("Delete this media?")) return;

    try {
      const path = media.url.split("/media/")[1];
      if (path) await supabase.storage.from("media").remove([path]);
      await supabase.from("background_media").delete().eq("id", media.id);
      setBackgroundMedia((prev) => prev.filter((m) => m.id !== media.id));
      setMessage("Deleted");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error: " + (err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      {/* Left Panel - Controls */}
      <div className="flex-1 space-y-8 max-w-3xl min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-giants italic font-black uppercase tracking-tighter text-white">
              Site Editor
            </h1>
            <p className="text-white/40 text-sm mt-1">Theme, content, and layout in one place</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={resetToDefault} className="bg-transparent border border-white/20 text-[9px]">
              Reset
            </Button>
            <Button onClick={() => createVersion("Manual")} className="bg-transparent border border-white/20 text-[9px]">
              Save Version
            </Button>
            <Button onClick={() => handleSave()} disabled={saving}>
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </Button>
          </div>
        </div>

        {message && (
          <div
            className={`p-3 border text-[10px] font-bold uppercase tracking-widest ${
              message.includes("Error") ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-green-500/50 bg-green-500/10 text-green-400"
            }`}
          >
            {message}
          </div>
        )}

        {/* Presets */}
        <div className="border border-white/10 p-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3">
            Quick Presets
          </h3>
          <div className="flex flex-wrap gap-2">
            {themePresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest border border-white/20 hover:border-white/40 transition-colors flex items-center gap-2"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: preset.theme.primary_color }}
                />
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="border border-white/10 p-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-4">Hero Content</h3>
          <Field label="Main Title">
            <Textarea
              rows={3}
              value={content.hero_title}
              onChange={(e) => updateContent("hero_title", e.target.value)}
              placeholder="CREATE
YOUR
WORLD"
            />
          </Field>
          <Field label="Subtitle">
            <Textarea
              rows={3}
              value={content.hero_subtitle}
              onChange={(e) => updateContent("hero_subtitle", e.target.value)}
              placeholder="WE HELP ARTISTS AND BRANDS..."
            />
          </Field>
        </div>

        {/* Header */}
        <div className="border border-white/10 p-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-4">Header</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand Primary">
              <Input
                value={content.header_brand_primary}
                onChange={(e) => updateContent("header_brand_primary", e.target.value)}
                placeholder="FORENSIC"
              />
            </Field>
            <Field label="Brand Secondary">
              <Input
                value={content.header_brand_secondary}
                onChange={(e) => updateContent("header_brand_secondary", e.target.value)}
                placeholder="WRLD STUDIO"
              />
            </Field>
            <Field label="CTA Text">
              <Input
                value={content.header_cta_text}
                onChange={(e) => updateContent("header_cta_text", e.target.value)}
                placeholder="Book Intake"
              />
            </Field>
            <Field label="CTA Link">
              <Input
                value={content.header_cta_link}
                onChange={(e) => updateContent("header_cta_link", e.target.value)}
                placeholder="/intake"
              />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="border border-white/10 p-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-4">Footer</h3>
          <Field label="Tagline">
            <Textarea
              rows={3}
              value={content.footer_tagline}
              onChange={(e) => updateContent("footer_tagline", e.target.value)}
              placeholder="MANIFESTING THE NEXT ERA..."
            />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Location 1">
              <Input
                value={content.footer_location_1}
                onChange={(e) => updateContent("footer_location_1", e.target.value)}
                placeholder="NYC"
              />
            </Field>
            <Field label="Location 2">
              <Input
                value={content.footer_location_2}
                onChange={(e) => updateContent("footer_location_2", e.target.value)}
                placeholder="LDN"
              />
            </Field>
            <Field label="Location 3">
              <Input
                value={content.footer_location_3}
                onChange={(e) => updateContent("footer_location_3", e.target.value)}
                placeholder="TYO"
              />
            </Field>
          </div>
          <Field label="Copyright">
            <Input
              value={content.footer_copyright}
              onChange={(e) => updateContent("footer_copyright", e.target.value)}
              placeholder="© {year} FORENSIC WRLD ..."
            />
          </Field>
        </div>

        {/* Network Section */}
        <div className="border border-white/10 p-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-4">Network Section</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tagline">
              <Input
                value={content.network_tagline}
                onChange={(e) => updateContent("network_tagline", e.target.value)}
                placeholder="Nationwide Network of Creators"
              />
            </Field>
            <Field label="Description">
              <Textarea
                rows={2}
                value={content.network_description}
                onChange={(e) => updateContent("network_description", e.target.value)}
                placeholder="Gain instant access..."
              />
            </Field>
          </div>
        </div>

        {/* Sections */}
        <div className="border border-white/10 p-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-4">Homepage Sections</h3>
          <div className="space-y-4">
            {sections
              .slice()
              .sort((a, b) => a.order_index - b.order_index)
              .map((section, index) => (
                <div key={section.id} className="border border-white/10 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white">
                      {section.slug}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveSection(section.id, "up")}
                        className="px-2 py-1 text-[9px] font-bold uppercase border border-white/20 hover:border-white/40"
                        disabled={index == 0}
                      >
                        Up
                      </button>
                      <button
                        onClick={() => moveSection(section.id, "down")}
                        className="px-2 py-1 text-[9px] font-bold uppercase border border-white/20 hover:border-white/40"
                        disabled={index == sections.length - 1}
                      >
                        Down
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Title">
                      <Input
                        value={section.title}
                        onChange={(e) => updateSectionField(section.id, { title: e.target.value })}
                      />
                    </Field>
                    <Field label="Tagline">
                      <Input
                        value={section.tagline || ""}
                        onChange={(e) => updateSectionField(section.id, { tagline: e.target.value })}
                      />
                    </Field>
                  </div>
                  <Field label="Description">
                    <Textarea
                      rows={2}
                      value={section.description || ""}
                      onChange={(e) => updateSectionField(section.id, { description: e.target.value })}
                    />
                  </Field>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="CTA Text">
                      <Input
                        value={section.cta_text || ""}
                        onChange={(e) => updateSectionField(section.id, { cta_text: e.target.value })}
                        placeholder="Explore Works"
                      />
                    </Field>
                    <Field label="CTA Link">
                      <Input
                        value={section.cta_link || ""}
                        onChange={(e) => updateSectionField(section.id, { cta_link: e.target.value })}
                        placeholder={`/${section.slug}`}
                      />
                    </Field>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Background Media */}
        <div className="border border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60">
              Homepage Background
            </h3>
            <div className="flex gap-2">
              {(activeBackground || content.hero_video) && (
                <button
                  onClick={() => setBackgroundActive(null)}
                  className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-red-400 border border-red-500/30 hover:bg-red-500/10"
                >
                  Clear
                </button>
              )}
              <label className="cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,image/*"
                  onChange={handleBackgroundUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest border border-white/20 hover:border-white/40 inline-block">
                  {uploading ? "Uploading..." : "+ Upload"}
                </span>
              </label>
            </div>
          </div>
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={backgroundUrl}
              onChange={(e) => setBackgroundUrl(e.target.value)}
              placeholder="Paste image/video URL"
              className="flex-1 bg-transparent border border-white/20 px-3 py-2 text-[10px] text-white/80 focus:outline-none"
            />
            <Button onClick={handleBackgroundUrlAdd} disabled={addingUrl || !backgroundUrl.trim()}>
              {addingUrl ? "ADDING..." : "ADD URL"}
            </Button>
          </div>

          {activeBackground ? (
            <div className="aspect-video bg-black/50 relative overflow-hidden mb-4">
              {activeBackground.type === "video" ? (
                <video src={activeBackground.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              ) : (
                <img src={activeBackground.url} alt="" className="w-full h-full object-cover" />
              )}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500/80 text-[8px] font-bold uppercase tracking-widest">
                Active
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-white/5 border border-dashed border-white/10 flex items-center justify-center mb-4">
              <span className="text-white/30 text-[10px] uppercase tracking-widest">No background set</span>
            </div>
          )}

          {backgroundMedia.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {backgroundMedia.map((media) => (
                <div
                  key={media.id}
                  className={`relative aspect-video bg-black/50 cursor-pointer group overflow-hidden ${
                    media.is_active ? "ring-2 ring-green-500" : "hover:ring-2 hover:ring-white/30"
                  }`}
                  onClick={() => !media.is_active && setBackgroundActive(media)}
                >
                  {media.type === "video" ? (
                    <video src={media.url} muted className="w-full h-full object-cover" />
                  ) : (
                    <img src={media.url} alt="" className="w-full h-full object-cover" />
                  )}
                  {!media.is_active && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteBackground(media); }}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 text-white text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Site Colors */}
        <div className="border border-white/10 p-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-4">
            Site Colors
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <ColorPicker label="Primary" value={settings.primary_color} onChange={(v) => updateColor("primary_color", v)} />
            <ColorPicker label="Background" value={settings.background_color} onChange={(v) => updateColor("background_color", v)} />
            <ColorPicker label="Text" value={settings.text_color} onChange={(v) => updateColor("text_color", v)} />
            <ColorPicker label="Muted Text" value={settings.text_muted_color} onChange={(v) => updateColor("text_muted_color", v)} />
            <ColorPicker label="Accent" value={settings.accent_color} onChange={(v) => updateColor("accent_color", v)} />
            <ColorPicker label="Borders" value={settings.border_color} onChange={(v) => updateColor("border_color", v)} />
          </div>
        </div>

        {/* Typography */}
        <div className="border border-white/10 p-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-4">
            Typography
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Heading Font">
              <select
                value={settings.heading_font}
                onChange={(e) => updateColor("heading_font", e.target.value)}
                className="w-full bg-transparent border border-white/20 px-3 py-2 text-white text-sm"
              >
                {fontOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Body Font">
              <select
                value={settings.body_font}
                onChange={(e) => updateColor("body_font", e.target.value)}
                className="w-full bg-transparent border border-white/20 px-3 py-2 text-white text-sm"
              >
                {fontOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Accent Font">
              <select
                value={settings.accent_font}
                onChange={(e) => updateColor("accent_font", e.target.value)}
                className="w-full bg-transparent border border-white/20 px-3 py-2 text-white text-sm"
              >
                {fontOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Admin Colors */}
        <div className="border border-white/10 p-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-4">
            Admin Panel Colors
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <ColorPicker label="Background" value={settings.admin_bg_color} onChange={(v) => updateColor("admin_bg_color", v)} />
            <ColorPicker label="Sidebar" value={settings.admin_sidebar_color} onChange={(v) => updateColor("admin_sidebar_color", v)} />
            <ColorPicker label="Accent" value={settings.admin_accent_color} onChange={(v) => updateColor("admin_accent_color", v)} />
            <ColorPicker label="Borders" value={settings.admin_border_color} onChange={(v) => updateColor("admin_border_color", v)} />
          </div>
        </div>

        {/* Button Style */}
        <div className="border border-white/10 p-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-4">
            Button Style
          </h3>
          <Field label="Corner Radius">
            <select
              value={settings.button_radius}
              onChange={(e) => updateColor("button_radius", e.target.value)}
              className="w-full bg-transparent border border-white/20 px-3 py-2 text-white text-sm"
            >
              <option value="0px">Sharp (0px)</option>
              <option value="4px">Slight (4px)</option>
              <option value="8px">Rounded (8px)</option>
              <option value="9999px">Pill</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div className={`${previewWide ? "w-[720px]" : "w-[520px]"} flex-shrink-0 transition-all duration-200`}>
        <div className="sticky top-8 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                Live Site Preview
              </h3>
              <button
                onClick={() => setPreviewWide((v) => !v)}
                className="text-[9px] uppercase tracking-widest border border-white/20 px-2 py-1 hover:border-white/40"
              >
                {previewWide ? "Shrink" : "Expand"}
              </button>
            </div>
            <div className="border border-white/10 overflow-hidden bg-black">
              <iframe
                key={previewKey}
                ref={previewFrameRef}
                src="/?preview=1"
                className="w-full h-[720px]"
                onLoad={() => {
                  setPreviewReady(true);
                  sendPreview();
                }}
              />
            </div>
          </div>

          <div className="border border-white/10 p-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3">
              Version History
            </h3>
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {versions.length === 0 && (
                <div className="text-[10px] text-white/40">No versions saved yet.</div>
              )}
              {versions.map((version) => (
                <div key={version.id} className="flex items-center justify-between border border-white/10 p-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/60">
                      {version.label || "Snapshot"}
                    </div>
                    <div className="text-[9px] text-white/40">
                      {new Date(version.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => applyVersion(version)}
                      className="px-2 py-1 text-[9px] font-bold uppercase border border-white/20 hover:border-white/40"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => applyVersion(version, true)}
                      className="px-2 py-1 text-[9px] font-bold uppercase border border-white/20 hover:border-white/40"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 border border-white/20 cursor-pointer relative overflow-hidden flex-shrink-0"
        style={{ backgroundColor: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <div className="flex-1">
        <div className="text-[9px] text-white/40 uppercase tracking-widest">{label}</div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-[10px] text-white font-mono border-none p-0 focus:outline-none"
          maxLength={7}
        />
      </div>
    </div>
  );
}

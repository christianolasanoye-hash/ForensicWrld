"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Field from "@/components/Field";
import Button from "@/components/Button";
import FileUpload from "@/components/admin/FileUpload";

interface SEOSettings {
  id?: string;
  site_title: string;
  site_description: string;
  site_keywords: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
  og_type: string;
  twitter_card: string;
  twitter_handle: string;
  twitter_site: string;
  favicon_url: string;
  apple_touch_icon_url: string;
  canonical_url: string;
  robots: string;
  google_analytics_id: string;
  google_site_verification: string;
}

const defaultSettings: SEOSettings = {
  site_title: "Forensic Wrld",
  site_description: "Creative agency for film, photography, and growth.",
  site_keywords: "creative agency, film, photography, branding, social marketing",
  og_title: "",
  og_description: "",
  og_image_url: "",
  og_type: "website",
  twitter_card: "summary_large_image",
  twitter_handle: "",
  twitter_site: "",
  favicon_url: "",
  apple_touch_icon_url: "",
  canonical_url: "",
  robots: "index, follow",
  google_analytics_id: "",
  google_site_verification: "",
};

export default function SEOPage() {
  const [settings, setSettings] = useState<SEOSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"seo" | "social" | "favicon" | "advanced">("seo");

  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("seo_settings")
      .select("*")
      .single();

    if (data && !error) {
      setSettings({ ...defaultSettings, ...data });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    const { id, ...settingsWithoutId } = settings;

    if (id) {
      // Update existing
      const { error } = await supabase
        .from("seo_settings")
        .update(settingsWithoutId)
        .eq("id", id);

      if (error) {
        setMessage("Error saving settings: " + error.message);
      } else {
        setMessage("Settings saved successfully!");
      }
    } else {
      // Insert new
      const { data, error } = await supabase
        .from("seo_settings")
        .insert(settingsWithoutId)
        .select()
        .single();

      if (error) {
        setMessage("Error saving settings: " + error.message);
      } else {
        setSettings({ ...settings, id: data.id });
        setMessage("Settings saved successfully!");
      }
    }

    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const updateField = (field: keyof SEOSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: "seo", label: "Basic SEO" },
    { id: "social", label: "Social Share" },
    { id: "favicon", label: "Icons" },
    { id: "advanced", label: "Advanced" },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-giants italic font-black uppercase tracking-tighter text-white">
            SEO & Social
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Manage how your site appears in search results and social media shares
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "SAVING..." : "SAVE CHANGES"}
        </Button>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 border text-[10px] font-bold uppercase tracking-widest ${
            message.includes("Error")
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : "border-green-500/50 bg-green-500/10 text-green-400"
          }`}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? "text-white border-b-2 border-white -mb-px"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Basic SEO */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          <Field label="Site Title" hint="Appears in browser tabs and search results">
            <Input
              value={settings.site_title}
              onChange={(e) => updateField("site_title", e.target.value)}
              placeholder="Forensic Wrld"
            />
          </Field>

          <Field label="Site Description" hint="Meta description for search engines (150-160 characters ideal)">
            <Textarea
              value={settings.site_description}
              onChange={(e) => updateField("site_description", e.target.value)}
              placeholder="Creative agency for film, photography, and growth."
              rows={3}
            />
            <div className="text-[9px] text-white/30 mt-1">
              {settings.site_description.length}/160 characters
            </div>
          </Field>

          <Field label="Keywords" hint="Comma-separated keywords for SEO">
            <Input
              value={settings.site_keywords}
              onChange={(e) => updateField("site_keywords", e.target.value)}
              placeholder="creative agency, film, photography"
            />
          </Field>

          <Field label="Robots" hint="Search engine indexing instructions">
            <Input
              value={settings.robots}
              onChange={(e) => updateField("robots", e.target.value)}
              placeholder="index, follow"
            />
          </Field>
        </div>
      )}

      {/* Social Share (Open Graph & Twitter) */}
      {activeTab === "social" && (
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">
              Open Graph (Facebook, LinkedIn, etc.)
            </h3>
            <div className="space-y-6">
              <Field label="OG Title" hint="Title when shared on social media (defaults to site title)">
                <Input
                  value={settings.og_title}
                  onChange={(e) => updateField("og_title", e.target.value)}
                  placeholder="Leave empty to use site title"
                />
              </Field>

              <Field label="OG Description" hint="Description when shared">
                <Textarea
                  value={settings.og_description}
                  onChange={(e) => updateField("og_description", e.target.value)}
                  placeholder="Leave empty to use site description"
                  rows={3}
                />
              </Field>

              <Field label="OG Image" hint="Image shown when shared (1200x630px recommended)">
                <div className="space-y-4">
                  {settings.og_image_url && (
                    <div className="relative aspect-[1200/630] max-w-md border border-white/10 overflow-hidden">
                      <img
                        src={settings.og_image_url}
                        alt="OG Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => updateField("og_image_url", "")}
                        className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 text-[9px] uppercase tracking-widest hover:bg-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <FileUpload
                    folder="seo"
                    accept="image/*"
                    maxSizeMB={5}
                    onUploadComplete={(url) => updateField("og_image_url", url)}
                    onError={(err) => setMessage(err)}
                    label="Upload OG Image (1200x630px)"
                  />
                </div>
              </Field>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">
              Twitter Card
            </h3>
            <div className="space-y-6">
              <Field label="Card Type">
                <select
                  value={settings.twitter_card}
                  onChange={(e) => updateField("twitter_card", e.target.value)}
                  className="w-full bg-transparent border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary Large Image</option>
                </select>
              </Field>

              <Field label="Twitter Handle" hint="Your Twitter/X username (without @)">
                <Input
                  value={settings.twitter_handle}
                  onChange={(e) => updateField("twitter_handle", e.target.value)}
                  placeholder="forensicwrld"
                />
              </Field>

              <Field label="Twitter Site" hint="Site's Twitter account (without @)">
                <Input
                  value={settings.twitter_site}
                  onChange={(e) => updateField("twitter_site", e.target.value)}
                  placeholder="forensicwrld"
                />
              </Field>
            </div>
          </div>

          {/* Preview */}
          <div className="border-t border-white/10 pt-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">
              Share Preview
            </h3>
            <div className="max-w-md border border-white/10 bg-white/5 rounded overflow-hidden">
              {settings.og_image_url && (
                <div className="aspect-[1200/630] bg-white/10">
                  <img
                    src={settings.og_image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
                  forensicwrld.org
                </div>
                <div className="text-white font-bold">
                  {settings.og_title || settings.site_title}
                </div>
                <div className="text-white/60 text-sm mt-1 line-clamp-2">
                  {settings.og_description || settings.site_description}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Favicon & Icons */}
      {activeTab === "favicon" && (
        <div className="space-y-8">
          <Field label="Favicon" hint="Small icon shown in browser tabs (32x32px or .ico file)">
            <div className="space-y-4">
              {settings.favicon_url && (
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 border border-white/10 flex items-center justify-center">
                    <img src={settings.favicon_url} alt="Favicon" className="w-6 h-6" />
                  </div>
                  <button
                    onClick={() => updateField("favicon_url", "")}
                    className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              )}
              <FileUpload
                folder="icons"
                accept="image/x-icon,image/png,image/svg+xml"
                maxSizeMB={1}
                onUploadComplete={(url) => updateField("favicon_url", url)}
                onError={(err) => setMessage(err)}
                label="Upload Favicon"
              />
            </div>
          </Field>

          <Field label="Apple Touch Icon" hint="Icon for iOS home screen (180x180px)">
            <div className="space-y-4">
              {settings.apple_touch_icon_url && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 border border-white/10 rounded-xl overflow-hidden">
                    <img
                      src={settings.apple_touch_icon_url}
                      alt="Apple Touch Icon"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => updateField("apple_touch_icon_url", "")}
                    className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              )}
              <FileUpload
                folder="icons"
                accept="image/png"
                maxSizeMB={1}
                onUploadComplete={(url) => updateField("apple_touch_icon_url", url)}
                onError={(err) => setMessage(err)}
                label="Upload Apple Touch Icon (180x180)"
              />
            </div>
          </Field>
        </div>
      )}

      {/* Advanced */}
      {activeTab === "advanced" && (
        <div className="space-y-6">
          <Field label="Canonical URL" hint="Main URL of your site (for duplicate content prevention)">
            <Input
              value={settings.canonical_url}
              onChange={(e) => updateField("canonical_url", e.target.value)}
              placeholder="https://forensicwrld.org"
            />
          </Field>

          <Field label="Google Analytics ID" hint="GA4 Measurement ID (G-XXXXXXXXXX)">
            <Input
              value={settings.google_analytics_id}
              onChange={(e) => updateField("google_analytics_id", e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
          </Field>

          <Field label="Google Site Verification" hint="Verification code for Google Search Console">
            <Input
              value={settings.google_site_verification}
              onChange={(e) => updateField("google_site_verification", e.target.value)}
              placeholder="Verification code"
            />
          </Field>
        </div>
      )}
    </div>
  );
}

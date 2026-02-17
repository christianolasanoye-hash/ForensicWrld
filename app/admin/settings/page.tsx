"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import SectionHeader from "@/components/SectionHeader";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Field from "@/components/Field";

interface Setting {
  id: string;
  category: string;
  key: string;
  value: string | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = getSupabaseClient();

  // Grouped settings state
  const [general, setGeneral] = useState({ site_name: "", tagline: "" });
  const [social, setSocial] = useState({ instagram: "", tiktok: "", calendly_url: "" });
  const [integrations, setIntegrations] = useState({ google_analytics_id: "", meta_pixel_id: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from("site_settings").select("*");
    if (data) {
      setSettings(data);

      // Parse into groups
      const getVal = (category: string, key: string) =>
        data.find((s: Setting) => s.category === category && s.key === key)?.value || "";

      setGeneral({
        site_name: getVal("general", "site_name"),
        tagline: getVal("general", "tagline"),
      });
      setSocial({
        instagram: getVal("social", "instagram"),
        tiktok: getVal("social", "tiktok"),
        calendly_url: getVal("social", "calendly_url"),
      });
      setIntegrations({
        google_analytics_id: getVal("integrations", "google_analytics_id"),
        meta_pixel_id: getVal("integrations", "meta_pixel_id"),
      });
    }
    setLoading(false);
  };

  const saveSetting = async (category: string, key: string, value: string) => {
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { category, key, value },
        { onConflict: "category,key" }
      );

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Settings saved!");
      setTimeout(() => setMessage(""), 3000);
    }

    setSaving(false);
    fetchSettings();
  };

  const saveAllGeneral = async () => {
    setSaving(true);
    await Promise.all([
      saveSetting("general", "site_name", general.site_name),
      saveSetting("general", "tagline", general.tagline),
    ]);
    setSaving(false);
  };

  const saveAllSocial = async () => {
    setSaving(true);
    await Promise.all([
      saveSetting("social", "instagram", social.instagram),
      saveSetting("social", "tiktok", social.tiktok),
      saveSetting("social", "calendly_url", social.calendly_url),
    ]);
    setSaving(false);
  };

  const saveAllIntegrations = async () => {
    setSaving(true);
    await Promise.all([
      saveSetting("integrations", "google_analytics_id", integrations.google_analytics_id),
      saveSetting("integrations", "meta_pixel_id", integrations.meta_pixel_id),
    ]);
    setSaving(false);
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
    <div className="space-y-8">
      <SectionHeader
        eyebrow="CONFIG"
        title="SETTINGS"
        subtitle="Configure site-wide settings and integrations."
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
        {/* General Settings */}
        <Card title="General" desc="Basic site configuration">
          <div className="space-y-6 py-4">
            <Field label="Site Name">
              <Input
                value={general.site_name}
                onChange={(e) => setGeneral({ ...general, site_name: e.target.value })}
                placeholder="Forensic Wrld"
              />
            </Field>

            <Field label="Tagline">
              <Input
                value={general.tagline}
                onChange={(e) => setGeneral({ ...general, tagline: e.target.value })}
                placeholder="Create Your World"
              />
            </Field>

            <Button onClick={saveAllGeneral} disabled={saving} className="w-full">
              {saving ? "SAVING..." : "SAVE GENERAL SETTINGS"}
            </Button>
          </div>
        </Card>

        {/* Social Links */}
        <Card title="Social Media" desc="Social profile links">
          <div className="space-y-6 py-4">
            <Field label="Instagram URL">
              <Input
                value={social.instagram}
                onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
                placeholder="https://instagram.com/forensicwrld"
              />
            </Field>

            <Field label="TikTok URL">
              <Input
                value={social.tiktok}
                onChange={(e) => setSocial({ ...social, tiktok: e.target.value })}
                placeholder="https://tiktok.com/@forensicwrld"
              />
            </Field>

            <Field label="Calendly URL">
              <Input
                value={social.calendly_url}
                onChange={(e) => setSocial({ ...social, calendly_url: e.target.value })}
                placeholder="https://calendly.com/forensicwrld"
              />
            </Field>

            <Button onClick={saveAllSocial} disabled={saving} className="w-full">
              {saving ? "SAVING..." : "SAVE SOCIAL SETTINGS"}
            </Button>
          </div>
        </Card>

        {/* Integrations */}
        <Card title="Integrations" desc="Analytics and tracking">
          <div className="space-y-6 py-4">
            <Field label="Google Analytics ID" hint="e.g., G-XXXXXXXXXX">
              <Input
                value={integrations.google_analytics_id}
                onChange={(e) => setIntegrations({ ...integrations, google_analytics_id: e.target.value })}
                placeholder="G-XXXXXXXXXX"
              />
            </Field>

            <Field label="Meta Pixel ID">
              <Input
                value={integrations.meta_pixel_id}
                onChange={(e) => setIntegrations({ ...integrations, meta_pixel_id: e.target.value })}
                placeholder="1234567890"
              />
            </Field>

            <Button onClick={saveAllIntegrations} disabled={saving} className="w-full">
              {saving ? "SAVING..." : "SAVE INTEGRATIONS"}
            </Button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card title="Account" desc="Admin account settings">
          <div className="space-y-6 py-4">
            <div className="border border-white/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                Change Password
              </p>
              <p className="text-[9px] text-white/60 mb-4">
                Password changes are handled through Supabase Auth. Use the password reset feature on the login page.
              </p>
              <a
                href="/admin/login"
                className="text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white"
              >
                GO TO LOGIN →
              </a>
            </div>

            <div className="border border-red-500/20 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/60 mb-2">
                Danger Zone
              </p>
              <p className="text-[9px] text-white/40">
                Contact support to delete your account or export all data.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* All Settings Reference */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 border-b border-white/10 pb-4">
          All Settings
        </h3>

        <div className="grid gap-2">
          {settings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between border border-white/5 p-4 text-[9px] uppercase tracking-widest"
            >
              <span className="font-bold text-white/60">{setting.category}</span>
              <span className="font-bold text-white">{setting.key}</span>
              <span className="text-white/40 truncate max-w-[300px]">
                {setting.value || "(empty)"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

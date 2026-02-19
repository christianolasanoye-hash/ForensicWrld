"use client";

import { useState, useEffect, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import Input from "@/components/Input";
import Field from "@/components/Field";
import Button from "@/components/Button";

interface CustomFont {
  id: string;
  name: string;
  url: string;
  format: string;
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
  // Admin Colors
  admin_bg_color: string;
  admin_sidebar_color: string;
  admin_card_color: string;
  admin_accent_color: string;
  admin_text_color: string;
  admin_text_muted_color: string;
  admin_border_color: string;
  // Fonts
  heading_font: string;
  body_font: string;
  accent_font: string;
  custom_fonts: CustomFont[];
  // Styles
  button_style: string;
  button_radius: string;
  card_radius: string;
  image_radius: string;
}

const defaultSettings: ThemeSettings = {
  // Site colors
  primary_color: "#FFFFFF",
  secondary_color: "#000000",
  accent_color: "#FFFFFF",
  background_color: "#000000",
  text_color: "#FFFFFF",
  text_muted_color: "#999999",
  border_color: "#333333",
  // Admin colors
  admin_bg_color: "#000000",
  admin_sidebar_color: "#000000",
  admin_card_color: "#111111",
  admin_accent_color: "#FFFFFF",
  admin_text_color: "#FFFFFF",
  admin_text_muted_color: "#666666",
  admin_border_color: "#222222",
  // Fonts
  heading_font: "Giants",
  body_font: "Polar Vortex",
  accent_font: "Jamday",
  custom_fonts: [],
  // Styles
  button_style: "solid",
  button_radius: "0px",
  card_radius: "0px",
  image_radius: "0px",
};

const builtInFonts = [
  { name: "Giants", variable: "--font-giants" },
  { name: "Polar Vortex", variable: "--font-polar" },
  { name: "Jamday", variable: "--font-jamday" },
];

export default function ThemePage() {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"colors" | "admin" | "fonts" | "styles">("colors");
  const [uploadingFont, setUploadingFont] = useState(false);
  const fontInputRef = useRef<HTMLInputElement>(null);

  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("theme_settings")
        .select("*")
        .single();

      if (data && !error) {
        setSettings({
          ...defaultSettings,
          ...data,
          custom_fonts: data.custom_fonts || [],
        });
      }
    } catch (err) {
      console.error("Error fetching theme settings:", err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    const { id, ...settingsWithoutId } = settings;

    try {
      if (id) {
        const { error } = await supabase
          .from("theme_settings")
          .update({
            ...settingsWithoutId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("theme_settings")
          .insert(settingsWithoutId)
          .select()
          .single();

        if (error) throw error;
        setSettings({ ...settings, id: data.id });
      }
      setMessage("Theme settings saved successfully!");
    } catch (err) {
      setMessage("Error saving settings: " + (err as Error).message);
    }

    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const updateField = <K extends keyof ThemeSettings>(field: K, value: ThemeSettings[K]) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validFormats = [".ttf", ".otf", ".woff", ".woff2"];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

    if (!validFormats.includes(extension)) {
      setMessage("Invalid font format. Please upload .ttf, .otf, .woff, or .woff2 files.");
      return;
    }

    setUploadingFont(true);
    setMessage("");

    try {
      const fileName = `fonts/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("assets")
        .upload(fileName, file, {
          contentType: file.type || "font/" + extension.slice(1),
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from("assets").getPublicUrl(data.path);

      const fontName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const format = extension === ".ttf" ? "truetype" : extension === ".otf" ? "opentype" : extension.slice(1);

      const newFont: CustomFont = {
        id: Date.now().toString(),
        name: fontName,
        url: urlData.publicUrl,
        format,
      };

      updateField("custom_fonts", [...settings.custom_fonts, newFont]);
      setMessage(`Font "${fontName}" uploaded successfully!`);
    } catch (err) {
      setMessage("Error uploading font: " + (err as Error).message);
    }

    setUploadingFont(false);
    if (fontInputRef.current) fontInputRef.current.value = "";
  };

  const removeFont = async (fontId: string) => {
    const font = settings.custom_fonts.find((f) => f.id === fontId);
    if (!font) return;

    // Remove from storage
    try {
      const path = font.url.split("/assets/")[1];
      if (path) {
        await supabase.storage.from("assets").remove([path]);
      }
    } catch (err) {
      console.error("Error removing font file:", err);
    }

    updateField(
      "custom_fonts",
      settings.custom_fonts.filter((f) => f.id !== fontId)
    );
  };

  const getAllFonts = () => {
    return [
      ...builtInFonts.map((f) => f.name),
      ...settings.custom_fonts.map((f) => f.name),
    ];
  };

  const tabs = [
    { id: "colors", label: "Site Colors" },
    { id: "admin", label: "Admin Theme" },
    { id: "fonts", label: "Typography" },
    { id: "styles", label: "Styles" },
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
            Theme & Design
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Customize colors, fonts, and visual styles for your site
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

      {/* Colors Tab */}
      {activeTab === "colors" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ColorField
              label="Primary Color"
              hint="Main brand color"
              value={settings.primary_color}
              onChange={(v) => updateField("primary_color", v)}
            />
            <ColorField
              label="Secondary Color"
              hint="Secondary brand color"
              value={settings.secondary_color}
              onChange={(v) => updateField("secondary_color", v)}
            />
            <ColorField
              label="Accent Color"
              hint="Highlights and CTAs"
              value={settings.accent_color}
              onChange={(v) => updateField("accent_color", v)}
            />
            <ColorField
              label="Background Color"
              hint="Page background"
              value={settings.background_color}
              onChange={(v) => updateField("background_color", v)}
            />
            <ColorField
              label="Text Color"
              hint="Primary text color"
              value={settings.text_color}
              onChange={(v) => updateField("text_color", v)}
            />
            <ColorField
              label="Muted Text Color"
              hint="Secondary/muted text"
              value={settings.text_muted_color}
              onChange={(v) => updateField("text_muted_color", v)}
            />
            <ColorField
              label="Border Color"
              hint="Borders and dividers"
              value={settings.border_color}
              onChange={(v) => updateField("border_color", v)}
            />
          </div>

          {/* Preview */}
          <div className="border-t border-white/10 pt-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">
              Preview
            </h3>
            <div
              className="p-8 border"
              style={{
                backgroundColor: settings.background_color,
                borderColor: settings.border_color,
              }}
            >
              <h4
                className="text-2xl font-giants italic font-bold mb-2"
                style={{ color: settings.text_color }}
              >
                Sample Heading
              </h4>
              <p className="mb-4" style={{ color: settings.text_muted_color }}>
                This is a preview of how your colors will look on the site.
              </p>
              <button
                className="px-6 py-3 text-sm font-bold uppercase tracking-widest"
                style={{
                  backgroundColor: settings.primary_color,
                  color: settings.secondary_color,
                }}
              >
                Button Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Theme Tab */}
      {activeTab === "admin" && (
        <div className="space-y-8">
          <div className="p-4 border border-yellow-500/30 bg-yellow-500/10 text-[10px] font-bold uppercase tracking-widest text-yellow-400 mb-6">
            These colors apply to the admin dashboard you&apos;re currently viewing
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ColorField
              label="Background"
              hint="Main admin background"
              value={settings.admin_bg_color}
              onChange={(v) => updateField("admin_bg_color", v)}
            />
            <ColorField
              label="Sidebar"
              hint="Sidebar background color"
              value={settings.admin_sidebar_color}
              onChange={(v) => updateField("admin_sidebar_color", v)}
            />
            <ColorField
              label="Cards"
              hint="Card and panel backgrounds"
              value={settings.admin_card_color}
              onChange={(v) => updateField("admin_card_color", v)}
            />
            <ColorField
              label="Accent"
              hint="Active states and highlights"
              value={settings.admin_accent_color}
              onChange={(v) => updateField("admin_accent_color", v)}
            />
            <ColorField
              label="Text"
              hint="Primary text color"
              value={settings.admin_text_color}
              onChange={(v) => updateField("admin_text_color", v)}
            />
            <ColorField
              label="Muted Text"
              hint="Secondary/muted text"
              value={settings.admin_text_muted_color}
              onChange={(v) => updateField("admin_text_muted_color", v)}
            />
            <ColorField
              label="Borders"
              hint="Borders and dividers"
              value={settings.admin_border_color}
              onChange={(v) => updateField("admin_border_color", v)}
            />
          </div>

          {/* Admin Preview */}
          <div className="border-t border-white/10 pt-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">
              Preview
            </h3>
            <div className="flex gap-4 max-w-3xl">
              {/* Sidebar Preview */}
              <div
                className="w-48 p-4 flex-shrink-0"
                style={{
                  backgroundColor: settings.admin_sidebar_color,
                  borderRight: `1px solid ${settings.admin_border_color}`,
                }}
              >
                <div
                  className="text-sm font-bold mb-4"
                  style={{ color: settings.admin_text_color }}
                >
                  FORENSIC
                </div>
                <div className="space-y-2">
                  <div
                    className="px-3 py-2 text-[10px] uppercase tracking-widest"
                    style={{
                      backgroundColor: settings.admin_accent_color + "20",
                      color: settings.admin_text_color,
                      borderLeft: `2px solid ${settings.admin_accent_color}`,
                    }}
                  >
                    Dashboard
                  </div>
                  <div
                    className="px-3 py-2 text-[10px] uppercase tracking-widest"
                    style={{ color: settings.admin_text_muted_color }}
                  >
                    Gallery
                  </div>
                  <div
                    className="px-3 py-2 text-[10px] uppercase tracking-widest"
                    style={{ color: settings.admin_text_muted_color }}
                  >
                    Settings
                  </div>
                </div>
              </div>

              {/* Main Content Preview */}
              <div
                className="flex-1 p-6"
                style={{ backgroundColor: settings.admin_bg_color }}
              >
                <h4
                  className="text-xl font-bold mb-4"
                  style={{ color: settings.admin_text_color }}
                >
                  Dashboard
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="p-4"
                    style={{
                      backgroundColor: settings.admin_card_color,
                      border: `1px solid ${settings.admin_border_color}`,
                    }}
                  >
                    <div
                      className="text-[10px] uppercase tracking-widest mb-1"
                      style={{ color: settings.admin_text_muted_color }}
                    >
                      Total Views
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: settings.admin_text_color }}
                    >
                      12,345
                    </div>
                  </div>
                  <div
                    className="p-4"
                    style={{
                      backgroundColor: settings.admin_card_color,
                      border: `1px solid ${settings.admin_border_color}`,
                    }}
                  >
                    <div
                      className="text-[10px] uppercase tracking-widest mb-1"
                      style={{ color: settings.admin_text_muted_color }}
                    >
                      Submissions
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: settings.admin_text_color }}
                    >
                      89
                    </div>
                  </div>
                </div>
                <button
                  className="mt-4 px-4 py-2 text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    backgroundColor: settings.admin_accent_color,
                    color: settings.admin_bg_color,
                  }}
                >
                  Action Button
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fonts Tab */}
      {activeTab === "fonts" && (
        <div className="space-y-8">
          {/* Font Assignments */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Heading Font" hint="Used for titles and headers">
              <select
                value={settings.heading_font}
                onChange={(e) => updateField("heading_font", e.target.value)}
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none"
              >
                {getAllFonts().map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Body Font" hint="Used for paragraphs and text">
              <select
                value={settings.body_font}
                onChange={(e) => updateField("body_font", e.target.value)}
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none"
              >
                {getAllFonts().map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Accent Font" hint="Used for labels and accents">
              <select
                value={settings.accent_font}
                onChange={(e) => updateField("accent_font", e.target.value)}
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none"
              >
                {getAllFonts().map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Built-in Fonts */}
          <div className="border-t border-white/10 pt-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">
              Built-in Fonts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {builtInFonts.map((font) => (
                <div
                  key={font.name}
                  className="p-4 border border-white/10 bg-white/5"
                >
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">
                    {font.name}
                  </div>
                  <div
                    className="text-2xl"
                    style={{ fontFamily: `var(${font.variable})` }}
                  >
                    Aa Bb Cc 123
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Fonts */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">
                Custom Fonts
              </h3>
              <label className="cursor-pointer">
                <input
                  ref={fontInputRef}
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={handleFontUpload}
                  className="hidden"
                  disabled={uploadingFont}
                />
                <span className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-white/20 hover:border-white/40 transition-colors">
                  {uploadingFont ? "Uploading..." : "+ Upload Font"}
                </span>
              </label>
            </div>

            {settings.custom_fonts.length === 0 ? (
              <div className="p-8 border border-dashed border-white/10 text-center">
                <div className="text-white/40 text-sm mb-2">No custom fonts uploaded</div>
                <div className="text-white/20 text-[10px] uppercase tracking-widest">
                  Upload .ttf, .otf, .woff, or .woff2 files
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {settings.custom_fonts.map((font) => (
                  <div
                    key={font.id}
                    className="p-4 border border-white/10 bg-white/5 relative group"
                  >
                    <style>
                      {`@font-face {
                        font-family: '${font.name}';
                        src: url('${font.url}') format('${font.format}');
                      }`}
                    </style>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">
                      {font.name}
                    </div>
                    <div className="text-2xl" style={{ fontFamily: font.name }}>
                      Aa Bb Cc 123
                    </div>
                    <button
                      onClick={() => removeFont(font.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] uppercase tracking-widest text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Styles Tab */}
      {activeTab === "styles" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Button Style" hint="Style for buttons across the site">
              <select
                value={settings.button_style}
                onChange={(e) => updateField("button_style", e.target.value)}
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none"
              >
                <option value="solid">Solid</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </select>
            </Field>

            <Field label="Button Radius" hint="Corner radius for buttons">
              <select
                value={settings.button_radius}
                onChange={(e) => updateField("button_radius", e.target.value)}
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none"
              >
                <option value="0px">None (Sharp corners)</option>
                <option value="4px">Small (4px)</option>
                <option value="8px">Medium (8px)</option>
                <option value="12px">Large (12px)</option>
                <option value="9999px">Full (Pill shape)</option>
              </select>
            </Field>

            <Field label="Card Radius" hint="Corner radius for cards and containers">
              <select
                value={settings.card_radius}
                onChange={(e) => updateField("card_radius", e.target.value)}
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none"
              >
                <option value="0px">None (Sharp corners)</option>
                <option value="4px">Small (4px)</option>
                <option value="8px">Medium (8px)</option>
                <option value="12px">Large (12px)</option>
                <option value="16px">Extra Large (16px)</option>
              </select>
            </Field>

            <Field label="Image Radius" hint="Corner radius for images">
              <select
                value={settings.image_radius}
                onChange={(e) => updateField("image_radius", e.target.value)}
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none"
              >
                <option value="0px">None (Sharp corners)</option>
                <option value="4px">Small (4px)</option>
                <option value="8px">Medium (8px)</option>
                <option value="12px">Large (12px)</option>
                <option value="9999px">Full (Circle/Pill)</option>
              </select>
            </Field>
          </div>

          {/* Button Preview */}
          <div className="border-t border-white/10 pt-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">
              Button Preview
            </h3>
            <div className="flex flex-wrap gap-4">
              {settings.button_style === "solid" && (
                <button
                  className="px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all"
                  style={{
                    backgroundColor: settings.primary_color,
                    color: settings.secondary_color,
                    borderRadius: settings.button_radius,
                  }}
                >
                  Solid Button
                </button>
              )}
              {settings.button_style === "outline" && (
                <button
                  className="px-6 py-3 text-sm font-bold uppercase tracking-widest border-2 transition-all"
                  style={{
                    borderColor: settings.primary_color,
                    color: settings.primary_color,
                    borderRadius: settings.button_radius,
                  }}
                >
                  Outline Button
                </button>
              )}
              {settings.button_style === "ghost" && (
                <button
                  className="px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all hover:bg-white/10"
                  style={{
                    color: settings.primary_color,
                    borderRadius: settings.button_radius,
                  }}
                >
                  Ghost Button
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Color field component
function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 border border-white/20 cursor-pointer relative overflow-hidden flex-shrink-0"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#FFFFFF"
          className="flex-1 font-mono"
          maxLength={7}
        />
      </div>
    </Field>
  );
}

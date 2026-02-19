"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";

interface SiteTheme {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  text_muted_color: string;
  border_color: string;
  button_style: string;
  button_radius: string;
  card_radius: string;
  image_radius: string;
  heading_font: string;
  body_font: string;
  accent_font: string;
}

const defaultTheme: SiteTheme = {
  primary_color: "#FFFFFF",
  secondary_color: "#000000",
  accent_color: "#FFFFFF",
  background_color: "#000000",
  text_color: "#FFFFFF",
  text_muted_color: "#999999",
  border_color: "#333333",
  button_style: "solid",
  button_radius: "0px",
  card_radius: "0px",
  image_radius: "0px",
  heading_font: "Giants",
  body_font: "Polar Vortex",
  accent_font: "Jamday",
};

const SiteThemeContext = createContext<SiteTheme>(defaultTheme);

export function useSiteTheme() {
  return useContext(SiteThemeContext);
}

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<SiteTheme>(defaultTheme);
  const [previewTheme, setPreviewTheme] = useState<SiteTheme | null>(null);
  const [mounted, setMounted] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    setMounted(true);
    fetchTheme();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("site_theme_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "theme_settings" },
        (payload: { new: Record<string, unknown> | null }) => {
          if (payload.new) {
            updateThemeFromPayload(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const { type, payload } = event.data || {};
      if (type === "site_preview" && payload?.theme) {
        setPreviewTheme({
          primary_color: payload.theme.primary_color || defaultTheme.primary_color,
          secondary_color: payload.theme.secondary_color || defaultTheme.secondary_color,
          accent_color: payload.theme.accent_color || defaultTheme.accent_color,
          background_color: payload.theme.background_color || defaultTheme.background_color,
          text_color: payload.theme.text_color || defaultTheme.text_color,
          text_muted_color: payload.theme.text_muted_color || defaultTheme.text_muted_color,
          border_color: payload.theme.border_color || defaultTheme.border_color,
          button_style: payload.theme.button_style || defaultTheme.button_style,
          button_radius: payload.theme.button_radius || defaultTheme.button_radius,
          card_radius: payload.theme.card_radius || defaultTheme.card_radius,
          image_radius: payload.theme.image_radius || defaultTheme.image_radius,
          heading_font: payload.theme.heading_font || defaultTheme.heading_font,
          body_font: payload.theme.body_font || defaultTheme.body_font,
          accent_font: payload.theme.accent_font || defaultTheme.accent_font,
        });
      }
      if (type === "site_preview_clear") {
        setPreviewTheme(null);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const updateThemeFromPayload = (data: Record<string, unknown>) => {
    setTheme({
      primary_color: (data.primary_color as string) || defaultTheme.primary_color,
      secondary_color: (data.secondary_color as string) || defaultTheme.secondary_color,
      accent_color: (data.accent_color as string) || defaultTheme.accent_color,
      background_color: (data.background_color as string) || defaultTheme.background_color,
      text_color: (data.text_color as string) || defaultTheme.text_color,
      text_muted_color: (data.text_muted_color as string) || defaultTheme.text_muted_color,
      border_color: (data.border_color as string) || defaultTheme.border_color,
      button_style: (data.button_style as string) || defaultTheme.button_style,
      button_radius: (data.button_radius as string) || defaultTheme.button_radius,
      card_radius: (data.card_radius as string) || defaultTheme.card_radius,
      image_radius: (data.image_radius as string) || defaultTheme.image_radius,
      heading_font: (data.heading_font as string) || defaultTheme.heading_font,
      body_font: (data.body_font as string) || defaultTheme.body_font,
      accent_font: (data.accent_font as string) || defaultTheme.accent_font,
    });
  };

  const fetchTheme = async () => {
    try {
      const { data, error } = await supabase
        .from("theme_settings")
        .select("*")
        .single();

      if (data && !error) {
        updateThemeFromPayload(data);
      }
    } catch (err) {
      console.error("Error fetching site theme:", err);
    }
  };

  // Apply CSS variables when theme changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const activeTheme = previewTheme || theme;
    const fontMap: Record<string, string> = {
      "Giants": "var(--font-giants)",
      "Polar Vortex": "var(--font-polar)",
      "Jamday": "var(--font-jamday)",
    };
    const headingFont = fontMap[activeTheme.heading_font] || "var(--font-giants)";
    const bodyFont = fontMap[activeTheme.body_font] || "var(--font-jamday)";
    const accentFont = fontMap[activeTheme.accent_font] || "var(--font-polar)";

    // Colors
    root.style.setProperty("--site-primary", activeTheme.primary_color);
    root.style.setProperty("--site-secondary", activeTheme.secondary_color);
    root.style.setProperty("--site-accent", activeTheme.accent_color);
    root.style.setProperty("--site-background", activeTheme.background_color);
    root.style.setProperty("--site-text", activeTheme.text_color);
    root.style.setProperty("--site-text-muted", activeTheme.text_muted_color);
    root.style.setProperty("--site-border", activeTheme.border_color);

    // Styles
    root.style.setProperty("--site-button-radius", activeTheme.button_radius);
    root.style.setProperty("--site-card-radius", activeTheme.card_radius);
    root.style.setProperty("--site-image-radius", activeTheme.image_radius);
    root.style.setProperty("--site-font-heading", headingFont);
    root.style.setProperty("--site-font-body", bodyFont);
    root.style.setProperty("--site-font-accent", accentFont);

    // Update body background
    document.body.style.backgroundColor = activeTheme.background_color;
    document.body.style.color = activeTheme.text_color;
  }, [theme, previewTheme, mounted]);

  return (
    <SiteThemeContext.Provider value={theme}>
      <style jsx global>{`
        :root {
          --site-primary: ${theme.primary_color};
          --site-secondary: ${theme.secondary_color};
          --site-accent: ${theme.accent_color};
          --site-background: ${theme.background_color};
          --site-text: ${theme.text_color};
          --site-text-muted: ${theme.text_muted_color};
          --site-border: ${theme.border_color};
          --site-button-radius: ${theme.button_radius};
          --site-card-radius: ${theme.card_radius};
          --site-image-radius: ${theme.image_radius};
        }
      `}</style>
      {children}
    </SiteThemeContext.Provider>
  );
}

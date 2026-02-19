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
        (payload) => {
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

    // Colors
    root.style.setProperty("--site-primary", theme.primary_color);
    root.style.setProperty("--site-secondary", theme.secondary_color);
    root.style.setProperty("--site-accent", theme.accent_color);
    root.style.setProperty("--site-background", theme.background_color);
    root.style.setProperty("--site-text", theme.text_color);
    root.style.setProperty("--site-text-muted", theme.text_muted_color);
    root.style.setProperty("--site-border", theme.border_color);

    // Styles
    root.style.setProperty("--site-button-radius", theme.button_radius);
    root.style.setProperty("--site-card-radius", theme.card_radius);
    root.style.setProperty("--site-image-radius", theme.image_radius);

    // Update body background
    document.body.style.backgroundColor = theme.background_color;
    document.body.style.color = theme.text_color;
  }, [theme, mounted]);

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

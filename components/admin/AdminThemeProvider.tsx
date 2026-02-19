"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";

interface AdminTheme {
  admin_bg_color: string;
  admin_sidebar_color: string;
  admin_card_color: string;
  admin_accent_color: string;
  admin_text_color: string;
  admin_text_muted_color: string;
  admin_border_color: string;
}

const defaultTheme: AdminTheme = {
  admin_bg_color: "#000000",
  admin_sidebar_color: "#000000",
  admin_card_color: "#111111",
  admin_accent_color: "#FFFFFF",
  admin_text_color: "#FFFFFF",
  admin_text_muted_color: "#666666",
  admin_border_color: "#222222",
};

const AdminThemeContext = createContext<AdminTheme>(defaultTheme);

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AdminTheme>(defaultTheme);
  const [mounted, setMounted] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    setMounted(true);
    fetchTheme();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("theme_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "theme_settings" },
        (payload) => {
          if (payload.new) {
            setTheme({
              admin_bg_color: payload.new.admin_bg_color || defaultTheme.admin_bg_color,
              admin_sidebar_color: payload.new.admin_sidebar_color || defaultTheme.admin_sidebar_color,
              admin_card_color: payload.new.admin_card_color || defaultTheme.admin_card_color,
              admin_accent_color: payload.new.admin_accent_color || defaultTheme.admin_accent_color,
              admin_text_color: payload.new.admin_text_color || defaultTheme.admin_text_color,
              admin_text_muted_color: payload.new.admin_text_muted_color || defaultTheme.admin_text_muted_color,
              admin_border_color: payload.new.admin_border_color || defaultTheme.admin_border_color,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTheme = async () => {
    try {
      const { data, error } = await supabase
        .from("theme_settings")
        .select("admin_bg_color, admin_sidebar_color, admin_card_color, admin_accent_color, admin_text_color, admin_text_muted_color, admin_border_color")
        .single();

      if (data && !error) {
        setTheme({
          admin_bg_color: data.admin_bg_color || defaultTheme.admin_bg_color,
          admin_sidebar_color: data.admin_sidebar_color || defaultTheme.admin_sidebar_color,
          admin_card_color: data.admin_card_color || defaultTheme.admin_card_color,
          admin_accent_color: data.admin_accent_color || defaultTheme.admin_accent_color,
          admin_text_color: data.admin_text_color || defaultTheme.admin_text_color,
          admin_text_muted_color: data.admin_text_muted_color || defaultTheme.admin_text_muted_color,
          admin_border_color: data.admin_border_color || defaultTheme.admin_border_color,
        });
      }
    } catch (err) {
      console.error("Error fetching admin theme:", err);
    }
  };

  // Apply CSS variables when theme changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.style.setProperty("--admin-bg", theme.admin_bg_color);
    root.style.setProperty("--admin-sidebar", theme.admin_sidebar_color);
    root.style.setProperty("--admin-card", theme.admin_card_color);
    root.style.setProperty("--admin-accent", theme.admin_accent_color);
    root.style.setProperty("--admin-text", theme.admin_text_color);
    root.style.setProperty("--admin-text-muted", theme.admin_text_muted_color);
    root.style.setProperty("--admin-border", theme.admin_border_color);
  }, [theme, mounted]);

  return (
    <AdminThemeContext.Provider value={theme}>
      <style jsx global>{`
        :root {
          --admin-bg: ${theme.admin_bg_color};
          --admin-sidebar: ${theme.admin_sidebar_color};
          --admin-card: ${theme.admin_card_color};
          --admin-accent: ${theme.admin_accent_color};
          --admin-text: ${theme.admin_text_color};
          --admin-text-muted: ${theme.admin_text_muted_color};
          --admin-border: ${theme.admin_border_color};
        }
      `}</style>
      {children}
    </AdminThemeContext.Provider>
  );
}

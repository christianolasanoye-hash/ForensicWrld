"use client";

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

// Generate a session ID that persists for the browser session
const getSessionId = () => {
  if (typeof window === "undefined") return "";

  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
};

// Track page view
const trackPageView = async (pagePath: string) => {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "pageview",
        data: {
          page_path: pagePath,
          referrer: document.referrer || undefined,
          session_id: getSessionId(),
        },
      }),
    });
  } catch {
    // Silently fail - analytics shouldn't break the app
  }
};

// Track custom event
export const trackEvent = async (
  eventType: "click" | "video_play" | "video_complete" | "scroll" | "form_start" | "external_link",
  options: {
    category?: string;
    label?: string;
    value?: number;
    metadata?: Record<string, unknown>;
  } = {}
) => {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "event",
        data: {
          event_type: eventType,
          event_category: options.category,
          event_label: options.label,
          event_value: options.value,
          page_path: window.location.pathname,
          metadata: options.metadata,
          session_id: getSessionId(),
        },
      }),
    });
  } catch {
    // Silently fail
  }
};

// Analytics Provider Component
export default function Analytics() {
  const pathname = usePathname();

  // Track page views on route change
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  // Track scroll depth
  useEffect(() => {
    let maxScroll = 0;
    let tracked25 = false;
    let tracked50 = false;
    let tracked75 = false;
    let tracked100 = false;

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;

        if (maxScroll >= 25 && !tracked25) {
          tracked25 = true;
          trackEvent("scroll", { category: "engagement", label: "25%", value: 25 });
        }
        if (maxScroll >= 50 && !tracked50) {
          tracked50 = true;
          trackEvent("scroll", { category: "engagement", label: "50%", value: 50 });
        }
        if (maxScroll >= 75 && !tracked75) {
          tracked75 = true;
          trackEvent("scroll", { category: "engagement", label: "75%", value: 75 });
        }
        if (maxScroll >= 100 && !tracked100) {
          tracked100 = true;
          trackEvent("scroll", { category: "engagement", label: "100%", value: 100 });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Track external link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      if (link && link.href && !link.href.startsWith(window.location.origin)) {
        trackEvent("external_link", {
          category: "outbound",
          label: link.href,
        });
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null; // This component doesn't render anything
}

// Hook for tracking video events
export function useVideoTracking(videoId: string) {
  const trackVideoPlay = useCallback(() => {
    trackEvent("video_play", { category: "video", label: videoId });
  }, [videoId]);

  const trackVideoComplete = useCallback(() => {
    trackEvent("video_complete", { category: "video", label: videoId });
  }, [videoId]);

  return { trackVideoPlay, trackVideoComplete };
}

// Hook for tracking form interactions
export function useFormTracking(formName: string) {
  const trackFormStart = useCallback(() => {
    trackEvent("form_start", { category: "form", label: formName });
  }, [formName]);

  return { trackFormStart };
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import { createClient } from "@supabase/supabase-js";

const jamday = localFont({
  src: "../public/fonts/JamdaypersonaluseRegular-jEMql.otf",
  variable: "--font-jamday",
  display: "swap",
});

const polarVortex = localFont({
  src: "../public/fonts/PolarVortex-raAA.ttf",
  variable: "--font-polar",
  display: "swap",
});

const giants = localFont({
  src: "../public/fonts/GiantsItalicPersonalUseBoldItalic-x3q6m.ttf",
  variable: "--font-giants",
  display: "swap",
});

// Fetch SEO settings for metadata
async function getSEOSettings() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder")) {
    return null;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase.from("seo_settings").select("*").single();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOSettings();

  const title = seo?.site_title || "Forensic Wrld";
  const description = seo?.site_description || "Creative agency for film, photography, and growth. Minimal, premium, and built for momentum.";

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords: seo?.site_keywords?.split(",").map((k: string) => k.trim()) || [
      "creative agency",
      "film",
      "photography",
      "branding",
    ],
    robots: seo?.robots || "index, follow",
    openGraph: {
      type: (seo?.og_type as "website" | "article") || "website",
      title: seo?.og_title || title,
      description: seo?.og_description || description,
      siteName: title,
      images: seo?.og_image_url ? [{ url: seo.og_image_url, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: (seo?.twitter_card as "summary" | "summary_large_image") || "summary_large_image",
      title: seo?.og_title || title,
      description: seo?.og_description || description,
      images: seo?.og_image_url ? [seo.og_image_url] : [],
      creator: seo?.twitter_handle ? `@${seo.twitter_handle}` : undefined,
      site: seo?.twitter_site ? `@${seo.twitter_site}` : undefined,
    },
    icons: {
      icon: seo?.favicon_url || "/favicon.ico",
      apple: seo?.apple_touch_icon_url || undefined,
    },
    verification: {
      google: seo?.google_site_verification || undefined,
    },
    metadataBase: seo?.canonical_url ? new URL(seo.canonical_url) : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jamday.variable} ${polarVortex.variable} ${giants.variable} font-sans antialiased min-h-screen bg-black text-white`}
      >
        <Analytics />
        <Nav />
        <main className="">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

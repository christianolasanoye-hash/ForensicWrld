"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import SectionHeader from "@/components/SectionHeader";
import NewsletterSignup from "@/components/NewsletterSignup";
import { supabase } from "@/lib/supabase";

interface MerchItem {
  id: string;
  name: string;
  description: string | null;
  status: string;
  image_url: string | null;
  price: number | null;
  external_link: string | null;
}

interface SectionContent {
  title: string;
  description: string;
  tagline: string;
}

const defaultLifestylePhotos = [
  "/merch/IMG_7095.JPG",
  "/merch/IMG_7100.jpeg",
  "/merch/IMG_7101.jpeg",
  "/merch/IMG_7103.jpeg",
  "/merch/IMG_7105.jpeg",
];

export default function MerchPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [merchItems, setMerchItems] = useState<MerchItem[]>([]);
  const [sectionContent, setSectionContent] = useState<SectionContent>({
    title: "Merch",
    description: "Help us fund our endeavors.",
    tagline: "SUPPORT THE MOVEMENT",
  });
  const [galleryImages, setGalleryImages] = useState<string[]>(defaultLifestylePhotos);

  useEffect(() => {
    const timer = setInterval(() => {
      setGalleryImages((imgs) => {
        setCurrentSlide((prev) => (prev + 1) % imgs.length);
        return imgs;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!supabase) return;

      // Fetch section content
      const { data: sectionData } = await supabase
        .from("sections")
        .select("title, description, tagline")
        .eq("slug", "merch")
        .single();

      if (sectionData) {
        setSectionContent({
          title: sectionData.title || "Merch",
          description: sectionData.description || "Help us fund our endeavors.",
          tagline: sectionData.tagline || "SUPPORT THE MOVEMENT",
        });
      }

      // Fetch merch items
      const { data: merchData } = await supabase
        .from("merch")
        .select("*")
        .order("order_index");

      if (merchData && merchData.length > 0) {
        setMerchItems(merchData);
      }

      // Fetch gallery images
      const { data: galleryData } = await supabase
        .from("gallery_assets")
        .select("url")
        .eq("category", "merch")
        .order("order_index");

      if (galleryData && galleryData.length > 0) {
        setGalleryImages(galleryData.map((g: { url: string }) => g.url));
      }
    }

    fetchData();
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "preview":
        return "Preview";
      case "coming_soon":
        return "Coming Soon";
      case "available":
        return "Available";
      case "sold_out":
        return "Sold Out";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "sold_out":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "coming_soon":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-white/10 text-white/60 border-white/20";
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-12 pb-32">
      <SectionHeader
        eyebrow={sectionContent.tagline}
        title={sectionContent.title}
        subtitle={sectionContent.description.toUpperCase()}
      />

      {/* Hero Slider */}
      <div className="relative aspect-[16/9] w-full overflow-hidden border border-white/5 bg-black">
        {galleryImages.map((photo, index) => (
          <div
            key={photo}
            className={`absolute inset-0 transition-all duration-[2s] ease-out ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-110"
            }`}
          >
            <Image
              src={photo}
              alt={`Merch lifestyle ${index + 1}`}
              fill
              className="object-cover opacity-60"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
          </div>
        ))}

        {/* Slider Controls */}
        <div className="absolute bottom-12 left-12 flex gap-4">
          {galleryImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-[2px] transition-all duration-500 ${
                index === currentSlide ? "w-12 bg-white" : "w-4 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="absolute top-12 right-12">
          <span className="font-polar text-[8px] tracking-[1em] text-white/20 uppercase text-vertical">
            CATALOG // FORENSIC WRLD
          </span>
        </div>
      </div>

      {/* Product Grid */}
      {merchItems.length > 0 && (
        <div className="mt-20">
          <h2 className="text-3xl font-giants italic font-black uppercase tracking-tighter text-white mb-8">
            The Collection
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchItems.map((item) => (
              <div
                key={item.id}
                className="group border border-white/10 bg-black hover:border-white/20 transition-all"
              >
                {item.image_url ? (
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-white/5 flex items-center justify-center">
                    <span className="text-white/20 text-4xl">◪</span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">
                      {item.name}
                    </h3>
                    <span
                      className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 border ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-[10px] text-white/40 leading-relaxed mb-4">
                      {item.description}
                    </p>
                  )}
                  {item.price && item.status === "available" && (
                    <p className="text-lg font-bold text-white">${item.price.toFixed(2)}</p>
                  )}
                  {item.external_link && item.status === "available" && (
                    <a
                      href={item.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block text-[10px] font-bold uppercase tracking-widest text-white border border-white px-6 py-3 hover:bg-white hover:text-black transition-all"
                    >
                      Shop Now →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter Section */}
      <div className="mt-32 max-w-2xl">
        <h2 className="text-5xl font-giants italic font-black uppercase tracking-tighter text-white mb-8">
          Get Drop Alerts
        </h2>
        <p className="text-white/40 text-sm uppercase tracking-widest leading-relaxed mb-8">
          Be the first to know when new merch drops. Sign up for exclusive updates and early access.
        </p>
        <NewsletterSignup source="merch_page" buttonText="NOTIFY ME" />
      </div>
    </div>
  );
}

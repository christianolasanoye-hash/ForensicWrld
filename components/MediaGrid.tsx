"use client";

import { useState } from "react";
import Image from "next/image";

interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  caption?: string;
}

interface MediaGridProps {
  items: MediaItem[];
  sectionTitle: string;
}

export default function MediaGrid({ items, sectionTitle }: MediaGridProps) {
  const images = items.filter((item) => item.type === "image").slice(0, 3);
  const videos = items.filter((item) => item.type === "video").slice(0, 3);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  return (
    <>
      {/* Images Section */}
      {images.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-zinc-950">Images</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {images.map((item) => (
              <div
                key={item.id}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 transition-transform hover:scale-105"
                onClick={() => setSelectedMedia(item)}
              >
                  <div className="relative aspect-[4/3] w-full bg-zinc-200">
                    {item.url && !item.url.includes("placeholder") ? (
                      <Image
                        src={item.url}
                        alt={item.caption || `${sectionTitle} image`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center border border-dashed border-zinc-300 bg-zinc-100">
                        <span className="text-sm text-zinc-500">Image Preview</span>
                      </div>
                    )}
                  </div>
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {item.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Section */}
      {videos.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-zinc-950">Videos</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {videos.map((item) => (
              <div
                key={item.id}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 transition-transform hover:scale-105"
                onClick={() => setSelectedMedia(item)}
              >
                <div className="relative aspect-[4/3] w-full bg-zinc-200">
                  {item.url && !item.url.includes("placeholder") ? (
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center border border-dashed border-zinc-300 bg-zinc-100">
                      <span className="text-sm text-zinc-500">Video Preview</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity group-hover:bg-black/10">
                    <div className="rounded-full bg-white/90 p-4 opacity-80 transition-opacity group-hover:opacity-100">
                      <svg
                        className="h-8 w-8 text-black"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {item.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for full-size view */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setSelectedMedia(null)}
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw]">
            {selectedMedia.type === "image" ? (
              <Image
                src={selectedMedia.url}
                alt={selectedMedia.caption || "Full size"}
                width={1200}
                height={800}
                className="max-h-[90vh] w-auto rounded-lg object-contain"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="max-h-[90vh] w-auto rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            )}
            {selectedMedia.caption && (
              <div className="mt-4 text-center text-white">{selectedMedia.caption}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}


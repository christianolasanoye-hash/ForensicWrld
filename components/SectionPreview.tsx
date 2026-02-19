"use client";

import Image from "next/image";
import Link from "next/link";

interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  caption?: string;
}

interface SectionPreviewProps {
  items: MediaItem[];
  sectionSlug: string;
  showVideos?: boolean;
  isPreview?: boolean;
  onAddMedia?: (sectionSlug: string, file: File) => void;
  onReplaceMedia?: (mediaId: string, file: File) => void;
}

export default function SectionPreview({
  items,
  sectionSlug,
  showVideos = false,
  isPreview = false,
  onAddMedia,
  onReplaceMedia,
}: SectionPreviewProps) {
  const media = [...items].slice(0, 3);
  const canAdd = isPreview && typeof onAddMedia === "function";
  const canReplace = isPreview && typeof onReplaceMedia === "function";

  if (media.length === 0) {
    return (
      <div className="flex gap-4 h-[400px]">
        <div className="flex-1 bg-white/5 border border-white/10 animate-pulse relative">
          {canAdd && (
            <label className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-white/60 cursor-pointer">
              + Add Media
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onAddMedia(sectionSlug, file);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          )}
        </div>
        <div className="w-1/3 bg-white/5 border border-white/10 animate-pulse relative">
          {canAdd && (
            <label className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-white/60 cursor-pointer">
              + Add Media
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onAddMedia(sectionSlug, file);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-[400px] sm:h-[600px]">
      {/* Main Large Item */}
      <div className="col-span-8 h-full relative group overflow-hidden bg-white/5">
        {canReplace && media[0]?.id && (
          <label className="absolute top-2 right-2 z-10 text-[9px] uppercase tracking-widest bg-black/60 border border-white/20 px-2 py-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
            Replace
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onReplaceMedia(media[0].id, file);
                e.currentTarget.value = "";
              }}
            />
          </label>
        )}
        {isPreview ? (
          <div className="block h-full w-full" aria-label={`Preview ${sectionSlug} works`}>
            {media[0]?.type === "image" ? (
              <img
                src={media[0].url}
                alt={`${sectionSlug} featured work - ${media[0].caption || 'Portfolio item'}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <video
                src={media[0]?.url}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                autoPlay
                muted
                loop
                playsInline
              />
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
          </div>
        ) : (
          <Link href={`/${sectionSlug}`} className="block h-full w-full" aria-label={`View ${sectionSlug} works`}>
          {media[0]?.type === "image" ? (
            <Image
              src={media[0].url}
              alt={`${sectionSlug} featured work - ${media[0].caption || 'Portfolio item'}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <video
              src={media[0]?.url}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              autoPlay
              muted
              loop
              playsInline
            />
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
          </Link>
        )}
      </div>

      {/* Side Column */}
      <div className="col-span-4 flex flex-col gap-4">
        {/* Secondary Medium Item */}
        <div className="flex-1 relative group overflow-hidden bg-white/5">
          {canReplace && media[1]?.id && (
            <label className="absolute top-2 right-2 z-10 text-[9px] uppercase tracking-widest bg-black/60 border border-white/20 px-2 py-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              Replace
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onReplaceMedia(media[1].id, file);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          )}
          {isPreview ? (
            <div className="block h-full w-full" aria-label={`Preview ${sectionSlug} secondary work`}>
              {media[1] ? (
                media[1].type === "image" ? (
                  <img
                    src={media[1].url}
                    alt={`${sectionSlug} portfolio image 2`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <video src={media[1].url} className="h-full w-full object-cover" autoPlay muted loop playsInline aria-label={`${sectionSlug} work video 2`} />
                )
              ) : (
                <div className="h-full w-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                  {canAdd ? (
                    <label className="text-[10px] uppercase tracking-widest text-white/60 cursor-pointer">
                      + Add Media
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onAddMedia(sectionSlug, file);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  ) : (
                    <span className="font-polar text-[8px] tracking-widest opacity-40">PENDING//</span>
                  )}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />
            </div>
          ) : (
            <Link href={`/${sectionSlug}`} className="block h-full w-full" aria-label={`View ${sectionSlug} secondary work`}>
            {media[1] ? (
              media[1].type === "image" ? (
                <Image
                  src={media[1].url}
                  alt={`${sectionSlug} portfolio image 2`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <video src={media[1].url} className="h-full w-full object-cover" autoPlay muted loop playsInline aria-label={`${sectionSlug} work video 2`} />
              )
            ) : (
              <div className="h-full w-full bg-white/5" />
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />
            </Link>
          )}
        </div>

        {/* Third Small Item or Placeholder */}
        <div className="h-1/3 relative group overflow-hidden bg-white/5">
          {canReplace && media[2]?.id && (
            <label className="absolute top-2 right-2 z-10 text-[9px] uppercase tracking-widest bg-black/60 border border-white/20 px-2 py-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              Replace
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onReplaceMedia(media[2].id, file);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          )}
          {isPreview ? (
            <div className="block h-full w-full" aria-label={`Preview ${sectionSlug} tertiary work`}>
              {media[2] ? (
                media[2].type === "image" ? (
                  <img
                    src={media[2].url}
                    alt={`${sectionSlug} portfolio image 3`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <video src={media[2].url} className="h-full w-full object-cover" autoPlay muted loop playsInline aria-label={`${sectionSlug} work video 3`} />
                )
              ) : (
                <div className="h-full w-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                  {canAdd ? (
                    <label className="text-[10px] uppercase tracking-widest text-white/60 cursor-pointer">
                      + Add Media
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onAddMedia(sectionSlug, file);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  ) : (
                    <span className="font-polar text-[8px] tracking-widest opacity-40">PENDING//</span>
                  )}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />
            </div>
          ) : (
            <Link href={`/${sectionSlug}`} className="block h-full w-full" aria-label={`View ${sectionSlug} tertiary work`}>
            {media[2] ? (
              media[2].type === "image" ? (
                <Image
                  src={media[2].url}
                  alt={`${sectionSlug} portfolio image 3`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <video src={media[2].url} className="h-full w-full object-cover" autoPlay muted loop playsInline aria-label={`${sectionSlug} work video 3`} />
              )
            ) : (
              <div className="h-full w-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                <span className="font-polar text-[8px] tracking-widest opacity-40">PENDING//</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

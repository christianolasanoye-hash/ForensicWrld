"use client";

import { useState, useEffect, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import Button from "@/components/Button";
import Field from "@/components/Field";

interface MediaItem {
  id: string;
  url: string;
  type: "video" | "image";
  name: string;
  created_at: string;
  is_active: boolean;
}

export default function BackgroundMediaPage() {
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchMediaLibrary();
  }, []);

  const fetchMediaLibrary = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("background_media")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setMediaLibrary(data);
        const active = data.find((m: MediaItem) => m.is_active);
        setActiveMedia(active || null);
      }
    } catch (err) {
      console.error("Error fetching media:", err);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      setMessage("Please upload a video or image file");
      return;
    }

    // Check file size (100MB max for videos, 10MB for images)
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage(`File too large. Max size: ${isVideo ? "100MB" : "10MB"}`);
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const fileName = `background/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(uploadData.path);

      // Add to database
      const { data: mediaData, error: dbError } = await supabase
        .from("background_media")
        .insert({
          url: urlData.publicUrl,
          type: isVideo ? "video" : "image",
          name: file.name,
          is_active: false,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setMediaLibrary((prev) => [mediaData, ...prev]);
      setMessage("Media uploaded successfully!");
    } catch (err) {
      setMessage("Error uploading: " + (err as Error).message);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const setAsActive = async (media: MediaItem) => {
    try {
      // Deactivate all
      await supabase
        .from("background_media")
        .update({ is_active: false })
        .neq("id", "");

      // Activate selected
      const { error } = await supabase
        .from("background_media")
        .update({ is_active: true })
        .eq("id", media.id);

      if (error) throw error;

      // Also update site_content for backward compatibility
      await supabase
        .from("site_content")
        .upsert({ key: "hero_video", value: media.url, type: "media" }, { onConflict: "key" });

      setActiveMedia(media);
      setMediaLibrary((prev) =>
        prev.map((m) => ({ ...m, is_active: m.id === media.id }))
      );
      setMessage("Background updated!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error: " + (err as Error).message);
    }
  };

  const deleteMedia = async (media: MediaItem) => {
    if (media.is_active) {
      setMessage("Cannot delete active background. Select another first.");
      return;
    }

    if (!confirm("Delete this media? This cannot be undone.")) return;

    try {
      // Delete from storage
      const path = media.url.split("/media/")[1];
      if (path) {
        await supabase.storage.from("media").remove([path]);
      }

      // Delete from database
      const { error } = await supabase
        .from("background_media")
        .delete()
        .eq("id", media.id);

      if (error) throw error;

      setMediaLibrary((prev) => prev.filter((m) => m.id !== media.id));
      setMessage("Media deleted");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error deleting: " + (err as Error).message);
    }
  };

  const clearBackground = async () => {
    try {
      await supabase
        .from("background_media")
        .update({ is_active: false })
        .neq("id", "");

      await supabase
        .from("site_content")
        .upsert({ key: "hero_video", value: "", type: "media" }, { onConflict: "key" });

      setActiveMedia(null);
      setMediaLibrary((prev) => prev.map((m) => ({ ...m, is_active: false })));
      setMessage("Background cleared");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error: " + (err as Error).message);
    }
  };

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-giants italic font-black uppercase tracking-tighter text-white">
            Background Media
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Manage homepage background videos and images
          </p>
        </div>
        <div className="flex gap-4">
          {activeMedia && (
            <Button onClick={clearBackground} className="bg-transparent border border-white/20">
              CLEAR BACKGROUND
            </Button>
          )}
          <label className="cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
            <span className="inline-flex items-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-widest bg-white text-black hover:bg-white/90 transition-colors">
              {uploading ? "UPLOADING..." : "+ UPLOAD MEDIA"}
            </span>
          </label>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 border text-[10px] font-bold uppercase tracking-widest ${
            message.includes("Error") || message.includes("Cannot")
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : "border-green-500/50 bg-green-500/10 text-green-400"
          }`}
        >
          {message}
        </div>
      )}

      {/* Current Active Background */}
      <div className="border border-white/10 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-4">
          Current Background
        </h2>
        {activeMedia ? (
          <div className="relative aspect-video max-w-2xl bg-black/50 overflow-hidden">
            {activeMedia.type === "video" ? (
              <video
                src={activeMedia.url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={activeMedia.url}
                alt="Background"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-[10px] uppercase tracking-widest text-white/60">
                {activeMedia.type} • {activeMedia.name}
              </div>
            </div>
          </div>
        ) : (
          <div className="aspect-video max-w-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
            <div className="text-center">
              <div className="text-white/40 text-sm mb-2">No background selected</div>
              <div className="text-white/20 text-[10px] uppercase tracking-widest">
                Upload or select from library below
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Media Library */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-4">
          Media Library ({mediaLibrary.length})
        </h2>

        {mediaLibrary.length === 0 ? (
          <div className="p-12 border border-dashed border-white/10 text-center">
            <div className="text-white/40 text-sm mb-2">No media uploaded yet</div>
            <div className="text-white/20 text-[10px] uppercase tracking-widest">
              Upload videos (.mp4, .mov, .webm) or images (.jpg, .png, .webp)
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaLibrary.map((media) => (
              <div
                key={media.id}
                className={`relative group border overflow-hidden ${
                  media.is_active
                    ? "border-green-500 ring-2 ring-green-500/20"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <div className="aspect-video bg-black/50">
                  {media.type === "video" ? (
                    <video
                      src={media.url}
                      muted
                      className="w-full h-full object-cover"
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  ) : (
                    <img
                      src={media.url}
                      alt={media.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!media.is_active && (
                    <>
                      <button
                        onClick={() => setAsActive(media)}
                        className="px-3 py-2 bg-white text-black text-[9px] font-bold uppercase tracking-widest hover:bg-green-400 transition-colors"
                      >
                        Use
                      </button>
                      <button
                        onClick={() => deleteMedia(media)}
                        className="px-3 py-2 bg-red-500/80 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {media.is_active && (
                    <span className="px-3 py-2 bg-green-500 text-white text-[9px] font-bold uppercase tracking-widest">
                      Active
                    </span>
                  )}
                </div>

                {/* Info bar */}
                <div className="p-2 bg-black/80">
                  <div className="text-[9px] text-white/60 truncate">{media.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[8px] uppercase tracking-widest px-1.5 py-0.5 ${
                        media.type === "video"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-purple-500/20 text-purple-400"
                      }`}
                    >
                      {media.type}
                    </span>
                    {media.is_active && (
                      <span className="text-[8px] uppercase tracking-widest px-1.5 py-0.5 bg-green-500/20 text-green-400">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="border border-white/10 p-6 bg-white/5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white mb-3">
          Tips for Best Results
        </h3>
        <ul className="space-y-2 text-[11px] text-white/50">
          <li>• <strong>Videos:</strong> Use .mp4 or .webm format, 1080p or 4K resolution, under 100MB</li>
          <li>• <strong>Images:</strong> Use .jpg or .webp format, 1920x1080px minimum, under 10MB</li>
          <li>• Dark or high-contrast backgrounds work best with light text overlays</li>
          <li>• Videos will autoplay, loop, and be muted on the homepage</li>
        </ul>
      </div>
    </div>
  );
}

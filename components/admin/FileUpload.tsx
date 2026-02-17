"use client";

import { useState, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import { isAllowedFileType, isAllowedFileSize } from "@/lib/security";

interface FileUploadProps {
  bucket?: string;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
  onUploadComplete: (url: string, filename: string) => void;
  onError?: (error: string) => void;
  label?: string;
}

export default function FileUpload({
  bucket = "media",
  folder = "uploads",
  accept = "image/*,video/*",
  maxSizeMB = 50,
  onUploadComplete,
  onError,
  label = "Drag & Drop or Click to Upload",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = getSupabaseClient();

  const handleFile = async (file: File) => {
    // Validate file type
    if (!isAllowedFileType(file.type)) {
      onError?.("File type not allowed. Please upload an image or video.");
      return;
    }

    // Validate file size
    if (!isAllowedFileSize(file.size, maxSizeMB)) {
      onError?.(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // Generate unique filename
      const ext = file.name.split(".").pop();
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const filename = `${timestamp}-${random}.${ext}`;
      const path = `${folder}/${filename}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      setProgress(100);
      onUploadComplete(publicUrl, file.name);
    } catch (error) {
      console.error("Upload error:", error);
      onError?.("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div
      className={`relative border border-dashed transition-all ${
        isDragging
          ? "border-white bg-white/10"
          : "border-white/20 hover:border-white/40"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={isUploading}
        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />

      <div className="p-8 text-center">
        {isUploading ? (
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              Uploading... {progress}%
            </div>
            <div className="w-full h-1 bg-white/10">
              <div
                className="h-full bg-white transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            {isDragging ? "Drop file here" : label}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import SectionHeader from "@/components/SectionHeader";
import Button from "@/components/Button";
import Field from "@/components/Field";
import Input from "@/components/Input";
import FileUpload from "@/components/admin/FileUpload";
import Modal from "@/components/admin/Modal";

interface GalleryItem {
  id: string;
  category: string;
  type: string;
  url: string;
  thumbnail_url: string | null;
  filename: string | null;
  caption: string | null;
  alt_text: string | null;
  is_featured: boolean;
  order_index: number;
  created_at: string;
}

const CATEGORIES = ["photography", "film", "social", "events", "merch"];

export default function GalleryManagement() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("photography");
  const [message, setMessage] = useState("");
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchGallery();
  }, [selectedCategory]);

  const fetchGallery = async () => {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("gallery_assets")
      .select("*")
      .eq("category", selectedCategory)
      .order("order_index")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Failed to load gallery items. Please refresh the page.");
      console.error("Gallery fetch error:", error);
    } else if (data) {
      setItems(data);
    }
    setLoading(false);
  };

  const handleUpload = async (url: string, filename: string) => {
    const fileType = filename.match(/\.(mp4|mov|webm|avi)$/i) ? "video" : "image";

    const { error } = await supabase.from("gallery_assets").insert({
      category: selectedCategory,
      type: fileType,
      url,
      filename,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Item added to gallery!");
      setTimeout(() => setMessage(""), 3000);
      fetchGallery();
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    const { error } = await supabase.from("gallery_assets").delete().eq("id", id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Item deleted!");
      setTimeout(() => setMessage(""), 3000);
      fetchGallery();
    }
  };

  const updateItem = async () => {
    if (!editItem) return;

    const { error } = await supabase
      .from("gallery_assets")
      .update({
        caption: editItem.caption,
        alt_text: editItem.alt_text,
        is_featured: editItem.is_featured,
        order_index: editItem.order_index,
      })
      .eq("id", editItem.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Item updated!");
      setTimeout(() => setMessage(""), 3000);
      setIsModalOpen(false);
      setEditItem(null);
      fetchGallery();
    }
  };

  const toggleFeatured = async (item: GalleryItem) => {
    const { error } = await supabase
      .from("gallery_assets")
      .update({ is_featured: !item.is_featured })
      .eq("id", item.id);

    if (!error) {
      fetchGallery();
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="MEDIA"
        title="GALLERY"
        subtitle="Manage photos and videos across all sections."
      />

      {message && (
        <div className={`border p-4 text-[10px] font-bold uppercase tracking-widest ${
          message.includes("Error")
            ? "border-red-500/50 bg-red-500/10 text-red-400"
            : "border-green-500/50 bg-green-500/10 text-green-400"
        }`}>
          {message}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 border transition-all ${
              selectedCategory === cat
                ? "border-white bg-white text-black"
                : "border-white/20 text-white/40 hover:border-white/40 hover:text-white/60"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Upload Section */}
      <div className="border border-white/10 p-6">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-4">
          Upload to {selectedCategory}
        </h3>
        <FileUpload
          folder={`gallery/${selectedCategory}`}
          onUploadComplete={handleUpload}
          onError={(err) => setMessage(`Error: ${err}`)}
        />
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 animate-pulse">
            Loading...
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-white/20 p-12 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            No items in {selectedCategory} gallery
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative border border-white/10 overflow-hidden"
            >
              {/* Media Preview */}
              <div className="aspect-square bg-white/5">
                {item.type === "video" ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.alt_text || item.filename || "Gallery item"}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Featured Badge */}
              {item.is_featured && (
                <div className="absolute top-2 left-2 bg-white text-black text-[7px] font-bold uppercase tracking-widest px-2 py-1">
                  Featured
                </div>
              )}

              {/* Type Badge */}
              <div className="absolute top-2 right-2 bg-black/80 text-white text-[7px] font-bold uppercase tracking-widest px-2 py-1">
                {item.type}
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setEditItem(item);
                    setIsModalOpen(true);
                  }}
                  className="text-[9px] font-bold uppercase tracking-widest text-white border border-white px-3 py-2 hover:bg-white hover:text-black transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleFeatured(item)}
                  className="text-[9px] font-bold uppercase tracking-widest text-white border border-white px-3 py-2 hover:bg-white hover:text-black transition-colors"
                >
                  {item.is_featured ? "Unfeature" : "Feature"}
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-[9px] font-bold uppercase tracking-widest text-red-400 border border-red-400 px-3 py-2 hover:bg-red-400 hover:text-black transition-colors"
                >
                  Delete
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-[9px] text-white/60 truncate">
                  {item.caption || item.filename || "Untitled"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditItem(null);
        }}
        title="Edit Gallery Item"
        onSave={updateItem}
      >
        {editItem && (
          <div className="space-y-6">
            <div className="aspect-video bg-white/5 overflow-hidden">
              {editItem.type === "video" ? (
                <video src={editItem.url} className="w-full h-full object-contain" controls />
              ) : (
                <img src={editItem.url} alt="" className="w-full h-full object-contain" />
              )}
            </div>

            <Field label="Caption">
              <Input
                value={editItem.caption || ""}
                onChange={(e) => setEditItem({ ...editItem, caption: e.target.value })}
                placeholder="Add a caption..."
              />
            </Field>

            <Field label="Alt Text (for accessibility)">
              <Input
                value={editItem.alt_text || ""}
                onChange={(e) => setEditItem({ ...editItem, alt_text: e.target.value })}
                placeholder="Describe the image..."
              />
            </Field>

            <Field label="Order Index">
              <Input
                type="number"
                value={editItem.order_index}
                onChange={(e) => setEditItem({ ...editItem, order_index: parseInt(e.target.value) || 0 })}
              />
            </Field>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={editItem.is_featured}
                onChange={(e) => setEditItem({ ...editItem, is_featured: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                Featured Item
              </span>
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}

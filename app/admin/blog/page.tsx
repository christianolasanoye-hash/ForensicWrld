"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import SectionHeader from "@/components/SectionHeader";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Field from "@/components/Field";
import Modal from "@/components/admin/Modal";
import FileUpload from "@/components/admin/FileUpload";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  category: string | null;
  tags: string[] | null;
  author_name: string;
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
}

const emptyPost: Omit<BlogPost, "id" | "created_at"> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featured_image_url: "",
  category: "",
  tags: [],
  author_name: "Forensic Wrld",
  status: "draft",
  is_featured: false,
  published_at: null,
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState(emptyPost);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [tagsInput, setTagsInput] = useState("");

  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      setPosts(data);
    }
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData(emptyPost);
    setTagsInput("");
    setShowModal(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      featured_image_url: post.featured_image_url || "",
      category: post.category || "",
      tags: post.tags || [],
      author_name: post.author_name,
      status: post.status,
      is_featured: post.is_featured,
      published_at: post.published_at,
    });
    setTagsInput((post.tags || []).join(", "));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      setMessage("Title and content are required");
      return;
    }

    setSaving(true);
    setMessage("");

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);

    const postData = {
      ...formData,
      tags,
      slug: formData.slug || generateSlug(formData.title),
      published_at:
        formData.status === "published" && !formData.published_at
          ? new Date().toISOString()
          : formData.published_at,
    };

    if (editingPost) {
      const { error } = await supabase
        .from("blog_posts")
        .update(postData)
        .eq("id", editingPost.id);

      if (error) {
        setMessage("Error updating post: " + error.message);
      } else {
        setShowModal(false);
        fetchPosts();
      }
    } else {
      const { error } = await supabase.from("blog_posts").insert(postData);

      if (error) {
        setMessage("Error creating post: " + error.message);
      } else {
        setShowModal(false);
        fetchPosts();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const { error } = await supabase.from("blog_posts").delete().eq("id", id);

    if (!error) {
      fetchPosts();
    }
  };

  const togglePublish = async (post: BlogPost) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    const { error } = await supabase
      .from("blog_posts")
      .update({
        status: newStatus,
        published_at:
          newStatus === "published" ? new Date().toISOString() : post.published_at,
      })
      .eq("id", post.id);

    if (!error) {
      fetchPosts();
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === "all") return true;
    return post.status === filter;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <SectionHeader
          eyebrow="CONTENT"
          title="BLOG"
          subtitle="Create and manage blog posts."
        />
        <Button onClick={openCreateModal}>+ NEW POST</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
              filter === f
                ? "bg-white text-black"
                : "border border-white/20 text-white/60 hover:border-white/40"
            }`}
          >
            {f} ({posts.filter((p) => f === "all" || p.status === f).length})
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="border border-white/10 p-12 text-center">
          <div className="text-2xl mb-4">◳</div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            No posts yet. Create your first blog post.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="border border-white/10 p-6 hover:border-white/20 transition-all"
            >
              <div className="flex gap-6">
                {post.featured_image_url && (
                  <div className="w-32 h-24 flex-shrink-0 bg-white/5 overflow-hidden">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white truncate">
                        {post.title}
                      </h3>
                      <p className="text-[10px] text-white/40 mt-1">
                        /{post.slug} • {formatDate(post.created_at)}
                        {post.published_at &&
                          ` • Published ${formatDate(post.published_at)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 border ${
                          post.status === "published"
                            ? "border-green-500/30 text-green-400 bg-green-500/10"
                            : post.status === "draft"
                            ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/10"
                            : "border-white/20 text-white/40"
                        }`}
                      >
                        {post.status}
                      </span>
                      {post.is_featured && (
                        <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-1 border border-blue-500/30 text-blue-400 bg-blue-500/10">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  {post.excerpt && (
                    <p className="text-sm text-white/60 mt-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => openEditModal(post)}
                      className="text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => togglePublish(post)}
                      className="text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white"
                    >
                      {post.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white"
                    >
                      View →
                    </a>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-[10px] font-bold uppercase tracking-widest text-red-400/60 hover:text-red-400 ml-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPost ? "Edit Post" : "New Post"}
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {message && (
            <div className="p-4 border border-red-500/50 bg-red-500/10 text-[10px] font-bold uppercase tracking-widest text-red-400">
              {message}
            </div>
          )}

          <Field label="Title">
            <Input
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Post title..."
            />
          </Field>

          <Field label="Slug" hint="URL-friendly identifier">
            <Input
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              placeholder="post-slug"
            />
          </Field>

          <Field label="Excerpt" hint="Short summary for previews">
            <Textarea
              value={formData.excerpt || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
              }
              placeholder="Brief description..."
              rows={2}
            />
          </Field>

          <Field label="Content">
            <Textarea
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Write your post content here... (Markdown supported)"
              rows={12}
            />
          </Field>

          <Field label="Featured Image">
            {formData.featured_image_url && (
              <div className="mb-4 relative aspect-video max-w-sm border border-white/10 overflow-hidden">
                <img
                  src={formData.featured_image_url}
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, featured_image_url: "" }))
                  }
                  className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 text-[9px] uppercase tracking-widest hover:bg-red-500"
                >
                  Remove
                </button>
              </div>
            )}
            <FileUpload
              folder="blog"
              accept="image/*"
              maxSizeMB={10}
              onUploadComplete={(url) =>
                setFormData((prev) => ({ ...prev, featured_image_url: url }))
              }
              label="Upload Featured Image"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Input
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                placeholder="e.g., News, Behind the Scenes"
              />
            </Field>

            <Field label="Author">
              <Input
                value={formData.author_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, author_name: e.target.value }))
                }
                placeholder="Author name"
              />
            </Field>
          </div>

          <Field label="Tags" hint="Comma-separated">
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="photography, bts, events"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as "draft" | "published" | "archived",
                  }))
                }
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>

            <Field label="Featured">
              <label className="flex items-center gap-3 py-3">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_featured: e.target.checked,
                    }))
                  }
                  className="w-4 h-4"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Feature this post
                </span>
              </label>
            </Field>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? "SAVING..." : editingPost ? "UPDATE POST" : "CREATE POST"}
            </Button>
            <Button
              onClick={() => setShowModal(false)}
              className="bg-transparent border border-white/20 hover:bg-white/10"
            >
              CANCEL
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

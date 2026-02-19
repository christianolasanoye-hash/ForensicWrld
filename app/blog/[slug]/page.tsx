"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
  published_at: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    if (!supabase) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !data) {
      setNotFound(true);
    } else {
      setPost(data);
    }
    setLoading(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    // Split by double newlines for paragraphs
    const paragraphs = content.split(/\n\n+/);

    return paragraphs.map((paragraph, i) => {
      // Check for headers
      if (paragraph.startsWith("# ")) {
        return (
          <h1 key={i} className="text-4xl font-giants italic font-black uppercase tracking-tighter text-white mt-12 mb-6">
            {paragraph.slice(2)}
          </h1>
        );
      }
      if (paragraph.startsWith("## ")) {
        return (
          <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4">
            {paragraph.slice(3)}
          </h2>
        );
      }
      if (paragraph.startsWith("### ")) {
        return (
          <h3 key={i} className="text-xl font-bold text-white mt-8 mb-3">
            {paragraph.slice(4)}
          </h3>
        );
      }

      // Check for blockquotes
      if (paragraph.startsWith("> ")) {
        return (
          <blockquote key={i} className="border-l-2 border-white/30 pl-6 my-8 italic text-white/70">
            {paragraph.slice(2)}
          </blockquote>
        );
      }

      // Check for lists
      if (paragraph.match(/^[-*] /m)) {
        const items = paragraph.split(/\n/).filter((line) => line.match(/^[-*] /));
        return (
          <ul key={i} className="list-disc list-inside my-6 space-y-2 text-white/70">
            {items.map((item, j) => (
              <li key={j}>{item.slice(2)}</li>
            ))}
          </ul>
        );
      }

      // Regular paragraph with inline formatting
      let text = paragraph;
      // Bold
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
      // Italic
      text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Links
      text = text.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="underline hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">$1</a>'
      );

      return (
        <p
          key={i}
          className="text-white/70 leading-relaxed my-6"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    });
  };

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto px-6 sm:px-12 py-32">
        <div className="flex items-center justify-center h-64">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 animate-pulse">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-[900px] mx-auto px-6 sm:px-12 py-32 text-center">
        <h1 className="text-6xl font-giants italic font-black uppercase tracking-tighter text-white mb-8">
          404
        </h1>
        <p className="text-white/40 text-sm uppercase tracking-widest mb-8">
          Post not found
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white border border-white px-6 py-3 hover:bg-white hover:text-black transition-all"
        >
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="pb-32">
      {/* Hero */}
      {post.featured_image_url && (
        <div className="relative aspect-[21/9] w-full overflow-hidden">
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        </div>
      )}

      <div className="max-w-[900px] mx-auto px-6 sm:px-12">
        {/* Header */}
        <header className={post.featured_image_url ? "-mt-32 relative z-10" : "pt-32"}>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-8"
          >
            ← Back to Blog
          </Link>

          {post.category && (
            <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 mb-4">
              {post.category}
            </span>
          )}

          <h1 className="text-4xl sm:text-6xl font-giants italic font-black uppercase tracking-tighter text-white mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-white/60 mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/40 pb-8 border-b border-white/10">
            <span>{post.author_name}</span>
            <span>•</span>
            <span>{formatDate(post.published_at)}</span>
          </div>
        </header>

        {/* Content */}
        <div className="mt-12">{renderContent(post.content)}</div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 border border-white/20 text-white/40"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white border border-white px-8 py-4 hover:bg-white hover:text-black transition-all"
          >
            ← More Posts
          </Link>
        </div>
      </div>
    </article>
  );
}

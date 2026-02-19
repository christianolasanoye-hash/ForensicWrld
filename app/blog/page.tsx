"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabase";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  category: string | null;
  author_name: string;
  published_at: string;
  is_featured: boolean;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, featured_image_url, category, author_name, published_at, is_featured")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (data && !error) {
      const featured = data.find((p) => p.is_featured) || data[0];
      setFeaturedPost(featured || null);
      setPosts(data.filter((p) => p.id !== featured?.id));
    }
    setLoading(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 pb-32">
        <SectionHeader
          eyebrow="STORIES & UPDATES"
          title="BLOG"
          subtitle="THOUGHTS FROM THE COLLECTIVE."
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 animate-pulse">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-12 pb-32">
      <SectionHeader
        eyebrow="STORIES & UPDATES"
        title="BLOG"
        subtitle="THOUGHTS FROM THE COLLECTIVE."
      />

      {!featuredPost && posts.length === 0 ? (
        <div className="border border-white/10 p-16 text-center">
          <div className="text-4xl mb-4">◳</div>
          <p className="text-white/40 text-sm uppercase tracking-widest">
            No posts yet. Check back soon.
          </p>
        </div>
      ) : (
        <>
          {/* Featured Post */}
          {featuredPost && (
            <Link href={`/blog/${featuredPost.slug}`} className="block group mb-16">
              <div className="relative aspect-[21/9] w-full overflow-hidden border border-white/10">
                {featuredPost.featured_image_url ? (
                  <Image
                    src={featuredPost.featured_image_url}
                    alt={featuredPost.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <span className="text-6xl text-white/10">◳</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
                  {featuredPost.category && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 mb-4 block">
                      {featuredPost.category}
                    </span>
                  )}
                  <h2 className="text-3xl sm:text-5xl font-giants italic font-black uppercase tracking-tighter text-white mb-4 group-hover:text-white/80 transition-colors">
                    {featuredPost.title}
                  </h2>
                  {featuredPost.excerpt && (
                    <p className="text-white/60 text-sm sm:text-base max-w-2xl mb-4 line-clamp-2">
                      {featuredPost.excerpt}
                    </p>
                  )}
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    {featuredPost.author_name} • {formatDate(featuredPost.published_at)}
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Posts Grid */}
          {posts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="aspect-[16/10] relative overflow-hidden">
                    {post.featured_image_url ? (
                      <Image
                        src={post.featured_image_url}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <span className="text-4xl text-white/10">◳</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    {post.category && (
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 block">
                        {post.category}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-white group-hover:text-white/80 transition-colors mb-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-white/50 line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                      {formatDate(post.published_at)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

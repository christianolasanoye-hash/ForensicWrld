"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import SectionHeader from "@/components/SectionHeader";
import StatsCard from "@/components/admin/StatsCard";
import Card from "@/components/Card";

interface Stats {
  totalIntakes: number;
  newIntakes: number;
  totalSubscribers: number;
  activeSubscribers: number;
  totalPageViews: number;
  todayPageViews: number;
  totalGalleryItems: number;
  totalEvents: number;
  totalModels: number;
  totalInfluencers: number;
}

interface RecentIntake {
  id: string;
  name: string;
  email: string;
  service: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentIntakes, setRecentIntakes] = useState<RecentIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all stats in parallel
      const [
        intakesRes,
        newIntakesRes,
        subscribersRes,
        activeSubscribersRes,
        pageViewsRes,
        todayViewsRes,
        galleryRes,
        eventsRes,
        modelsRes,
        influencersRes,
        recentIntakesRes,
      ] = await Promise.all([
        supabase.from("intakes").select("id", { count: "exact", head: true }),
        supabase.from("intakes").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
        supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("page_views").select("id", { count: "exact", head: true }),
        supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", new Date().toISOString().split("T")[0]),
        supabase.from("gallery_assets").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("model_team").select("id", { count: "exact", head: true }),
        supabase.from("micro_influencers").select("id", { count: "exact", head: true }),
        supabase.from("intakes").select("*").order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        totalIntakes: intakesRes.count || 0,
        newIntakes: newIntakesRes.count || 0,
        totalSubscribers: subscribersRes.count || 0,
        activeSubscribers: activeSubscribersRes.count || 0,
        totalPageViews: pageViewsRes.count || 0,
        todayPageViews: todayViewsRes.count || 0,
        totalGalleryItems: galleryRes.count || 0,
        totalEvents: eventsRes.count || 0,
        totalModels: modelsRes.count || 0,
        totalInfluencers: influencersRes.count || 0,
      });

      setRecentIntakes(recentIntakesRes.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "text-blue-400";
      case "contacted":
        return "text-yellow-400";
      case "scheduled":
        return "text-green-400";
      case "completed":
        return "text-white/40";
      case "declined":
        return "text-red-400";
      default:
        return "text-white/40";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 animate-pulse">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <SectionHeader
        eyebrow="OVERVIEW"
        title="DASHBOARD"
        subtitle="Real-time metrics and activity."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="New Intakes"
          value={stats?.newIntakes || 0}
          change={`${stats?.totalIntakes || 0} total`}
          icon="◭"
        />
        <StatsCard
          title="Subscribers"
          value={stats?.activeSubscribers || 0}
          change={`${stats?.totalSubscribers || 0} total`}
          icon="◮"
        />
        <StatsCard
          title="Today's Views"
          value={stats?.todayPageViews || 0}
          change={`${stats?.totalPageViews || 0} all time`}
          icon="◉"
        />
        <StatsCard
          title="Gallery Items"
          value={stats?.totalGalleryItems || 0}
          icon="◧"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Upcoming Events"
          value={stats?.totalEvents || 0}
          icon="◫"
        />
        <StatsCard
          title="Model Team"
          value={stats?.totalModels || 0}
          icon="◩"
        />
        <StatsCard
          title="Influencer Network"
          value={stats?.totalInfluencers || 0}
          icon="◬"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Recent Intakes" desc="Latest form submissions">
          {recentIntakes.length === 0 ? (
            <div className="py-8 text-center text-[10px] font-bold uppercase tracking-widest text-white/40">
              No intakes yet
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {recentIntakes.map((intake) => (
                <div
                  key={intake.id}
                  className="flex items-center justify-between border border-white/5 p-4 hover:border-white/10 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-white truncate">
                      {intake.name}
                    </p>
                    <p className="text-[9px] text-white/40 truncate">
                      {intake.email}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">
                      {intake.service}
                    </p>
                    <p className={`text-[8px] font-bold uppercase ${getStatusColor(intake.status)}`}>
                      {intake.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Quick Actions" desc="Common tasks">
          <div className="grid grid-cols-2 gap-4 py-4">
            <a
              href="/admin/content"
              className="border border-white/10 p-4 text-center hover:border-white/30 hover:bg-white/5 transition-all"
            >
              <span className="block text-2xl mb-2">◈</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">
                Edit Content
              </span>
            </a>
            <a
              href="/admin/gallery"
              className="border border-white/10 p-4 text-center hover:border-white/30 hover:bg-white/5 transition-all"
            >
              <span className="block text-2xl mb-2">◧</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">
                Add Media
              </span>
            </a>
            <a
              href="/admin/intakes"
              className="border border-white/10 p-4 text-center hover:border-white/30 hover:bg-white/5 transition-all"
            >
              <span className="block text-2xl mb-2">◭</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">
                View Intakes
              </span>
            </a>
            <a
              href="/admin/newsletter"
              className="border border-white/10 p-4 text-center hover:border-white/30 hover:bg-white/5 transition-all"
            >
              <span className="block text-2xl mb-2">◮</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">
                Subscribers
              </span>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import SectionHeader from "@/components/SectionHeader";
import DataTable from "@/components/admin/DataTable";
import StatsCard from "@/components/admin/StatsCard";
import Button from "@/components/Button";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  is_verified: boolean;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export default function NewsletterManagement() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "unsubscribed">("all");
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0 });
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, [filter]);

  const fetchStats = async () => {
    const [totalRes, activeRes, unsubRes] = await Promise.all([
      supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("is_active", false),
    ]);

    setStats({
      total: totalRes.count || 0,
      active: activeRes.count || 0,
      unsubscribed: unsubRes.count || 0,
    });
  };

  const fetchSubscribers = async () => {
    setLoading(true);
    let query = supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });

    if (filter === "active") {
      query = query.eq("is_active", true);
    } else if (filter === "unsubscribed") {
      query = query.eq("is_active", false);
    }

    const { data } = await query;
    if (data) {
      setSubscribers(data);
    }
    setLoading(false);
  };

  const toggleSubscription = async (subscriber: Subscriber) => {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({
        is_active: !subscriber.is_active,
        unsubscribed_at: subscriber.is_active ? new Date().toISOString() : null,
      })
      .eq("id", subscriber.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(subscriber.is_active ? "Subscriber deactivated" : "Subscriber reactivated");
      setTimeout(() => setMessage(""), 3000);
      fetchSubscribers();
      fetchStats();
    }
  };

  const deleteSubscriber = async (subscriber: Subscriber) => {
    if (!confirm(`Delete ${subscriber.email}? This cannot be undone.`)) return;

    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", subscriber.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Subscriber deleted");
      setTimeout(() => setMessage(""), 3000);
      fetchSubscribers();
      fetchStats();
    }
  };

  const exportCSV = () => {
    const activeSubscribers = subscribers.filter((s) => s.is_active);
    const csv = [
      ["Email", "Name", "Source", "Subscribed Date"],
      ...activeSubscribers.map((s) => [
        s.email,
        s.name || "",
        s.source || "",
        new Date(s.subscribed_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const columns = [
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (item: Subscriber) => (
        <div>
          <p className="font-bold text-white">{item.email}</p>
          {item.name && <p className="text-[9px] text-white/40">{item.name}</p>}
        </div>
      ),
    },
    {
      key: "source",
      label: "Source",
      sortable: true,
      render: (item: Subscriber) => (
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">
          {item.source || "website"}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      sortable: true,
      render: (item: Subscriber) => (
        <span
          className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 border ${
            item.is_active
              ? "text-green-400 border-green-400/50"
              : "text-red-400 border-red-400/50"
          }`}
        >
          {item.is_active ? "Active" : "Unsubscribed"}
        </span>
      ),
    },
    {
      key: "subscribed_at",
      label: "Joined",
      sortable: true,
      render: (item: Subscriber) => (
        <span className="text-[9px] text-white/60">{formatDate(item.subscribed_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <SectionHeader
          eyebrow="SUBSCRIBERS"
          title="NEWSLETTER"
          subtitle="Manage your email list."
        />
        <Button onClick={exportCSV} className="text-[9px]">
          Export CSV
        </Button>
      </div>

      {message && (
        <div className={`border p-4 text-[10px] font-bold uppercase tracking-widest ${
          message.includes("Error")
            ? "border-red-500/50 bg-red-500/10 text-red-400"
            : "border-green-500/50 bg-green-500/10 text-green-400"
        }`}>
          {message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total Subscribers" value={stats.total} icon="◮" />
        <StatsCard
          title="Active"
          value={stats.active}
          changeType="positive"
          icon="◉"
        />
        <StatsCard
          title="Unsubscribed"
          value={stats.unsubscribed}
          changeType="negative"
          icon="◯"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "active", "unsubscribed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 border transition-all ${
              filter === f
                ? "border-white bg-white text-black"
                : "border-white/20 text-white/40 hover:border-white/40"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        data={subscribers}
        columns={columns}
        onEdit={toggleSubscription}
        onDelete={deleteSubscriber}
        emptyMessage="No subscribers found"
        isLoading={loading}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import SectionHeader from "@/components/SectionHeader";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import Field from "@/components/Field";
import StatsCard from "@/components/admin/StatsCard";

interface Influencer {
  id: string;
  name: string;
  platform: string;
  handle: string;
  profile_url: string;
  follower_count: number | null;
  niche: string[] | null;
  location: string | null;
  is_verified: boolean;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "Twitter/X" },
  { value: "other", label: "Other" },
];

const emptyInfluencer: Omit<Influencer, "id" | "created_at"> = {
  name: "",
  platform: "instagram",
  handle: "",
  profile_url: "",
  follower_count: null,
  niche: [],
  location: "",
  is_verified: false,
  is_active: true,
  notes: "",
};

export default function InfluencersManagement() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editInfluencer, setEditInfluencer] = useState<Partial<Influencer> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [message, setMessage] = useState("");
  const [nicheInput, setNicheInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, instagram: 0, tiktok: 0, totalReach: 0 });
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchInfluencers();
    fetchStats();
  }, [filter]);

  const fetchStats = async () => {
    const [totalRes, igRes, ttRes, reachRes] = await Promise.all([
      supabase.from("micro_influencers").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("micro_influencers").select("id", { count: "exact", head: true }).eq("platform", "instagram").eq("is_active", true),
      supabase.from("micro_influencers").select("id", { count: "exact", head: true }).eq("platform", "tiktok").eq("is_active", true),
      supabase.from("micro_influencers").select("follower_count").eq("is_active", true),
    ]);

    const totalReach = (reachRes.data || []).reduce((sum: number, i: { follower_count: number | null }) => sum + (i.follower_count || 0), 0);

    setStats({
      total: totalRes.count || 0,
      instagram: igRes.count || 0,
      tiktok: ttRes.count || 0,
      totalReach,
    });
  };

  const fetchInfluencers = async () => {
    setLoading(true);
    let query = supabase
      .from("micro_influencers")
      .select("*")
      .order("follower_count", { ascending: false });

    if (filter !== "all") {
      query = query.eq("platform", filter);
    }

    const { data } = await query;
    if (data) {
      setInfluencers(data);
    }
    setLoading(false);
  };

  const saveInfluencer = async () => {
    if (!editInfluencer?.name || !editInfluencer?.handle || !editInfluencer?.profile_url) {
      setMessage("Error: Name, handle, and profile URL are required");
      return;
    }

    const data = {
      name: editInfluencer.name,
      platform: editInfluencer.platform || "instagram",
      handle: editInfluencer.handle,
      profile_url: editInfluencer.profile_url,
      follower_count: editInfluencer.follower_count || null,
      niche: nicheInput.split(",").map((s) => s.trim()).filter(Boolean),
      location: editInfluencer.location || null,
      is_verified: editInfluencer.is_verified ?? false,
      is_active: editInfluencer.is_active ?? true,
      notes: editInfluencer.notes || null,
    };

    let error;
    if (isNew) {
      ({ error } = await supabase.from("micro_influencers").insert(data));
    } else {
      ({ error } = await supabase.from("micro_influencers").update(data).eq("id", editInfluencer.id));
    }

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(isNew ? "Influencer added!" : "Influencer updated!");
      setTimeout(() => setMessage(""), 3000);
      setIsModalOpen(false);
      setEditInfluencer(null);
      fetchInfluencers();
      fetchStats();
    }
  };

  const deleteInfluencer = async (influencer: Influencer) => {
    if (!confirm(`Remove ${influencer.name} from the network?`)) return;

    const { error } = await supabase.from("micro_influencers").delete().eq("id", influencer.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Influencer removed!");
      setTimeout(() => setMessage(""), 3000);
      fetchInfluencers();
      fetchStats();
    }
  };

  const formatFollowers = (count: number | null) => {
    if (!count) return "-";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram": return "IG";
      case "tiktok": return "TT";
      case "youtube": return "YT";
      case "twitter": return "X";
      default: return "◯";
    }
  };

  const columns = [
    {
      key: "name",
      label: "Creator",
      sortable: true,
      render: (item: Influencer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 flex items-center justify-center text-[10px] font-bold">
            {getPlatformIcon(item.platform)}
          </div>
          <div>
            <p className="font-bold text-white">{item.name}</p>
            <a
              href={item.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] text-white/40 hover:text-white/60"
            >
              @{item.handle}
            </a>
          </div>
        </div>
      ),
    },
    {
      key: "follower_count",
      label: "Followers",
      sortable: true,
      render: (item: Influencer) => (
        <span className="text-white font-bold">{formatFollowers(item.follower_count)}</span>
      ),
    },
    {
      key: "niche",
      label: "Niche",
      render: (item: Influencer) => (
        <div className="flex flex-wrap gap-1">
          {(item.niche || []).slice(0, 2).map((n, i) => (
            <span
              key={i}
              className="text-[8px] font-bold uppercase tracking-widest px-2 py-1 border border-white/20 text-white/60"
            >
              {n}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (item: Influencer) => (
        <div className="flex gap-2">
          <span
            className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 border ${
              item.is_active
                ? "text-green-400 border-green-400/50"
                : "text-white/40 border-white/20"
            }`}
          >
            {item.is_active ? "Active" : "Inactive"}
          </span>
          {item.is_verified && (
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 border text-blue-400 border-blue-400/50">
              Verified
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="NETWORK"
        title="MICRO INFLUENCERS"
        subtitle="Manage your creator network."
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total Creators" value={stats.total} icon="◬" />
        <StatsCard title="Instagram" value={stats.instagram} icon="IG" />
        <StatsCard title="TikTok" value={stats.tiktok} icon="TT" />
        <StatsCard title="Total Reach" value={formatFollowers(stats.totalReach)} icon="◉" />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 border transition-all ${
            filter === "all"
              ? "border-white bg-white text-black"
              : "border-white/20 text-white/40 hover:border-white/40"
          }`}
        >
          All
        </button>
        {PLATFORMS.map((p) => (
          <button
            key={p.value}
            onClick={() => setFilter(p.value)}
            className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 border transition-all ${
              filter === p.value
                ? "border-white bg-white text-black"
                : "border-white/20 text-white/40 hover:border-white/40"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <DataTable
        data={influencers}
        columns={columns}
        onAdd={() => {
          setEditInfluencer(emptyInfluencer);
          setNicheInput("");
          setIsNew(true);
          setIsModalOpen(true);
        }}
        addLabel="Add Creator"
        onEdit={(item) => {
          setEditInfluencer(item);
          setNicheInput((item.niche || []).join(", "));
          setIsNew(false);
          setIsModalOpen(true);
        }}
        onDelete={deleteInfluencer}
        emptyMessage="No creators in the network yet"
        isLoading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditInfluencer(null);
        }}
        title={isNew ? "Add Creator" : "Edit Creator"}
        onSave={saveInfluencer}
        size="lg"
      >
        {editInfluencer && (
          <div className="space-y-6">
            <Field label="Name *">
              <Input
                value={editInfluencer.name || ""}
                onChange={(e) => setEditInfluencer({ ...editInfluencer, name: e.target.value })}
                placeholder="Creator name"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Platform *">
                <Select
                  value={editInfluencer.platform || "instagram"}
                  onChange={(e) => setEditInfluencer({ ...editInfluencer, platform: e.target.value })}
                  options={PLATFORMS}
                />
              </Field>
              <Field label="Handle *">
                <Input
                  value={editInfluencer.handle || ""}
                  onChange={(e) => setEditInfluencer({ ...editInfluencer, handle: e.target.value.replace("@", "") })}
                  placeholder="username"
                />
              </Field>
            </div>

            <Field label="Profile URL *">
              <Input
                value={editInfluencer.profile_url || ""}
                onChange={(e) => setEditInfluencer({ ...editInfluencer, profile_url: e.target.value })}
                placeholder="https://instagram.com/username"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Follower Count">
                <Input
                  type="number"
                  value={editInfluencer.follower_count || ""}
                  onChange={(e) => setEditInfluencer({ ...editInfluencer, follower_count: parseInt(e.target.value) || null })}
                  placeholder="10000"
                />
              </Field>
              <Field label="Location">
                <Input
                  value={editInfluencer.location || ""}
                  onChange={(e) => setEditInfluencer({ ...editInfluencer, location: e.target.value })}
                  placeholder="City, State"
                />
              </Field>
            </div>

            <Field label="Niche" hint="Comma-separated">
              <Input
                value={nicheInput}
                onChange={(e) => setNicheInput(e.target.value)}
                placeholder="Fashion, Lifestyle, Beauty"
              />
            </Field>

            <Field label="Notes">
              <Textarea
                value={editInfluencer.notes || ""}
                onChange={(e) => setEditInfluencer({ ...editInfluencer, notes: e.target.value })}
                rows={2}
                placeholder="Internal notes..."
              />
            </Field>

            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editInfluencer.is_active ?? true}
                  onChange={(e) => setEditInfluencer({ ...editInfluencer, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Active
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editInfluencer.is_verified ?? false}
                  onChange={(e) => setEditInfluencer({ ...editInfluencer, is_verified: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Verified Partner
                </span>
              </label>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

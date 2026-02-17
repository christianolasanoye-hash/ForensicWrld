"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import SectionHeader from "@/components/SectionHeader";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Field from "@/components/Field";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  display_name: string | null;
  page_location: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

const LOCATION_OPTIONS = [
  { value: "header", label: "Header" },
  { value: "footer", label: "Footer" },
  { value: "social_page", label: "Social Page" },
  { value: "all", label: "All Locations" },
];

const PLATFORM_PRESETS = [
  { value: "instagram", label: "Instagram", icon: "IG" },
  { value: "tiktok", label: "TikTok", icon: "TT" },
  { value: "youtube", label: "YouTube", icon: "YT" },
  { value: "twitter", label: "Twitter/X", icon: "X" },
  { value: "facebook", label: "Facebook", icon: "FB" },
  { value: "linkedin", label: "LinkedIn", icon: "LI" },
  { value: "calendly", label: "Calendly", icon: "CAL" },
  { value: "custom", label: "Custom", icon: "◯" },
];

const emptyLink: Omit<SocialLink, "id" | "created_at"> = {
  platform: "instagram",
  url: "",
  display_name: "",
  page_location: "all",
  order_index: 0,
  is_active: true,
};

export default function LinksManagement() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editLink, setEditLink] = useState<Partial<SocialLink> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("social_links")
      .select("*")
      .order("order_index")
      .order("created_at", { ascending: false });

    if (data) {
      setLinks(data);
    }
    setLoading(false);
  };

  const saveLink = async () => {
    if (!editLink?.platform || !editLink?.url) {
      setMessage("Error: Platform and URL are required");
      return;
    }

    const linkData = {
      platform: editLink.platform,
      url: editLink.url,
      display_name: editLink.display_name || null,
      page_location: editLink.page_location || "all",
      order_index: editLink.order_index ?? 0,
      is_active: editLink.is_active ?? true,
    };

    let error;
    if (isNew) {
      ({ error } = await supabase.from("social_links").insert(linkData));
    } else {
      ({ error } = await supabase.from("social_links").update(linkData).eq("id", editLink.id));
    }

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(isNew ? "Link added!" : "Link updated!");
      setTimeout(() => setMessage(""), 3000);
      setIsModalOpen(false);
      setEditLink(null);
      fetchLinks();
    }
  };

  const deleteLink = async (link: SocialLink) => {
    if (!confirm(`Delete ${link.platform} link?`)) return;

    const { error } = await supabase.from("social_links").delete().eq("id", link.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Link deleted!");
      setTimeout(() => setMessage(""), 3000);
      fetchLinks();
    }
  };

  const toggleActive = async (link: SocialLink) => {
    const { error } = await supabase
      .from("social_links")
      .update({ is_active: !link.is_active })
      .eq("id", link.id);

    if (!error) {
      fetchLinks();
    }
  };

  const getPlatformIcon = (platform: string) => {
    return PLATFORM_PRESETS.find((p) => p.value === platform)?.icon || "◯";
  };

  const columns = [
    {
      key: "platform",
      label: "Platform",
      sortable: true,
      render: (item: SocialLink) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 flex items-center justify-center text-[10px] font-bold">
            {getPlatformIcon(item.platform)}
          </div>
          <div>
            <p className="font-bold text-white capitalize">{item.platform}</p>
            {item.display_name && (
              <p className="text-[9px] text-white/40">{item.display_name}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "url",
      label: "URL",
      render: (item: SocialLink) => (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-white/60 hover:text-white truncate block max-w-[200px]"
        >
          {item.url}
        </a>
      ),
    },
    {
      key: "page_location",
      label: "Location",
      render: (item: SocialLink) => (
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">
          {item.page_location || "all"}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (item: SocialLink) => (
        <button
          onClick={() => toggleActive(item)}
          className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 border transition-colors ${
            item.is_active
              ? "text-green-400 border-green-400/50 hover:bg-green-400/10"
              : "text-white/40 border-white/20 hover:border-white/40"
          }`}
        >
          {item.is_active ? "Active" : "Inactive"}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="CONNECTIONS"
        title="SOCIAL LINKS"
        subtitle="Manage links displayed across the site."
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

      <DataTable
        data={links}
        columns={columns}
        onAdd={() => {
          setEditLink(emptyLink);
          setIsNew(true);
          setIsModalOpen(true);
        }}
        addLabel="Add Link"
        onEdit={(item) => {
          setEditLink(item);
          setIsNew(false);
          setIsModalOpen(true);
        }}
        onDelete={deleteLink}
        emptyMessage="No social links yet"
        isLoading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditLink(null);
        }}
        title={isNew ? "Add Link" : "Edit Link"}
        onSave={saveLink}
      >
        {editLink && (
          <div className="space-y-6">
            <Field label="Platform *">
              <Select
                value={editLink.platform || "instagram"}
                onChange={(e) => setEditLink({ ...editLink, platform: e.target.value })}
                options={PLATFORM_PRESETS.map((p) => ({ value: p.value, label: p.label }))}
              />
            </Field>

            <Field label="URL *">
              <Input
                value={editLink.url || ""}
                onChange={(e) => setEditLink({ ...editLink, url: e.target.value })}
                placeholder="https://instagram.com/yourhandle"
              />
            </Field>

            <Field label="Display Name" hint="Optional custom label">
              <Input
                value={editLink.display_name || ""}
                onChange={(e) => setEditLink({ ...editLink, display_name: e.target.value })}
                placeholder="Follow us on Instagram"
              />
            </Field>

            <Field label="Show In">
              <Select
                value={editLink.page_location || "all"}
                onChange={(e) => setEditLink({ ...editLink, page_location: e.target.value })}
                options={LOCATION_OPTIONS}
              />
            </Field>

            <Field label="Order Index">
              <Input
                type="number"
                value={editLink.order_index || 0}
                onChange={(e) => setEditLink({ ...editLink, order_index: parseInt(e.target.value) || 0 })}
              />
            </Field>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={editLink.is_active ?? true}
                onChange={(e) => setEditLink({ ...editLink, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                Active
              </span>
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}

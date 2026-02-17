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
import Card from "@/components/Card";

interface Campaign {
  id: string;
  name: string;
  subject: string | null;
  content: string | null;
  status: string;
  scheduled_for: string | null;
  sent_at: string | null;
  recipient_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "sent", label: "Sent" },
  { value: "cancelled", label: "Cancelled" },
];

const emptyCampaign: Omit<Campaign, "id" | "created_at"> = {
  name: "",
  subject: "",
  content: "",
  status: "draft",
  scheduled_for: null,
  sent_at: null,
  recipient_count: 0,
  open_count: 0,
  click_count: 0,
};

export default function OutreachManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCampaign, setEditCampaign] = useState<Partial<Campaign> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [message, setMessage] = useState("");
  const [subscriberCount, setSubscriberCount] = useState(0);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchCampaigns();
    fetchSubscriberCount();
  }, []);

  const fetchSubscriberCount = async () => {
    const { count } = await supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);
    setSubscriberCount(count || 0);
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("outreach_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setCampaigns(data);
    }
    setLoading(false);
  };

  const saveCampaign = async () => {
    if (!editCampaign?.name) {
      setMessage("Error: Campaign name is required");
      return;
    }

    const campaignData = {
      name: editCampaign.name,
      subject: editCampaign.subject || null,
      content: editCampaign.content || null,
      status: editCampaign.status || "draft",
      scheduled_for: editCampaign.scheduled_for || null,
      recipient_count: editCampaign.recipient_count || 0,
      open_count: editCampaign.open_count || 0,
      click_count: editCampaign.click_count || 0,
    };

    let error;
    if (isNew) {
      ({ error } = await supabase.from("outreach_campaigns").insert(campaignData));
    } else {
      ({ error } = await supabase.from("outreach_campaigns").update(campaignData).eq("id", editCampaign.id));
    }

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(isNew ? "Campaign created!" : "Campaign updated!");
      setTimeout(() => setMessage(""), 3000);
      setIsModalOpen(false);
      setEditCampaign(null);
      fetchCampaigns();
    }
  };

  const deleteCampaign = async (campaign: Campaign) => {
    if (!confirm(`Delete "${campaign.name}"?`)) return;

    const { error } = await supabase.from("outreach_campaigns").delete().eq("id", campaign.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Campaign deleted!");
      setTimeout(() => setMessage(""), 3000);
      fetchCampaigns();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "text-white/40 border-white/20";
      case "scheduled":
        return "text-yellow-400 border-yellow-400/50";
      case "sent":
        return "text-green-400 border-green-400/50";
      case "cancelled":
        return "text-red-400 border-red-400/50";
      default:
        return "text-white/40 border-white/20";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate stats
  const totalSent = campaigns.filter((c) => c.status === "sent").length;
  const totalOpens = campaigns.reduce((sum, c) => sum + c.open_count, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.click_count, 0);

  const columns = [
    {
      key: "name",
      label: "Campaign",
      sortable: true,
      render: (item: Campaign) => (
        <div>
          <p className="font-bold text-white">{item.name}</p>
          {item.subject && (
            <p className="text-[9px] text-white/40 truncate max-w-[200px]">{item.subject}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item: Campaign) => (
        <span
          className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 border ${getStatusColor(item.status)}`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "recipient_count",
      label: "Recipients",
      sortable: true,
      render: (item: Campaign) => (
        <span className="text-white">{item.recipient_count}</span>
      ),
    },
    {
      key: "sent_at",
      label: "Sent",
      sortable: true,
      render: (item: Campaign) => (
        <span className="text-[9px] text-white/60">{formatDate(item.sent_at)}</span>
      ),
    },
    {
      key: "stats",
      label: "Performance",
      render: (item: Campaign) => (
        <div className="flex gap-4 text-[9px]">
          <span className="text-white/60">
            {item.open_count} opens
          </span>
          <span className="text-white/60">
            {item.click_count} clicks
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="EMAIL"
        title="OUTREACH"
        subtitle="Create and manage email campaigns."
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
        <StatsCard title="Active Subscribers" value={subscriberCount} icon="◮" />
        <StatsCard title="Campaigns Sent" value={totalSent} icon="◯" />
        <StatsCard title="Total Opens" value={totalOpens} icon="◉" />
        <StatsCard title="Total Clicks" value={totalClicks} icon="◈" />
      </div>

      {/* Info Card */}
      <Card title="Email Integration" desc="Connect your email service">
        <div className="py-4 space-y-4">
          <p className="text-[10px] text-white/60">
            To send campaigns, integrate with an email service like SendGrid, Mailchimp, or Resend.
            This dashboard tracks campaign performance after sending.
          </p>
          <div className="flex gap-4">
            <a
              href="https://resend.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white border border-white/20 px-4 py-2"
            >
              Resend →
            </a>
            <a
              href="https://sendgrid.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white border border-white/20 px-4 py-2"
            >
              SendGrid →
            </a>
          </div>
        </div>
      </Card>

      {/* Table */}
      <DataTable
        data={campaigns}
        columns={columns}
        onAdd={() => {
          setEditCampaign(emptyCampaign);
          setIsNew(true);
          setIsModalOpen(true);
        }}
        addLabel="Create Campaign"
        onEdit={(item) => {
          setEditCampaign(item);
          setIsNew(false);
          setIsModalOpen(true);
        }}
        onDelete={deleteCampaign}
        emptyMessage="No campaigns yet"
        isLoading={loading}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditCampaign(null);
        }}
        title={isNew ? "Create Campaign" : "Edit Campaign"}
        onSave={saveCampaign}
        size="lg"
      >
        {editCampaign && (
          <div className="space-y-6">
            <Field label="Campaign Name *">
              <Input
                value={editCampaign.name || ""}
                onChange={(e) => setEditCampaign({ ...editCampaign, name: e.target.value })}
                placeholder="Monthly Newsletter - January"
              />
            </Field>

            <Field label="Email Subject">
              <Input
                value={editCampaign.subject || ""}
                onChange={(e) => setEditCampaign({ ...editCampaign, subject: e.target.value })}
                placeholder="Big news from Forensic Wrld!"
              />
            </Field>

            <Field label="Content">
              <Textarea
                value={editCampaign.content || ""}
                onChange={(e) => setEditCampaign({ ...editCampaign, content: e.target.value })}
                rows={8}
                placeholder="Email content..."
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Status">
                <Select
                  value={editCampaign.status || "draft"}
                  onChange={(e) => setEditCampaign({ ...editCampaign, status: e.target.value })}
                  options={STATUS_OPTIONS}
                />
              </Field>

              <Field label="Schedule For">
                <Input
                  type="datetime-local"
                  value={editCampaign.scheduled_for?.slice(0, 16) || ""}
                  onChange={(e) => setEditCampaign({ ...editCampaign, scheduled_for: e.target.value })}
                />
              </Field>
            </div>

            {editCampaign.status === "sent" && (
              <div className="grid grid-cols-3 gap-4 border border-white/10 p-4">
                <Field label="Recipients">
                  <Input
                    type="number"
                    value={editCampaign.recipient_count || 0}
                    onChange={(e) => setEditCampaign({ ...editCampaign, recipient_count: parseInt(e.target.value) || 0 })}
                  />
                </Field>
                <Field label="Opens">
                  <Input
                    type="number"
                    value={editCampaign.open_count || 0}
                    onChange={(e) => setEditCampaign({ ...editCampaign, open_count: parseInt(e.target.value) || 0 })}
                  />
                </Field>
                <Field label="Clicks">
                  <Input
                    type="number"
                    value={editCampaign.click_count || 0}
                    onChange={(e) => setEditCampaign({ ...editCampaign, click_count: parseInt(e.target.value) || 0 })}
                  />
                </Field>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

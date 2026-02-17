"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import SectionHeader from "@/components/SectionHeader";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import Select from "@/components/Select";
import Textarea from "@/components/Textarea";
import Field from "@/components/Field";

interface Intake {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string;
  budget_range: string | null;
  timeline: string | null;
  description: string | null;
  referral_source: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "declined", label: "Declined" },
];

export default function IntakesManagement() {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntake, setSelectedIntake] = useState<Intake | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchIntakes();
  }, [filter]);

  const fetchIntakes = async () => {
    setLoading(true);
    let query = supabase
      .from("intakes")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    if (data) {
      setIntakes(data);
    }
    setLoading(false);
  };

  const updateIntake = async () => {
    if (!selectedIntake) return;

    const { error } = await supabase
      .from("intakes")
      .update({
        status: selectedIntake.status,
        notes: selectedIntake.notes,
      })
      .eq("id", selectedIntake.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Intake updated!");
      setTimeout(() => setMessage(""), 3000);
      setIsModalOpen(false);
      setSelectedIntake(null);
      fetchIntakes();
    }
  };

  const deleteIntake = async (intake: Intake) => {
    if (!confirm(`Delete intake from ${intake.name}?`)) return;

    const { error } = await supabase.from("intakes").delete().eq("id", intake.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Intake deleted!");
      setTimeout(() => setMessage(""), 3000);
      fetchIntakes();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "text-blue-400 border-blue-400/50";
      case "contacted":
        return "text-yellow-400 border-yellow-400/50";
      case "scheduled":
        return "text-green-400 border-green-400/50";
      case "completed":
        return "text-white/40 border-white/20";
      case "declined":
        return "text-red-400 border-red-400/50";
      default:
        return "text-white/40 border-white/20";
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (item: Intake) => (
        <div>
          <p className="font-bold text-white">{item.name}</p>
          <p className="text-[9px] text-white/40">{item.email}</p>
        </div>
      ),
    },
    {
      key: "service",
      label: "Service",
      sortable: true,
      render: (item: Intake) => (
        <span className="text-[9px] font-bold uppercase tracking-widest">
          {item.service}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item: Intake) => (
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 border ${getStatusColor(item.status)}`}>
          {item.status}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      sortable: true,
      render: (item: Intake) => (
        <span className="text-[9px] text-white/60">{formatDate(item.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="LEADS"
        title="INTAKES"
        subtitle="Manage client consultation requests."
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

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
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
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status.value}
            onClick={() => setFilter(status.value)}
            className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 border transition-all ${
              filter === status.value
                ? "border-white bg-white text-black"
                : "border-white/20 text-white/40 hover:border-white/40"
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        data={intakes}
        columns={columns}
        onEdit={(item) => {
          setSelectedIntake(item);
          setIsModalOpen(true);
        }}
        onDelete={deleteIntake}
        emptyMessage="No intakes found"
        isLoading={loading}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedIntake(null);
        }}
        title="Intake Details"
        onSave={updateIntake}
        size="lg"
      >
        {selectedIntake && (
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4 border border-white/10 p-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">
                  Name
                </p>
                <p className="text-white">{selectedIntake.name}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">
                  Email
                </p>
                <a
                  href={`mailto:${selectedIntake.email}`}
                  className="text-white hover:underline"
                >
                  {selectedIntake.email}
                </a>
              </div>
              {selectedIntake.phone && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">
                    Phone
                  </p>
                  <a
                    href={`tel:${selectedIntake.phone}`}
                    className="text-white hover:underline"
                  >
                    {selectedIntake.phone}
                  </a>
                </div>
              )}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">
                  Service
                </p>
                <p className="text-white uppercase">{selectedIntake.service}</p>
              </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-2 gap-4 border border-white/10 p-4">
              {selectedIntake.budget_range && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">
                    Budget
                  </p>
                  <p className="text-white">{selectedIntake.budget_range}</p>
                </div>
              )}
              {selectedIntake.timeline && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">
                    Timeline
                  </p>
                  <p className="text-white">{selectedIntake.timeline}</p>
                </div>
              )}
              {selectedIntake.referral_source && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">
                    Referral
                  </p>
                  <p className="text-white">{selectedIntake.referral_source}</p>
                </div>
              )}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">
                  Submitted
                </p>
                <p className="text-white">{formatDate(selectedIntake.created_at)}</p>
              </div>
            </div>

            {/* Description */}
            {selectedIntake.description && (
              <div className="border border-white/10 p-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-2">
                  Project Description
                </p>
                <p className="text-white/80 text-sm whitespace-pre-wrap">
                  {selectedIntake.description}
                </p>
              </div>
            )}

            {/* Status Update */}
            <Field label="Status">
              <Select
                value={selectedIntake.status}
                onChange={(e) =>
                  setSelectedIntake({ ...selectedIntake, status: e.target.value })
                }
                options={STATUS_OPTIONS}
              />
            </Field>

            {/* Notes */}
            <Field label="Internal Notes">
              <Textarea
                value={selectedIntake.notes || ""}
                onChange={(e) =>
                  setSelectedIntake({ ...selectedIntake, notes: e.target.value })
                }
                placeholder="Add notes about this client..."
                rows={4}
              />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import SectionHeader from "@/components/SectionHeader";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Field from "@/components/Field";
import FileUpload from "@/components/admin/FileUpload";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  location_url: string | null;
  image_url: string | null;
  is_upcoming: boolean;
  is_featured: boolean;
  registration_url: string | null;
  created_at: string;
}

const emptyEvent: Omit<Event, "id" | "created_at"> = {
  title: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
  time: "",
  location: "",
  location_url: "",
  image_url: "",
  is_upcoming: true,
  is_featured: false,
  registration_url: "",
};

export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editEvent, setEditEvent] = useState<Partial<Event> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    setLoading(true);
    let query = supabase.from("events").select("*").order("date", { ascending: false });

    if (filter === "upcoming") {
      query = query.eq("is_upcoming", true);
    } else if (filter === "past") {
      query = query.eq("is_upcoming", false);
    }

    const { data } = await query;
    if (data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const saveEvent = async () => {
    if (!editEvent?.title || !editEvent?.date) {
      setMessage("Error: Title and date are required");
      return;
    }

    const eventData = {
      title: editEvent.title,
      description: editEvent.description || null,
      date: editEvent.date,
      time: editEvent.time || null,
      location: editEvent.location || null,
      location_url: editEvent.location_url || null,
      image_url: editEvent.image_url || null,
      is_upcoming: editEvent.is_upcoming ?? true,
      is_featured: editEvent.is_featured ?? false,
      registration_url: editEvent.registration_url || null,
    };

    let error;
    if (isNew) {
      ({ error } = await supabase.from("events").insert(eventData));
    } else {
      ({ error } = await supabase.from("events").update(eventData).eq("id", editEvent.id));
    }

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(isNew ? "Event created!" : "Event updated!");
      setTimeout(() => setMessage(""), 3000);
      setIsModalOpen(false);
      setEditEvent(null);
      fetchEvents();
    }
  };

  const deleteEvent = async (event: Event) => {
    if (!confirm(`Delete "${event.title}"?`)) return;

    const { error } = await supabase.from("events").delete().eq("id", event.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Event deleted!");
      setTimeout(() => setMessage(""), 3000);
      fetchEvents();
    }
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
      key: "title",
      label: "Event",
      sortable: true,
      render: (item: Event) => (
        <div className="flex items-center gap-3">
          {item.image_url && (
            <div className="w-12 h-12 bg-white/5 overflow-hidden flex-shrink-0">
              <img src={item.image_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <p className="font-bold text-white">{item.title}</p>
            {item.location && (
              <p className="text-[9px] text-white/40">{item.location}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (item: Event) => (
        <div>
          <p className="text-white">{formatDate(item.date)}</p>
          {item.time && <p className="text-[9px] text-white/40">{item.time}</p>}
        </div>
      ),
    },
    {
      key: "is_upcoming",
      label: "Status",
      sortable: true,
      render: (item: Event) => (
        <div className="flex gap-2">
          <span
            className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 border ${
              item.is_upcoming
                ? "text-green-400 border-green-400/50"
                : "text-white/40 border-white/20"
            }`}
          >
            {item.is_upcoming ? "Upcoming" : "Past"}
          </span>
          {item.is_featured && (
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 border text-yellow-400 border-yellow-400/50">
              Featured
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="CALENDAR"
        title="EVENTS"
        subtitle="Manage upcoming and past events."
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
      <div className="flex gap-2">
        {(["all", "upcoming", "past"] as const).map((f) => (
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
        data={events}
        columns={columns}
        onAdd={() => {
          setEditEvent(emptyEvent);
          setIsNew(true);
          setIsModalOpen(true);
        }}
        addLabel="Add Event"
        onEdit={(item) => {
          setEditEvent(item);
          setIsNew(false);
          setIsModalOpen(true);
        }}
        onDelete={deleteEvent}
        emptyMessage="No events found"
        isLoading={loading}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditEvent(null);
        }}
        title={isNew ? "Create Event" : "Edit Event"}
        onSave={saveEvent}
        size="lg"
      >
        {editEvent && (
          <div className="space-y-6">
            <Field label="Event Title *">
              <Input
                value={editEvent.title || ""}
                onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
                placeholder="Event name"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Date *">
                <Input
                  type="date"
                  value={editEvent.date || ""}
                  onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                />
              </Field>
              <Field label="Time">
                <Input
                  type="time"
                  value={editEvent.time || ""}
                  onChange={(e) => setEditEvent({ ...editEvent, time: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Description">
              <Textarea
                value={editEvent.description || ""}
                onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
                rows={3}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Location">
                <Input
                  value={editEvent.location || ""}
                  onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
                  placeholder="Venue name or address"
                />
              </Field>
              <Field label="Location URL">
                <Input
                  value={editEvent.location_url || ""}
                  onChange={(e) => setEditEvent({ ...editEvent, location_url: e.target.value })}
                  placeholder="https://maps.google.com/..."
                />
              </Field>
            </div>

            <Field label="Registration URL">
              <Input
                value={editEvent.registration_url || ""}
                onChange={(e) => setEditEvent({ ...editEvent, registration_url: e.target.value })}
                placeholder="https://eventbrite.com/..."
              />
            </Field>

            <Field label="Event Image">
              <FileUpload
                folder="events"
                onUploadComplete={(url) => setEditEvent({ ...editEvent, image_url: url })}
                onError={(err) => setMessage(`Error: ${err}`)}
              />
              {editEvent.image_url && (
                <div className="mt-2">
                  <img src={editEvent.image_url} alt="" className="h-24 object-cover" />
                </div>
              )}
            </Field>

            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editEvent.is_upcoming ?? true}
                  onChange={(e) => setEditEvent({ ...editEvent, is_upcoming: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Upcoming Event
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editEvent.is_featured ?? false}
                  onChange={(e) => setEditEvent({ ...editEvent, is_featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Featured
                </span>
              </label>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

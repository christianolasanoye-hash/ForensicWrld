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

interface Model {
  id: string;
  name: string;
  bio: string | null;
  headshot_url: string | null;
  instagram_handle: string | null;
  specialties: string[] | null;
  is_available: boolean;
  is_featured: boolean;
  order_index: number;
  created_at: string;
}

const emptyModel: Omit<Model, "id" | "created_at"> = {
  name: "",
  bio: "",
  headshot_url: "",
  instagram_handle: "",
  specialties: [],
  is_available: true,
  is_featured: false,
  order_index: 0,
};

export default function ModelsManagement() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModel, setEditModel] = useState<Partial<Model> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [message, setMessage] = useState("");
  const [specialtiesInput, setSpecialtiesInput] = useState("");
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("model_team")
      .select("*")
      .order("order_index")
      .order("created_at", { ascending: false });

    if (data) {
      setModels(data);
    }
    setLoading(false);
  };

  const saveModel = async () => {
    if (!editModel?.name) {
      setMessage("Error: Name is required");
      return;
    }

    const modelData = {
      name: editModel.name,
      bio: editModel.bio || null,
      headshot_url: editModel.headshot_url || null,
      instagram_handle: editModel.instagram_handle || null,
      specialties: specialtiesInput.split(",").map((s) => s.trim()).filter(Boolean),
      is_available: editModel.is_available ?? true,
      is_featured: editModel.is_featured ?? false,
      order_index: editModel.order_index ?? 0,
    };

    let error;
    if (isNew) {
      ({ error } = await supabase.from("model_team").insert(modelData));
    } else {
      ({ error } = await supabase.from("model_team").update(modelData).eq("id", editModel.id));
    }

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(isNew ? "Model added!" : "Model updated!");
      setTimeout(() => setMessage(""), 3000);
      setIsModalOpen(false);
      setEditModel(null);
      fetchModels();
    }
  };

  const deleteModel = async (model: Model) => {
    if (!confirm(`Remove ${model.name} from the team?`)) return;

    const { error } = await supabase.from("model_team").delete().eq("id", model.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Model removed!");
      setTimeout(() => setMessage(""), 3000);
      fetchModels();
    }
  };

  const openEditModal = (model: Model) => {
    setEditModel(model);
    setSpecialtiesInput((model.specialties || []).join(", "));
    setIsNew(false);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditModel(emptyModel);
    setSpecialtiesInput("");
    setIsNew(true);
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: "name",
      label: "Model",
      sortable: true,
      render: (item: Model) => (
        <div className="flex items-center gap-3">
          {item.headshot_url ? (
            <div className="w-12 h-12 bg-white/5 overflow-hidden flex-shrink-0 rounded-full">
              <img src={item.headshot_url} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 bg-white/10 flex items-center justify-center text-white/40 rounded-full">
              ◩
            </div>
          )}
          <div>
            <p className="font-bold text-white">{item.name}</p>
            {item.instagram_handle && (
              <p className="text-[9px] text-white/40">@{item.instagram_handle}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "specialties",
      label: "Specialties",
      render: (item: Model) => (
        <div className="flex flex-wrap gap-1">
          {(item.specialties || []).slice(0, 3).map((s, i) => (
            <span
              key={i}
              className="text-[8px] font-bold uppercase tracking-widest px-2 py-1 border border-white/20 text-white/60"
            >
              {s}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "is_available",
      label: "Status",
      sortable: true,
      render: (item: Model) => (
        <div className="flex gap-2">
          <span
            className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 border ${
              item.is_available
                ? "text-green-400 border-green-400/50"
                : "text-white/40 border-white/20"
            }`}
          >
            {item.is_available ? "Available" : "Unavailable"}
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
        eyebrow="TALENT"
        title="MODEL TEAM"
        subtitle="Manage your talent roster."
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
        data={models}
        columns={columns}
        onAdd={openNewModal}
        addLabel="Add Model"
        onEdit={openEditModal}
        onDelete={deleteModel}
        emptyMessage="No models in the team yet"
        isLoading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditModel(null);
        }}
        title={isNew ? "Add Model" : "Edit Model"}
        onSave={saveModel}
        size="lg"
      >
        {editModel && (
          <div className="space-y-6">
            <Field label="Name *">
              <Input
                value={editModel.name || ""}
                onChange={(e) => setEditModel({ ...editModel, name: e.target.value })}
                placeholder="Full name"
              />
            </Field>

            <Field label="Bio">
              <Textarea
                value={editModel.bio || ""}
                onChange={(e) => setEditModel({ ...editModel, bio: e.target.value })}
                rows={3}
                placeholder="Short biography..."
              />
            </Field>

            <Field label="Instagram Handle">
              <Input
                value={editModel.instagram_handle || ""}
                onChange={(e) => setEditModel({ ...editModel, instagram_handle: e.target.value.replace("@", "") })}
                placeholder="username (without @)"
              />
            </Field>

            <Field label="Specialties" hint="Comma-separated">
              <Input
                value={specialtiesInput}
                onChange={(e) => setSpecialtiesInput(e.target.value)}
                placeholder="Fashion, Editorial, Commercial"
              />
            </Field>

            <Field label="Headshot">
              <FileUpload
                folder="models"
                onUploadComplete={(url) => setEditModel({ ...editModel, headshot_url: url })}
                onError={(err) => setMessage(`Error: ${err}`)}
              />
              {editModel.headshot_url && (
                <div className="mt-2">
                  <img src={editModel.headshot_url} alt="" className="h-24 w-24 object-cover rounded-full" />
                </div>
              )}
            </Field>

            <Field label="Order Index">
              <Input
                type="number"
                value={editModel.order_index || 0}
                onChange={(e) => setEditModel({ ...editModel, order_index: parseInt(e.target.value) || 0 })}
              />
            </Field>

            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editModel.is_available ?? true}
                  onChange={(e) => setEditModel({ ...editModel, is_available: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Available for Booking
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editModel.is_featured ?? false}
                  onChange={(e) => setEditModel({ ...editModel, is_featured: e.target.checked })}
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

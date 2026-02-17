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
import FileUpload from "@/components/admin/FileUpload";

interface MerchItem {
  id: string;
  name: string;
  description: string | null;
  status: string;
  image_url: string | null;
  price: number | null;
  external_link: string | null;
  order_index: number;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "preview", label: "Preview" },
  { value: "coming_soon", label: "Coming Soon" },
  { value: "available", label: "Available" },
  { value: "sold_out", label: "Sold Out" },
];

const emptyMerch: Omit<MerchItem, "id" | "created_at"> = {
  name: "",
  description: "",
  status: "preview",
  image_url: "",
  price: null,
  external_link: "",
  order_index: 0,
};

export default function MerchManagement() {
  const [items, setItems] = useState<MerchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<Partial<MerchItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchMerch();
  }, []);

  const fetchMerch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("merch")
      .select("*")
      .order("order_index")
      .order("created_at", { ascending: false });

    if (data) {
      setItems(data);
    }
    setLoading(false);
  };

  const saveMerch = async () => {
    if (!editItem?.name) {
      setMessage("Error: Name is required");
      return;
    }

    const merchData = {
      name: editItem.name,
      description: editItem.description || null,
      status: editItem.status || "preview",
      image_url: editItem.image_url || null,
      price: editItem.price || null,
      external_link: editItem.external_link || null,
      order_index: editItem.order_index ?? 0,
    };

    let error;
    if (isNew) {
      ({ error } = await supabase.from("merch").insert(merchData));
    } else {
      ({ error } = await supabase.from("merch").update(merchData).eq("id", editItem.id));
    }

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(isNew ? "Item created!" : "Item updated!");
      setTimeout(() => setMessage(""), 3000);
      setIsModalOpen(false);
      setEditItem(null);
      fetchMerch();
    }
  };

  const deleteMerch = async (item: MerchItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return;

    const { error } = await supabase.from("merch").delete().eq("id", item.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Item deleted!");
      setTimeout(() => setMessage(""), 3000);
      fetchMerch();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preview":
        return "text-blue-400 border-blue-400/50";
      case "coming_soon":
        return "text-yellow-400 border-yellow-400/50";
      case "available":
        return "text-green-400 border-green-400/50";
      case "sold_out":
        return "text-red-400 border-red-400/50";
      default:
        return "text-white/40 border-white/20";
    }
  };

  const columns = [
    {
      key: "name",
      label: "Product",
      sortable: true,
      render: (item: MerchItem) => (
        <div className="flex items-center gap-3">
          {item.image_url ? (
            <div className="w-12 h-12 bg-white/5 overflow-hidden flex-shrink-0">
              <img src={item.image_url} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 bg-white/10 flex items-center justify-center text-white/40">
              ◪
            </div>
          )}
          <div>
            <p className="font-bold text-white">{item.name}</p>
            {item.price && (
              <p className="text-[9px] text-white/40">${item.price.toFixed(2)}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item: MerchItem) => (
        <span
          className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 border ${getStatusColor(item.status)}`}
        >
          {item.status.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "order_index",
      label: "Order",
      sortable: true,
    },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="PRODUCTS"
        title="MERCH"
        subtitle="Manage merchandise listings."
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
        data={items}
        columns={columns}
        onAdd={() => {
          setEditItem(emptyMerch);
          setIsNew(true);
          setIsModalOpen(true);
        }}
        addLabel="Add Product"
        onEdit={(item) => {
          setEditItem(item);
          setIsNew(false);
          setIsModalOpen(true);
        }}
        onDelete={deleteMerch}
        emptyMessage="No merchandise yet"
        isLoading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditItem(null);
        }}
        title={isNew ? "Add Product" : "Edit Product"}
        onSave={saveMerch}
        size="lg"
      >
        {editItem && (
          <div className="space-y-6">
            <Field label="Product Name *">
              <Input
                value={editItem.name || ""}
                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                placeholder="Product name"
              />
            </Field>

            <Field label="Description">
              <Textarea
                value={editItem.description || ""}
                onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                rows={3}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Status">
                <Select
                  value={editItem.status || "preview"}
                  onChange={(e) => setEditItem({ ...editItem, status: e.target.value })}
                  options={STATUS_OPTIONS}
                />
              </Field>
              <Field label="Price">
                <Input
                  type="number"
                  step="0.01"
                  value={editItem.price || ""}
                  onChange={(e) => setEditItem({ ...editItem, price: parseFloat(e.target.value) || null })}
                  placeholder="0.00"
                />
              </Field>
            </div>

            <Field label="External Link" hint="Link to purchase page">
              <Input
                value={editItem.external_link || ""}
                onChange={(e) => setEditItem({ ...editItem, external_link: e.target.value })}
                placeholder="https://shop.example.com/product"
              />
            </Field>

            <Field label="Product Image">
              <FileUpload
                folder="merch"
                onUploadComplete={(url) => setEditItem({ ...editItem, image_url: url })}
                onError={(err) => setMessage(`Error: ${err}`)}
              />
              {editItem.image_url && (
                <div className="mt-2">
                  <img src={editItem.image_url} alt="" className="h-24 object-cover" />
                </div>
              )}
            </Field>

            <Field label="Order Index">
              <Input
                type="number"
                value={editItem.order_index || 0}
                onChange={(e) => setEditItem({ ...editItem, order_index: parseInt(e.target.value) || 0 })}
              />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}

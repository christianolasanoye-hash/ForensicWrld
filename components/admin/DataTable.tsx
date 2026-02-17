"use client";

import { useState } from "react";
import Button from "@/components/Button";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onAdd?: () => void;
  addLabel?: string;
  emptyMessage?: string;
  isLoading?: boolean;
}

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  onAdd,
  addLabel = "Add New",
  emptyMessage = "No items found",
  isLoading = false,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = (a as Record<string, unknown>)[sortKey];
    const bVal = (b as Record<string, unknown>)[sortKey];

    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    const comparison = aVal < bVal ? -1 : 1;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const getValue = (item: T, key: string): unknown => {
    const keys = key.split(".");
    let value: unknown = item;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return value;
  };

  return (
    <div className="border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
          {data.length} {data.length === 1 ? "Item" : "Items"}
        </span>
        {onAdd && (
          <Button onClick={onAdd} className="text-[9px] py-2 px-4">
            {addLabel} +
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-pulse text-[10px] font-bold uppercase tracking-widest text-white/40">
            Loading...
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`px-4 py-3 text-left text-[9px] font-bold uppercase tracking-widest text-white/40 ${
                      column.sortable ? "cursor-pointer hover:text-white/60" : ""
                    }`}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    {column.label}
                    {sortKey === String(column.key) && (
                      <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="px-4 py-3 text-right text-[9px] font-bold uppercase tracking-widest text-white/40">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-4 py-4 text-[11px] text-white/80"
                    >
                      {column.render
                        ? column.render(item)
                        : String(getValue(item, String(column.key)) ?? "-")}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="text-[9px] font-bold uppercase tracking-widest text-red-400/60 hover:text-red-400 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

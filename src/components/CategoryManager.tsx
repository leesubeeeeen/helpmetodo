"use client";

import type { Category } from "@/lib/types";
import { useState } from "react";

const PRESET_COLORS = [
  "#6366f1", // indigo
  "#f97316", // orange
  "#10b981", // emerald
  "#ec4899", // pink
  "#0ea5e9", // sky
  "#eab308", // yellow
  "#8b5cf6", // violet
  "#ef4444", // red
];

type Props = {
  categories: Category[];
  onAdd: (name: string, color: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
};

export default function CategoryManager({
  categories,
  onAdd,
  onDelete,
  onRename,
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, color);
    setName("");
    setColor(PRESET_COLORS[(categories.length + 1) % PRESET_COLORS.length]);
  }

  function startEditing(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
  }

  function commitEdit() {
    const trimmed = editingName.trim();
    if (editingId && trimmed) {
      onRename(editingId, trimmed);
    }
    setEditingId(null);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-semibold text-slate-700"
      >
        <span>카테고리 관리</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <ul className="space-y-1.5">
            {categories.map((category) => (
              <li
                key={category.id}
                className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
              >
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {editingId === category.id ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 rounded border border-indigo-200 bg-white px-1.5 py-0.5 text-sm text-slate-700 focus:outline-none"
                  />
                ) : (
                  <button
                    onDoubleClick={() => startEditing(category)}
                    className="flex-1 truncate text-left text-sm text-slate-600"
                    title="더블클릭하여 이름 수정"
                  >
                    {category.name}
                  </button>
                )}
                <button
                  onClick={() => onDelete(category.id)}
                  aria-label="카테고리 삭제"
                  className="flex-shrink-0 rounded-md p-1 text-slate-300 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-400 group-hover:opacity-100"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </li>
            ))}
            {categories.length === 0 && (
              <li className="px-2 py-1 text-sm text-slate-400">
                아직 카테고리가 없어요.
              </li>
            )}
          </ul>

          <form onSubmit={handleAdd} className="space-y-2 border-t border-slate-100 pt-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="새 카테고리 이름"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`색상 ${c}`}
                    className={`h-5 w-5 rounded-full ring-offset-1 transition-transform hover:scale-110 ${
                      color === c ? "ring-2 ring-slate-400" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                type="submit"
                className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
              >
                추가
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

"use client";

import type { Category } from "@/lib/types";
import { useState } from "react";
import CategorySelect from "./CategorySelect";

type Props = {
  categories: Category[];
  onAdd: (title: string, categoryId: string | null) => void;
};

export default function AddTodoForm({ categories, onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(
    categories[0]?.id ?? null
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, categoryId);
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="할 일을 입력하세요"
        className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />
      <CategorySelect
        categories={categories}
        value={categoryId}
        onChange={setCategoryId}
      />
      <button
        type="submit"
        className="flex-shrink-0 rounded-lg bg-indigo-500 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
      >
        추가
      </button>
    </form>
  );
}

"use client";

import type { Category } from "@/lib/types";

type Props = {
  categories: Category[];
  value: string | null;
  onChange: (categoryId: string | null) => void;
};

export default function CategorySelect({ categories, value, onChange }: Props) {
  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm text-slate-600 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">카테고리 없음</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}

"use client";

import { MONDAY_FIRST_WEEKDAYS, WEEKDAY_LABELS, formatWeekdays } from "@/lib/dateUtils";
import type { Category, Routine } from "@/lib/types";
import { useState } from "react";
import CategorySelect from "./CategorySelect";

type Props = {
  routines: Routine[];
  categories: Category[];
  onAdd: (title: string, categoryId: string | null, weekdays: number[]) => void;
  onDelete: (id: string) => void;
};

export default function RoutineManager({
  routines,
  categories,
  onAdd,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(
    categories[0]?.id ?? null
  );
  const [weekdays, setWeekdays] = useState<number[]>([]);

  function toggleWeekday(day: number) {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || weekdays.length === 0) return;
    onAdd(trimmed, categoryId, weekdays);
    setTitle("");
    setWeekdays([]);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-semibold text-slate-700"
      >
        <span>루틴 관리</span>
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
            {routines.map((routine) => {
              const category = categories.find((c) => c.id === routine.category_id);
              return (
                <li
                  key={routine.id}
                  className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
                >
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: category?.color ?? "#cbd5e1" }}
                    title={category?.name ?? "미분류"}
                  />
                  <span className="flex-1 truncate text-sm text-slate-600">
                    {routine.title}
                  </span>
                  <span className="flex-shrink-0 text-xs text-slate-400">
                    {formatWeekdays(routine.weekdays)}
                  </span>
                  <button
                    onClick={() => onDelete(routine.id)}
                    aria-label="루틴 삭제"
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
              );
            })}
            {routines.length === 0 && (
              <li className="px-2 py-1 text-sm text-slate-400">
                아직 루틴이 없어요.
              </li>
            )}
          </ul>

          <form onSubmit={handleAdd} className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="루틴으로 만들 할 일"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <CategorySelect
                categories={categories}
                value={categoryId}
                onChange={setCategoryId}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {MONDAY_FIRST_WEEKDAYS.map((day) => {
                  const active = weekdays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWeekday(day)}
                      aria-pressed={active}
                      className={[
                        "h-7 w-7 rounded-full text-xs font-medium transition-colors",
                        active
                          ? "bg-indigo-500 text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                      ].join(" ")}
                    >
                      {WEEKDAY_LABELS[day]}
                    </button>
                  );
                })}
              </div>
              <button
                type="submit"
                disabled={!title.trim() || weekdays.length === 0}
                className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300"
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

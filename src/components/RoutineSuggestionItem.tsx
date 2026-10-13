"use client";

import type { Category, Routine } from "@/lib/types";

type Props = {
  routine: Routine;
  category: Category | undefined;
  onAdd: (routine: Routine) => void;
};

// A routine scheduled for the selected day that hasn't been added as a todo
// yet. Shown greyed out; the + button turns it into a real todo.
export default function RoutineSuggestionItem({ routine, category, onAdd }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-3 py-2.5">
      <button
        onClick={() => onAdd(routine)}
        aria-label="루틴 할 일 추가"
        title="할 일로 추가"
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-slate-300 text-slate-400 transition-colors hover:border-indigo-400 hover:bg-indigo-400 hover:text-white"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {category && (
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full opacity-40"
          style={{ backgroundColor: category.color }}
          title={category.name}
        />
      )}

      <span className="flex-1 truncate text-sm text-slate-400">{routine.title}</span>

      <span className="flex-shrink-0 text-[11px] text-slate-300">루틴</span>
    </div>
  );
}

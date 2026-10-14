"use client";

import { useState } from "react";

export type MonthStat = {
  monthKey: string; // YYYY-MM
  label: string; // e.g. "10월"
  title: string; // e.g. "2026년 10월"
  completed: number;
  total: number;
};

type Props = {
  months: MonthStat[];
  // null = no single month selected (yearly view); all bars render equally.
  selectedMonthKey: string | null;
  onSelect: (monthKey: string) => void;
};

const PLOT_HEIGHT = 140;

// Completed-todo count per month as vertical bars; the selected month is
// emphasized and clicking a bar jumps to that month.
export default function MonthlyCompletionChart({ months, selectedMonthKey, onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const max = Math.max(1, ...months.map((m) => m.completed));

  return (
    <div className="relative">
      <div
        className="flex items-end gap-1 border-b border-slate-200 sm:gap-1.5"
        style={{ height: PLOT_HEIGHT + 24 }}
      >
        {months.map((m, i) => {
          const selected = m.monthKey === selectedMonthKey;
          const emphasized = selectedMonthKey === null || selected;
          const barHeight = (m.completed / max) * PLOT_HEIGHT;
          // Keep the tooltip inside the card for the edge bars.
          const tooltipAlign =
            i < 2 ? "left-0" : i >= months.length - 2 ? "right-0" : "left-1/2 -translate-x-1/2";
          return (
            <button
              key={m.monthKey}
              type="button"
              onClick={() => onSelect(m.monthKey)}
              onMouseEnter={() => setHovered(m.monthKey)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(m.monthKey)}
              onBlur={() => setHovered(null)}
              aria-label={`${m.title} 완료 ${m.completed}개 / 전체 ${m.total}개`}
              aria-pressed={selected}
              className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-end rounded-t-md hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
            >
              <span
                className={[
                  "mb-1 text-[11px]",
                  selected ? "font-semibold text-slate-800" : "text-slate-500",
                ].join(" ")}
              >
                {m.completed}
              </span>
              <span
                className={[
                  "w-full max-w-7 rounded-t-[4px] transition-colors",
                  selected ? "bg-indigo-500" : emphasized ? "bg-indigo-400" : "bg-indigo-200",
                ].join(" ")}
                style={{ height: Math.max(barHeight, m.completed > 0 ? 2 : 0) }}
              />

              {hovered === m.monthKey && (
                <span
                  className={`pointer-events-none absolute bottom-full z-10 mb-1 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-white shadow-lg ${tooltipAlign}`}
                >
                  {m.title}
                  <span className="ml-1.5 text-slate-300">
                    완료 {m.completed} / {m.total}개
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1 sm:gap-1.5">
        {months.map((m) => (
          <span
            key={m.monthKey}
            className={[
              "min-w-0 flex-1 text-center text-[11px]",
              m.monthKey === selectedMonthKey ? "font-semibold text-indigo-600" : "text-slate-400",
            ].join(" ")}
          >
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}

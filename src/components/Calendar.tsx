"use client";

import {
  WEEKDAY_LABELS,
  formatMonthTitle,
  getMonthGrid,
  isCurrentMonth,
  isDateToday,
  toDateKey,
} from "@/lib/dateUtils";
import type { Todo } from "@/lib/types";
import { useMemo } from "react";

type Props = {
  monthAnchor: Date;
  selectedDate: string;
  todos: Todo[];
  onSelectDate: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
};

export default function Calendar({
  monthAnchor,
  selectedDate,
  todos,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: Props) {
  const days = useMemo(() => getMonthGrid(monthAnchor), [monthAnchor]);

  const countsByDate = useMemo(() => {
    const map = new Map<string, { total: number; remaining: number }>();
    for (const todo of todos) {
      const entry = map.get(todo.date) ?? { total: 0, remaining: 0 };
      entry.total += 1;
      if (!todo.completed) entry.remaining += 1;
      map.set(todo.date, entry);
    }
    return map;
  }, [todos]);

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          {formatMonthTitle(monthAnchor)}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={onToday}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            오늘
          </button>
          <button
            onClick={onPrevMonth}
            aria-label="이전 달"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={onNextMonth}
            aria-label="다음 달"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-7">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`py-2 text-center text-xs font-medium ${
              i === 0 ? "text-rose-400" : i === 6 ? "text-blue-400" : "text-slate-400"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const dateKey = toDateKey(day);
          const inMonth = isCurrentMonth(day, monthAnchor);
          const today = isDateToday(day);
          const selected = dateKey === selectedDate;
          const counts = countsByDate.get(dateKey);
          const dayOfWeek = day.getDay();

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              className={[
                "flex h-16 flex-col items-center gap-1 rounded-xl border p-2 transition-colors sm:h-20",
                selected
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-transparent hover:bg-slate-50",
                !inMonth ? "opacity-35" : "",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-6 w-6 items-center justify-center rounded-full text-sm",
                  today
                    ? "bg-indigo-500 font-semibold text-white"
                    : dayOfWeek === 0
                    ? "text-rose-400"
                    : dayOfWeek === 6
                    ? "text-blue-400"
                    : "text-slate-600",
                ].join(" ")}
              >
                {day.getDate()}
              </span>

              {counts && counts.total > 0 ? (
                counts.remaining === 0 ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckIcon />
                  </span>
                ) : (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-100 px-1 text-[11px] font-semibold text-indigo-600">
                    {counts.remaining}
                  </span>
                )
              ) : (
                <span className="h-5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

"use client";

import CategoryStatsChart, { type CategoryStat } from "@/components/CategoryStatsChart";
import MonthlyCompletionChart, { type MonthStat } from "@/components/MonthlyCompletionChart";
import { fetchCategories, fetchTodosInRange } from "@/lib/data";
import { getTodayKey } from "@/lib/dateUtils";
import type { Category, Todo } from "@/lib/types";
import { useCallback, useEffect, useMemo, useState } from "react";

const UNCATEGORIZED_KEY = "__none__";
const UNCATEGORIZED_COLOR = "#94a3b8";
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function toMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export default function StatsPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  // null = the whole year.
  const [month, setMonth] = useState<number | null>(() => new Date().getMonth() + 1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // One query per year covers the yearly view, every month in it, and the
  // month-by-month chart.
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoryRows, todoRows] = await Promise.all([
        fetchCategories(),
        fetchTodosInRange(`${year}-01-01`, `${year}-12-31`),
      ]);
      setCategories(categoryRows);
      setTodos(todoRows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "통계를 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch sets loading/error state after awaiting
    loadData();
  }, [loadData]);

  const todayKey = getTodayKey();
  const periodPrefix = month === null ? `${year}-` : `${toMonthKey(year, month)}-`;
  const periodTitle = month === null ? `${year}년 전체` : `${year}년 ${month}월`;

  const summary = useMemo(() => {
    const inPeriod = todos.filter((t) => t.date.startsWith(periodPrefix));
    const completed = inPeriod.filter((t) => t.completed).length;
    // Unfinished todos only count as "missed" once their day has arrived;
    // later ones are still upcoming.
    const missed = inPeriod.filter((t) => !t.completed && t.date <= todayKey).length;
    const upcoming = inPeriod.length - completed - missed;
    const rate = completed + missed > 0 ? Math.round((completed / (completed + missed)) * 100) : null;
    return { inPeriod, completed, missed, upcoming, rate };
  }, [todos, periodPrefix, todayKey]);

  const categoryStats = useMemo<CategoryStat[]>(() => {
    const byKey = new Map<string, { completed: number; missed: number }>();
    for (const todo of summary.inPeriod) {
      const isMissed = !todo.completed && todo.date <= todayKey;
      if (!todo.completed && !isMissed) continue;
      const key = todo.category_id ?? UNCATEGORIZED_KEY;
      const entry = byKey.get(key) ?? { completed: 0, missed: 0 };
      if (todo.completed) entry.completed += 1;
      else entry.missed += 1;
      byKey.set(key, entry);
    }

    const result: CategoryStat[] = [];
    for (const category of categories) {
      const entry = byKey.get(category.id);
      if (entry) result.push({ key: category.id, name: category.name, color: category.color, ...entry });
    }
    const uncategorized = byKey.get(UNCATEGORIZED_KEY);
    if (uncategorized) {
      result.push({
        key: UNCATEGORIZED_KEY,
        name: "미분류",
        color: UNCATEGORIZED_COLOR,
        ...uncategorized,
      });
    }
    return result;
  }, [summary.inPeriod, categories, todayKey]);

  const monthStats = useMemo<MonthStat[]>(
    () =>
      MONTHS.map((m) => {
        const monthKey = toMonthKey(year, m);
        const inMonth = todos.filter((t) => t.date.startsWith(monthKey));
        return {
          monthKey,
          label: `${m}월`,
          title: `${year}년 ${m}월`,
          completed: inMonth.filter((t) => t.completed).length,
          total: inMonth.length,
        };
      }),
    [year, todos]
  );

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-800">통계</h1>
          <div className="flex items-center gap-2">
            {error && (
              <span className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-500">
                {error}
              </span>
            )}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setYear((y) => y - 1)}
                aria-label="이전 연도"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <Chevron direction="left" />
              </button>
              <span className="min-w-16 text-center text-sm font-semibold text-slate-700">
                {year}년
              </span>
              <button
                onClick={() => setYear((y) => y + 1)}
                aria-label="다음 연도"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <Chevron direction="right" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="기간 선택">
          <PeriodChip active={month === null} onClick={() => setMonth(null)}>
            연간 전체
          </PeriodChip>
          {MONTHS.map((m) => (
            <PeriodChip key={m} active={month === m} onClick={() => setMonth(m)}>
              {m}월
            </PeriodChip>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="완료" value={`${summary.completed}개`} />
          <StatTile label="미완료" value={`${summary.missed}개`} hint="오늘까지 못한 일" />
          <StatTile
            label="달성률"
            value={summary.rate === null ? "–" : `${summary.rate}%`}
            hint="완료 ÷ (완료 + 미완료)"
          />
          <StatTile label="예정" value={`${summary.upcoming}개`} hint="아직 날짜가 안 된 일" />
        </div>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold text-slate-700">카테고리별 수행</h2>
            <p className="mb-4 text-xs text-slate-400">{periodTitle} · 오늘까지의 할 일 기준</p>
            <CategoryStatsChart stats={categoryStats} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold text-slate-700">월별 완료한 일</h2>
            <p className="mb-4 text-xs text-slate-400">
              {year}년 · 막대를 누르면 그 달 통계로 이동
            </p>
            <MonthlyCompletionChart
              months={monthStats}
              selectedMonthKey={month === null ? null : toMonthKey(year, month)}
              onSelect={(monthKey) => setMonth(Number(monthKey.slice(5)))}
            />
          </section>
        </div>

        {loading && <p className="text-center text-xs text-slate-400">불러오는 중...</p>}
      </div>
    </main>
  );
}

function PeriodChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-indigo-500 text-white"
          : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

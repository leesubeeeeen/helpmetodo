"use client";

export type CategoryStat = {
  key: string;
  name: string;
  color: string;
  completed: number;
  missed: number;
};

type Props = {
  stats: CategoryStat[];
};

// One stacked horizontal bar per category: completed (category color) then
// missed (neutral). Bar length is scaled to the busiest category so the
// chart shows volume as well as the completion ratio.
export default function CategoryStatsChart({ stats }: Props) {
  const maxTotal = Math.max(1, ...stats.map((s) => s.completed + s.missed));

  if (stats.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-400">
        이 달에 지난 할 일이 아직 없어요.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-slate-500" />
          완료 (카테고리 색)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-slate-200" />
          미완료
        </span>
      </div>

      <ul className="space-y-4">
        {stats.map((s) => {
          const total = s.completed + s.missed;
          const rate = total > 0 ? Math.round((s.completed / total) * 100) : 0;
          return (
            <li
              key={s.key}
              title={`${s.name} · 완료 ${s.completed}개 · 미완료 ${s.missed}개 (${rate}%)`}
              className="-mx-2 rounded-lg px-2 py-1 transition-colors hover:bg-slate-50"
            >
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="truncate text-sm font-medium text-slate-700">{s.name}</span>
                </span>
                <span className="flex-shrink-0 text-xs text-slate-500">
                  완료 <span className="font-semibold text-slate-800">{s.completed}</span>
                  <span className="mx-1 text-slate-300">·</span>
                  미완료 <span className="font-semibold text-slate-800">{s.missed}</span>
                  <span className="ml-2 inline-block w-9 text-right font-medium text-slate-600">
                    {rate}%
                  </span>
                </span>
              </div>
              <div className="flex h-2.5 gap-0.5" style={{ width: `${(total / maxTotal) * 100}%` }}>
                {s.completed > 0 && (
                  <div
                    className="h-full rounded-l-[4px] last:rounded-r-[4px]"
                    style={{ flexGrow: s.completed, backgroundColor: s.color }}
                  />
                )}
                {s.missed > 0 && (
                  <div
                    className="h-full rounded-r-[4px] bg-slate-200 first:rounded-l-[4px]"
                    style={{ flexGrow: s.missed }}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

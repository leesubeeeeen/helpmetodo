"use client";

import Avatar from "@/components/Avatar";
import Calendar from "@/components/Calendar";
import { fetchFriendCategories, fetchFriendProfile, fetchFriendTodosInRange } from "@/lib/friends";
import { getMonthGrid, nextMonth, previousMonth, toDateKey } from "@/lib/dateUtils";
import { formatDayTitle } from "@/lib/dateUtils";
import type { Category, Profile, Todo } from "@/lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const UNCATEGORIZED_KEY = "__none__";

export default function FriendTodosPage() {
  const params = useParams<{ id: string }>();
  const friendId = params.id;

  const [monthAnchor, setMonthAnchor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [profile, setProfile] = useState<Profile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const grid = useMemo(() => getMonthGrid(monthAnchor), [monthAnchor]);
  const rangeStart = toDateKey(grid[0]);
  const rangeEnd = toDateKey(grid[grid.length - 1]);

  const loadData = useCallback(async () => {
    try {
      const [profileRow, categoryRows, todoRows] = await Promise.all([
        fetchFriendProfile(friendId),
        fetchFriendCategories(friendId),
        fetchFriendTodosInRange(friendId, rangeStart, rangeEnd),
      ]);
      setProfile(profileRow);
      setCategories(categoryRows);
      setTodos(todoRows);
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "친구의 할 일을 불러오지 못했어요. 친구 관계인지 확인해주세요."
      );
    }
  }, [friendId, rangeStart, rangeEnd]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch sets state after awaiting
    loadData();
  }, [loadData]);

  const todosForSelectedDate = useMemo(
    () => todos.filter((t) => t.date === selectedDate),
    [todos, selectedDate]
  );

  const groups = useMemo(() => {
    const map = new Map<string, Todo[]>();
    for (const todo of todosForSelectedDate) {
      const key = todo.category_id ?? UNCATEGORIZED_KEY;
      const list = map.get(key) ?? [];
      list.push(todo);
      map.set(key, list);
    }
    const ordered: { key: string; category: Category | undefined; todos: Todo[] }[] = [];
    for (const category of categories) {
      if (map.has(category.id)) {
        ordered.push({ key: category.id, category, todos: map.get(category.id)! });
      }
    }
    if (map.has(UNCATEGORIZED_KEY)) {
      ordered.push({
        key: UNCATEGORIZED_KEY,
        category: undefined,
        todos: map.get(UNCATEGORIZED_KEY)!,
      });
    }
    return ordered;
  }, [todosForSelectedDate, categories]);

  const dateObj = useMemo(() => new Date(`${selectedDate}T00:00:00`), [selectedDate]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/friends" className="text-sm text-slate-400 hover:text-slate-600">
              ← 친구 목록
            </Link>
            {profile && <Avatar profile={profile} size={36} />}
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {profile ? `${profile.nickname}님의 할 일` : "할 일"}
              </h1>
              {profile?.bio && <p className="text-xs text-slate-500">{profile.bio}</p>}
            </div>
          </div>
          {error && (
            <span className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-500">
              {error}
            </span>
          )}
        </header>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <Calendar
              monthAnchor={monthAnchor}
              selectedDate={selectedDate}
              todos={todos}
              onSelectDate={setSelectedDate}
              onPrevMonth={() => setMonthAnchor((m) => previousMonth(m))}
              onNextMonth={() => setMonthAnchor((m) => nextMonth(m))}
              onToday={() => {
                const today = new Date();
                setMonthAnchor(today);
                setSelectedDate(toDateKey(today));
              }}
            />
          </div>

          <div className="flex max-h-[560px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              {formatDayTitle(dateObj)}
            </h2>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto">
              {groups.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">
                  이 날짜에 등록된 할 일이 없어요.
                </p>
              )}

              {groups.map((group) => (
                <div key={group.key}>
                  <div className="mb-2 flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: group.category?.color ?? "#cbd5e1" }}
                    />
                    <span className="text-xs font-medium text-slate-500">
                      {group.category?.name ?? "미분류"}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {group.todos.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5"
                      >
                        <span
                          className={[
                            "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2",
                            todo.completed
                              ? "border-emerald-400 bg-emerald-400 text-white"
                              : "border-slate-300",
                          ].join(" ")}
                        >
                          {todo.completed && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M5 13l4 4L19 7"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <span
                          className={[
                            "flex-1 truncate text-sm",
                            todo.completed ? "text-slate-400 line-through" : "text-slate-700",
                          ].join(" ")}
                        >
                          {todo.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

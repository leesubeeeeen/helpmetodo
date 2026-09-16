"use client";

import Calendar from "@/components/Calendar";
import CategoryManager from "@/components/CategoryManager";
import DayPanel from "@/components/DayPanel";
import SetupNotice from "@/components/SetupNotice";
import {
  createCategory,
  createTodo,
  deleteCategory,
  deleteTodo,
  fetchCategories,
  fetchTodosInRange,
  toggleTodo,
  updateCategory,
} from "@/lib/data";
import { getMonthGrid, nextMonth, previousMonth, toDateKey } from "@/lib/dateUtils";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import type { Category, Todo } from "@/lib/types";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function Home() {
  const [monthAnchor, setMonthAnchor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [categories, setCategories] = useState<Category[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const grid = useMemo(() => getMonthGrid(monthAnchor), [monthAnchor]);
  const rangeStart = toDateKey(grid[0]);
  const rangeEnd = toDateKey(grid[grid.length - 1]);

  const loadData = useCallback(async () => {
    try {
      const [categoryRows, todoRows] = await Promise.all([
        fetchCategories(),
        fetchTodosInRange(rangeStart, rangeEnd),
      ]);
      setCategories(categoryRows);
      setTodos(todoRows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "데이터를 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, [rangeStart, rangeEnd]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch sets loading/error state after awaiting
    loadData();
  }, [loadData]);

  const todosForSelectedDate = useMemo(
    () => todos.filter((t) => t.date === selectedDate),
    [todos, selectedDate]
  );

  async function handleAddTodo(title: string, categoryId: string | null) {
    try {
      const created = await createTodo({
        title,
        date: selectedDate,
        category_id: categoryId,
      });
      setTodos((prev) => [...prev, created]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "할 일을 추가하지 못했어요.");
    }
  }

  async function handleToggleTodo(id: string, completed: boolean) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t))
    );
    try {
      await toggleTodo(id, completed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "상태를 변경하지 못했어요.");
      loadData();
    }
  }

  async function handleDeleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTodo(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제하지 못했어요.");
      loadData();
    }
  }

  async function handleAddCategory(name: string, color: string) {
    try {
      const created = await createCategory({
        name,
        color,
        sort_order: categories.length,
      });
      setCategories((prev) => [...prev, created]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "카테고리를 추가하지 못했어요.");
    }
  }

  async function handleRenameCategory(id: string, name: string) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
    try {
      await updateCategory(id, { name });
    } catch (e) {
      setError(e instanceof Error ? e.message : "이름을 변경하지 못했어요.");
      loadData();
    }
  }

  async function handleDeleteCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setTodos((prev) =>
      prev.map((t) => (t.category_id === id ? { ...t, category_id: null } : t))
    );
    try {
      await deleteCategory(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "카테고리를 삭제하지 못했어요.");
      loadData();
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="px-4 py-10">
        <SetupNotice />
      </main>
    );
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">할 일 캘린더</h1>
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

          <div className="flex flex-col gap-5">
            <DayPanel
              selectedDate={selectedDate}
              todos={todosForSelectedDate}
              categories={categories}
              onAdd={handleAddTodo}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
            />
            <CategoryManager
              categories={categories}
              onAdd={handleAddCategory}
              onDelete={handleDeleteCategory}
              onRename={handleRenameCategory}
            />
          </div>
        </div>

        {loading && (
          <p className="mt-4 text-center text-xs text-slate-400">불러오는 중...</p>
        )}
      </div>
    </main>
  );
}

"use client";

import { formatDayTitle } from "@/lib/dateUtils";
import type { Category, Todo } from "@/lib/types";
import { useMemo } from "react";
import AddTodoForm from "./AddTodoForm";
import TodoItem from "./TodoItem";

type Props = {
  selectedDate: string;
  todos: Todo[];
  categories: Category[];
  onAdd: (title: string, categoryId: string | null) => void;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
};

const UNCATEGORIZED_KEY = "__none__";

export default function DayPanel({
  selectedDate,
  todos,
  categories,
  onAdd,
  onToggle,
  onDelete,
}: Props) {
  const groups = useMemo(() => {
    const map = new Map<string, Todo[]>();
    for (const todo of todos) {
      const key = todo.category_id ?? UNCATEGORIZED_KEY;
      const list = map.get(key) ?? [];
      list.push(todo);
      map.set(key, list);
    }
    const ordered: { key: string; category: Category | undefined; todos: Todo[] }[] =
      [];
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
  }, [todos, categories]);

  const remaining = todos.filter((t) => !t.completed).length;
  const dateObj = useMemo(() => new Date(`${selectedDate}T00:00:00`), [selectedDate]);

  return (
    <div className="flex max-h-[560px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          {formatDayTitle(dateObj)}
        </h2>
        {todos.length > 0 && (
          <span className="text-sm text-slate-400">
            {remaining > 0 ? `${remaining}개 남음` : "모두 완료"}
          </span>
        )}
      </div>

      <div className="mb-4">
        <AddTodoForm categories={categories} onAdd={onAdd} />
      </div>

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
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  category={group.category}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

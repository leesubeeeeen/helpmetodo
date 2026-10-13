"use client";

import { formatDayTitle, getTodayKey } from "@/lib/dateUtils";
import type { Category, Routine, Todo } from "@/lib/types";
import { useMemo } from "react";
import AddTodoForm from "./AddTodoForm";
import RoutineSuggestionItem from "./RoutineSuggestionItem";
import TodoItem from "./TodoItem";

type Props = {
  selectedDate: string;
  todos: Todo[];
  categories: Category[];
  routines: Routine[];
  onAdd: (title: string, categoryId: string | null) => void;
  onAddFromRoutine: (routine: Routine) => void;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onPostpone: (id: string) => void;
};

type Group = {
  key: string;
  category: Category | undefined;
  todos: Todo[];
  routines: Routine[];
};

const UNCATEGORIZED_KEY = "__none__";

export default function DayPanel({
  selectedDate,
  todos,
  categories,
  routines,
  onAdd,
  onAddFromRoutine,
  onToggle,
  onDelete,
  onPostpone,
}: Props) {
  const dateObj = useMemo(() => new Date(`${selectedDate}T00:00:00`), [selectedDate]);
  const isToday = selectedDate === getTodayKey();

  // Routines scheduled for this weekday that haven't been added as a todo yet.
  const pendingRoutines = useMemo(() => {
    const weekday = dateObj.getDay();
    const addedRoutineIds = new Set(todos.map((t) => t.routine_id));
    return routines.filter(
      (r) => r.weekdays.includes(weekday) && !addedRoutineIds.has(r.id)
    );
  }, [routines, todos, dateObj]);

  const groups = useMemo(() => {
    const map = new Map<string, Group>();
    const groupFor = (categoryId: string | null) => {
      const key = categoryId ?? UNCATEGORIZED_KEY;
      let group = map.get(key);
      if (!group) {
        group = { key, category: undefined, todos: [], routines: [] };
        map.set(key, group);
      }
      return group;
    };
    for (const todo of todos) groupFor(todo.category_id).todos.push(todo);
    for (const routine of pendingRoutines) groupFor(routine.category_id).routines.push(routine);

    const ordered: Group[] = [];
    for (const category of categories) {
      const group = map.get(category.id);
      if (group) ordered.push({ ...group, category });
    }
    const uncategorized = map.get(UNCATEGORIZED_KEY);
    if (uncategorized) ordered.push(uncategorized);
    return ordered;
  }, [todos, pendingRoutines, categories]);

  const remaining = todos.filter((t) => !t.completed).length;

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
                  onPostpone={isToday && !todo.completed ? onPostpone : undefined}
                />
              ))}
              {group.routines.map((routine) => (
                <RoutineSuggestionItem
                  key={`routine-${routine.id}`}
                  routine={routine}
                  category={group.category}
                  onAdd={onAddFromRoutine}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

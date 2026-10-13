"use client";

import type { Category, Todo } from "@/lib/types";

type Props = {
  todo: Todo;
  category: Category | undefined;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  // Only passed for today's unfinished todos.
  onPostpone?: (id: string) => void;
};

export default function TodoItem({
  todo,
  category,
  onToggle,
  onDelete,
  onPostpone,
}: Props) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 transition-colors hover:border-slate-200">
      <button
        onClick={() => onToggle(todo.id, !todo.completed)}
        aria-label={todo.completed ? "완료 취소" : "완료 처리"}
        className={[
          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          todo.completed
            ? "border-emerald-400 bg-emerald-400 text-white"
            : "border-slate-300 text-transparent hover:border-indigo-400",
        ].join(" ")}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {category && (
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: category.color }}
          title={category.name}
        />
      )}

      <span
        className={[
          "flex-1 truncate text-sm",
          todo.completed ? "text-slate-400 line-through" : "text-slate-700",
        ].join(" ")}
      >
        {todo.title}
      </span>

      {onPostpone && (
        <button
          onClick={() => onPostpone(todo.id)}
          className="flex-shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-500"
        >
          내일하기
        </button>
      )}

      <button
        onClick={() => onDelete(todo.id)}
        aria-label="삭제"
        className="flex-shrink-0 rounded-md p-1 text-slate-300 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-400 group-hover:opacity-100"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

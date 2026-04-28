"use client";
import { useOptimistic, useTransition } from "react";
import { toggleTodo, deleteTodo } from "@/server/todos";
import { navigate } from "rwsdk/client";
import type { Todo } from "@/db/schema";

export function TodoItem({ todo }: { todo: Todo }) {
  const [optimisticCompleted, applyOptimisticCompleted] = useOptimistic(
    todo.completed
  );
  const [optimisticDeleted, applyOptimisticDeleted] = useOptimistic(false);
  const [, startTransition] = useTransition();

  if (optimisticDeleted) return null;

  const handleToggle = () => {
    startTransition(async () => {
      applyOptimisticCompleted(optimisticCompleted === 0 ? 1 : 0);
      await toggleTodo(todo.id);
      await navigate("/");
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      applyOptimisticDeleted(true);
      await deleteTodo(todo.id);
      await navigate("/");
    });
  };

  return (
    <li className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <input
        id={`todo-${todo.id}`}
        type="checkbox"
        checked={optimisticCompleted === 1}
        onChange={handleToggle}
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500"
      />
      <label
        htmlFor={`todo-${todo.id}`}
        className={`flex-1 text-sm cursor-pointer ${
          optimisticCompleted === 1 ? "line-through text-gray-400" : "text-gray-900"
        }`}
      >
        {todo.title}
      </label>
      <button
        onClick={handleDelete}
        aria-label={`Delete "${todo.title}"`}
        className="text-gray-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded px-1"
      >
        ✕
      </button>
    </li>
  );
}

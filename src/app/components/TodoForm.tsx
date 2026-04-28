"use client";
import { useState, useTransition } from "react";
import { createTodo } from "@/server/todos";
import { navigate } from "rwsdk/client";

export function TodoForm() {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await createTodo(trimmed);
      setTitle("");
      await navigate("/");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <label htmlFor="todo-input" className="sr-only">
        New todo title
      </label>
      <input
        id="todo-input"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        disabled={isPending}
        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isPending || !title.trim()}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add
      </button>
    </form>
  );
}

import { defineApp } from "rwsdk/worker";
import { route, render } from "rwsdk/router";
import { Document } from "@/app/Document";
import TodoList from "@/app/components/TodoList";
import { TodoForm } from "@/app/components/TodoForm";

export default defineApp([
  render(Document, [
    route("/", () => (
      <main className="max-w-xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Todos</h1>
        <TodoForm />
        <TodoList />
      </main>
    )),
  ]),
]);

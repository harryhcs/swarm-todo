import { listTodos } from "@/server/todos";
import { TodoItem } from "./TodoItem";

export default async function TodoList() {
  const todos = await listTodos();

  return (
    <section aria-label="Todo list">
      {todos.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No todos yet — add one above.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      )}
    </section>
  );
}

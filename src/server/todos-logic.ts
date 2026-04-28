import { desc, eq } from "drizzle-orm";
import { todos } from "@/db/schema";
import type { Todo } from "@/db/schema";
import { ValidationError, InternalError } from "./errors";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyDB = BaseSQLiteDatabase<any, any, any>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length < 1 || trimmed.length > 200) {
    throw new ValidationError("title must be 1-200 chars");
  }
  return trimmed;
}

function validateId(id: string): void {
  if (!UUID_RE.test(id)) {
    throw new ValidationError("invalid id");
  }
}

export async function listTodosLogic(db: AnyDB): Promise<Todo[]> {
  try {
    return (await db
      .select()
      .from(todos)
      .orderBy(desc(todos.created_at))) as Todo[];
  } catch (err) {
    console.error("[listTodos]", err);
    throw new InternalError("could not list todos", err);
  }
}

export async function createTodoLogic(
  db: AnyDB,
  title: string
): Promise<Todo> {
  const trimmed = validateTitle(title);
  const row: Todo = {
    id: crypto.randomUUID(),
    title: trimmed,
    completed: 0,
    created_at: Date.now(),
  };
  try {
    await db.insert(todos).values(row);
    return row;
  } catch (err) {
    console.error("[createTodo]", err);
    throw new InternalError("could not create todo", err);
  }
}

export async function toggleTodoLogic(
  db: AnyDB,
  id: string
): Promise<Todo> {
  validateId(id);
  try {
    const rows = (await db
      .select()
      .from(todos)
      .where(eq(todos.id, id))) as Todo[];
    if (rows.length === 0) {
      throw new ValidationError("invalid id");
    }
    const current = rows[0];
    const next = current.completed === 0 ? 1 : 0;
    await db.update(todos).set({ completed: next }).where(eq(todos.id, id));
    return { ...current, completed: next };
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    console.error("[toggleTodo]", err);
    throw new InternalError("could not toggle todo", err);
  }
}

export async function deleteTodoLogic(
  db: AnyDB,
  id: string
): Promise<void> {
  validateId(id);
  try {
    await db.delete(todos).where(eq(todos.id, id));
  } catch (err) {
    console.error("[deleteTodo]", err);
    throw new InternalError("could not delete todo", err);
  }
}

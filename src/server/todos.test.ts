import { describe, it, expect, mock, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  )
`;

// Mutable reference replaced by beforeEach — captured by closure in createDb mock below
let testDb: ReturnType<typeof drizzle>;

// Mock cloudflare:workers before any import that depends on it
mock.module("cloudflare:workers", () => ({
  env: { DB: {} },
}));

// Inject the in-memory drizzle db via the client factory
mock.module("@/db/client", () => ({
  createDb: () => testDb,
}));

// Dynamic import so mocks are in effect first
const { listTodos, createTodo, toggleTodo, deleteTodo } = await import(
  "./todos"
);

beforeEach(() => {
  const sqlite = new Database(":memory:");
  sqlite.exec(CREATE_TABLE);
  testDb = drizzle(sqlite);
});

describe("todos server functions (integration via in-memory SQLite)", () => {
  it("listTodos returns [] when empty", async () => {
    expect(await listTodos()).toEqual([]);
  });

  it("createTodo returns persisted todo", async () => {
    const todo = await createTodo("hello");
    expect(todo.title).toBe("hello");
    expect(todo.completed).toBe(0);
    const list = await listTodos();
    expect(list).toHaveLength(1);
  });

  it("toggleTodo flips completed", async () => {
    const todo = await createTodo("toggle");
    const toggled = await toggleTodo(todo.id);
    expect(toggled.completed).toBe(1);
    const toggled2 = await toggleTodo(todo.id);
    expect(toggled2.completed).toBe(0);
  });

  it("deleteTodo removes the todo", async () => {
    const todo = await createTodo("delete me");
    await deleteTodo(todo.id);
    expect(await listTodos()).toHaveLength(0);
  });
});

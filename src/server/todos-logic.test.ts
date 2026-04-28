import { describe, it, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import {
  listTodosLogic,
  createTodoLogic,
  toggleTodoLogic,
  deleteTodoLogic,
  type AnyDB,
} from "./todos-logic";
import { ValidationError } from "./errors";

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  )
`;

function makeDb(): AnyDB {
  const sqlite = new Database(":memory:");
  sqlite.exec(CREATE_TABLE);
  return drizzle(sqlite) as unknown as AnyDB;
}

let db: AnyDB;

beforeEach(() => {
  db = makeDb();
});

describe("listTodosLogic", () => {
  it("returns empty array when no todos", async () => {
    const result = await listTodosLogic(db);
    expect(result).toEqual([]);
  });

  it("returns todos ordered by created_at descending", async () => {
    const realNow = Date.now;
    Date.now = () => 1000;
    await createTodoLogic(db, "first");
    Date.now = () => 2000;
    await createTodoLogic(db, "second");
    Date.now = realNow;
    const result = await listTodosLogic(db);
    expect(result[0].title).toBe("second");
    expect(result[1].title).toBe("first");
  });
});

describe("createTodoLogic", () => {
  it("creates a todo and returns it", async () => {
    const todo = await createTodoLogic(db, "buy milk");
    expect(todo.title).toBe("buy milk");
    expect(todo.completed).toBe(0);
    expect(todo.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(typeof todo.created_at).toBe("number");
  });

  it("trims whitespace from title", async () => {
    const todo = await createTodoLogic(db, "  trimmed  ");
    expect(todo.title).toBe("trimmed");
  });

  it("persists the todo in the database", async () => {
    await createTodoLogic(db, "persist me");
    const list = await listTodosLogic(db);
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe("persist me");
  });

  it("throws ValidationError for empty title", async () => {
    await expect(createTodoLogic(db, "")).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws ValidationError for blank title", async () => {
    await expect(createTodoLogic(db, "   ")).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws ValidationError for title > 200 chars", async () => {
    const long = "a".repeat(201);
    await expect(createTodoLogic(db, long)).rejects.toBeInstanceOf(ValidationError);
  });

  it("accepts title of exactly 200 chars", async () => {
    const todo = await createTodoLogic(db, "a".repeat(200));
    expect(todo.title).toHaveLength(200);
  });
});

describe("toggleTodoLogic", () => {
  it("toggles an incomplete todo to complete", async () => {
    const created = await createTodoLogic(db, "toggle me");
    const toggled = await toggleTodoLogic(db, created.id);
    expect(toggled.completed).toBe(1);
    expect(toggled.id).toBe(created.id);
  });

  it("toggles a completed todo back to incomplete", async () => {
    const created = await createTodoLogic(db, "toggle twice");
    await toggleTodoLogic(db, created.id);
    const toggled = await toggleTodoLogic(db, created.id);
    expect(toggled.completed).toBe(0);
  });

  it("persists the toggle", async () => {
    const created = await createTodoLogic(db, "persist toggle");
    await toggleTodoLogic(db, created.id);
    const list = await listTodosLogic(db);
    expect(list[0].completed).toBe(1);
  });

  it("throws ValidationError for non-UUID id", async () => {
    await expect(toggleTodoLogic(db, "not-a-uuid")).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws ValidationError for unknown UUID", async () => {
    await expect(
      toggleTodoLogic(db, "00000000-0000-0000-0000-000000000000")
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("deleteTodoLogic", () => {
  it("deletes an existing todo", async () => {
    const created = await createTodoLogic(db, "delete me");
    await deleteTodoLogic(db, created.id);
    const list = await listTodosLogic(db);
    expect(list).toHaveLength(0);
  });

  it("is idempotent — deleting a missing id does not throw", async () => {
    await expect(
      deleteTodoLogic(db, "00000000-0000-0000-0000-000000000000")
    ).resolves.toBeUndefined();
  });

  it("throws ValidationError for non-UUID id", async () => {
    await expect(deleteTodoLogic(db, "bad")).rejects.toBeInstanceOf(ValidationError);
  });
});

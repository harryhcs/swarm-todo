import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import type { InferSelectModel } from "drizzle-orm";

export const todos = sqliteTable("todos", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  completed: integer("completed").notNull().default(0),
  created_at: integer("created_at").notNull(),
});

export type Todo = InferSelectModel<typeof todos>;

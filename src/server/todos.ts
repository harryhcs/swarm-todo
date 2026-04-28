"use server";
import { env } from "cloudflare:workers";
import { createDb } from "@/db/client";
import {
  listTodosLogic,
  createTodoLogic,
  toggleTodoLogic,
  deleteTodoLogic,
} from "./todos-logic";

function db() {
  return createDb(env.DB);
}

export async function listTodos() {
  return listTodosLogic(db());
}

export async function createTodo(title: string) {
  return createTodoLogic(db(), title);
}

export async function toggleTodo(id: string) {
  return toggleTodoLogic(db(), id);
}

export async function deleteTodo(id: string) {
  return deleteTodoLogic(db(), id);
}

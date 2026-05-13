import Database from "@tauri-apps/plugin-sql"
import type { Todo } from "./types"

let db: Database | null = null

async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:todolist.db")
    await db.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
  }
  return db
}

export async function getAllTodos(): Promise<Todo[]> {
  const db = await getDb()
  return db.select<Todo[]>("SELECT * FROM todos ORDER BY created_at DESC")
}

export async function addTodo(title: string): Promise<Todo> {
  const db = await getDb()
  const result = await db.execute(
    "INSERT INTO todos (title) VALUES ($1)",
    [title]
  )
  const rows = await db.select<Todo[]>(
    "SELECT * FROM todos WHERE id = $1",
    [result.lastInsertId]
  )
  return rows[0]
}

export async function toggleTodo(id: number, completed: boolean): Promise<void> {
  const db = await getDb()
  await db.execute(
    "UPDATE todos SET completed = $1, updated_at = datetime('now') WHERE id = $2",
    [completed ? 1 : 0, id]
  )
}

export async function updateTodoTitle(id: number, title: string): Promise<void> {
  const db = await getDb()
  await db.execute(
    "UPDATE todos SET title = $1, updated_at = datetime('now') WHERE id = $2",
    [title, id]
  )
}

export async function deleteTodo(id: number): Promise<void> {
  const db = await getDb()
  await db.execute("DELETE FROM todos WHERE id = $1", [id])
}

export async function clearCompleted(): Promise<void> {
  const db = await getDb()
  await db.execute("DELETE FROM todos WHERE completed = 1")
}

export async function getCounts(): Promise<{ total: number; active: number; completed: number }> {
  const db = await getDb()
  const rows = await db.select<[{ total: number; active: number; completed: number }]>(
    `SELECT
      COUNT(*) as total,
      SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
    FROM todos`
  )
  return rows[0]
}

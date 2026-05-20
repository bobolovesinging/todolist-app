import Database from "@tauri-apps/plugin-sql"
import type { Todo } from "./types"

let db: Database | null = null

async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:todolist.db")
    await migrate(db)
  }
  return db
}

async function migrate(db: Database) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      completed INTEGER NOT NULL DEFAULT 0,
      due_date TEXT,
      sort_order REAL NOT NULL DEFAULT 0,
      recurrence TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  const cols = await db.select<{ name: string }[]>("PRAGMA table_info(todos)")
  const colNames = cols.map(c => c.name)

  if (colNames.includes("title")) {
    await db.execute("ALTER TABLE todos RENAME COLUMN title TO name")
  }
  if (!colNames.includes("description")) {
    await db.execute("ALTER TABLE todos ADD COLUMN description TEXT NOT NULL DEFAULT ''")
  }
  if (!colNames.includes("due_date")) {
    await db.execute("ALTER TABLE todos ADD COLUMN due_date TEXT")
  }
  if (!colNames.includes("sort_order")) {
    await db.execute("ALTER TABLE todos ADD COLUMN sort_order REAL NOT NULL DEFAULT 0")
  }
  if (!colNames.includes("recurrence")) {
    await db.execute("ALTER TABLE todos ADD COLUMN recurrence TEXT")
  }
}

export async function getAllTodos(): Promise<Todo[]> {
  const db = await getDb()
  return db.select<Todo[]>(
    "SELECT * FROM todos ORDER BY sort_order ASC, created_at DESC"
  )
}

export async function addTodo(
  name: string,
  description: string = "",
  due_date: string | null = null,
  recurrence: string | null = null
): Promise<Todo> {
  const db = await getDb()
  const maxOrder = await db.select<[{ m: number | null }]>(
    "SELECT MAX(sort_order) as m FROM todos"
  )
  const sortOrder = (maxOrder[0]?.m ?? 0) + 1
  const result = await db.execute(
    "INSERT INTO todos (name, description, due_date, sort_order, recurrence) VALUES ($1, $2, $3, $4, $5)",
    [name, description, due_date, sortOrder, recurrence]
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

export async function updateTodoName(id: number, name: string): Promise<void> {
  const db = await getDb()
  await db.execute(
    "UPDATE todos SET name = $1, updated_at = datetime('now') WHERE id = $2",
    [name, id]
  )
}

export async function updateTodoDescription(id: number, description: string): Promise<void> {
  const db = await getDb()
  await db.execute(
    "UPDATE todos SET description = $1, updated_at = datetime('now') WHERE id = $2",
    [description, id]
  )
}

export async function updateTodoDueDate(id: number, due_date: string | null): Promise<void> {
  const db = await getDb()
  await db.execute(
    "UPDATE todos SET due_date = $1, updated_at = datetime('now') WHERE id = $2",
    [due_date, id]
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

export function getNextDueDate(current: string, recurrence: string): string {
  const d = new Date(current)
  const [type, n] = recurrence.split(":")
  const count = n ? parseInt(n) : 1

  switch (type) {
    case "daily":
    case "days":
      d.setDate(d.getDate() + count)
      break
    case "weekly":
    case "weeks":
      d.setDate(d.getDate() + 7 * count)
      break
    case "monthly":
    case "months":
      d.setMonth(d.getMonth() + count)
      break
    case "yearly":
    case "years":
      d.setFullYear(d.getFullYear() + count)
      break
  }
  return d.toISOString().split("T")[0]
}

export async function completeRecurringTodo(
  id: number,
  due_date: string,
  recurrence: string
): Promise<string> {
  const nextDate = getNextDueDate(due_date, recurrence)
  const db = await getDb()
  await db.execute(
    "UPDATE todos SET due_date = $1, updated_at = datetime('now') WHERE id = $2",
    [nextDate, id]
  )
  return nextDate
}

export async function reorderTodos(orderedIds: number[]): Promise<void> {
  const db = await getDb()
  for (let i = 0; i < orderedIds.length; i++) {
    await db.execute(
      "UPDATE todos SET sort_order = $1, updated_at = datetime('now') WHERE id = $2",
      [i, orderedIds[i]]
    )
  }
}


export interface Todo {
  id: number
  title: string
  completed: number // SQLite stores booleans as 0/1
  created_at: string
  updated_at: string
}

export type Filter = "all" | "active" | "completed"

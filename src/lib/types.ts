export interface Todo {
  id: number
  name: string
  description: string
  completed: number
  due_date: string | null
  sort_order: number
  recurrence: string | null
  created_at: string
  updated_at: string
}

export type Filter = "all" | "active" | "completed"

import { useState, useEffect, useCallback } from "react"
import type { Todo } from "../lib/types"
import * as db from "../lib/db"

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTodos = useCallback(async () => {
    try {
      setError(null)
      const rows = await db.getAllTodos()
      setTodos(rows)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const addTodo = useCallback(
    async (name: string, description: string = "", due_date: string | null = null, recurrence: string | null = null) => {
      const trimmed = name.trim()
      if (!trimmed) return
      try {
        const todo = await db.addTodo(trimmed, description, due_date, recurrence)
        setTodos(prev => [todo, ...prev])
      } catch (e) {
        setError(String(e))
      }
    },
    []
  )

  const toggleTodo = useCallback(async (id: number, completed: boolean) => {
    try {
      const todo = todos.find(t => t.id === id)
      if (completed && todo?.recurrence && todo.due_date) {
        const nextDate = await db.completeRecurringTodo(id, todo.due_date, todo.recurrence)
        setTodos(prev =>
          prev.map(t =>
            t.id === id ? { ...t, due_date: nextDate, updated_at: new Date().toISOString() } : t
          )
        )
      } else {
        await db.toggleTodo(id, completed)
        setTodos(prev =>
          prev.map(t => (t.id === id ? { ...t, completed: completed ? 1 : 0 } : t))
        )
      }
    } catch (e) {
      setError(String(e))
    }
  }, [todos])

  const updateName = useCallback(async (id: number, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    try {
      await db.updateTodoName(id, trimmed)
      setTodos(prev => prev.map(t => (t.id === id ? { ...t, name: trimmed } : t)))
    } catch (e) {
      setError(String(e))
    }
  }, [])

  const updateDescription = useCallback(async (id: number, description: string) => {
    try {
      await db.updateTodoDescription(id, description)
      setTodos(prev => prev.map(t => (t.id === id ? { ...t, description } : t)))
    } catch (e) {
      setError(String(e))
    }
  }, [])

  const updateDueDate = useCallback(async (id: number, due_date: string | null) => {
    try {
      await db.updateTodoDueDate(id, due_date)
      setTodos(prev => prev.map(t => (t.id === id ? { ...t, due_date } : t)))
    } catch (e) {
      setError(String(e))
    }
  }, [])

  const deleteTodo = useCallback(async (id: number) => {
    try {
      await db.deleteTodo(id)
      setTodos(prev => prev.filter(t => t.id !== id))
    } catch (e) {
      setError(String(e))
    }
  }, [])

  const clearCompleted = useCallback(async () => {
    try {
      await db.clearCompleted()
      setTodos(prev => prev.filter(t => !t.completed))
    } catch (e) {
      setError(String(e))
    }
  }, [])

  const reorderTodos = useCallback(async (orderedIds: number[]) => {
    const prevTodos = todos
    const ordered = orderedIds
      .map(id => prevTodos.find(t => t.id === id))
      .filter((t): t is Todo => !!t)
    setTodos(ordered)
    try {
      await db.reorderTodos(orderedIds)
    } catch (e) {
      setTodos(prevTodos)
      setError(String(e))
    }
  }, [todos])

  return {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    updateName,
    updateDescription,
    updateDueDate,
    deleteTodo,
    clearCompleted,
    reorderTodos,
  }
}

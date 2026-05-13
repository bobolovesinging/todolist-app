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

  const addTodo = useCallback(async (title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    try {
      const todo = await db.addTodo(trimmed)
      setTodos(prev => [todo, ...prev])
    } catch (e) {
      setError(String(e))
    }
  }, [])

  const toggleTodo = useCallback(async (id: number, completed: boolean) => {
    try {
      await db.toggleTodo(id, completed)
      setTodos(prev =>
        prev.map(t => (t.id === id ? { ...t, completed: completed ? 1 : 0 } : t))
      )
    } catch (e) {
      setError(String(e))
    }
  }, [])

  const updateTitle = useCallback(async (id: number, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    try {
      await db.updateTodoTitle(id, trimmed)
      setTodos(prev =>
        prev.map(t => (t.id === id ? { ...t, title: trimmed } : t))
      )
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

  return {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    updateTitle,
    deleteTodo,
    clearCompleted,
  }
}

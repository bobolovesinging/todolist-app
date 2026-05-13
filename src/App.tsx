import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { listen } from "@tauri-apps/api/event"
import { invoke } from "@tauri-apps/api/core"
import { useTodos } from "./hooks/useTodos"
import type { Filter } from "./lib/types"
import AddTodo from "./components/AddTodo"
import TodoList from "./components/TodoList"
import FilterBar from "./components/FilterBar"

export default function App() {
  const {
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
  } = useTodos()

  const [filter, setFilter] = useState<Filter>("all")
  const [pinned, setPinned] = useState(false)
  const [focusTrigger, setFocusTrigger] = useState(0)

  const togglePin = useCallback(async () => {
    const next = !pinned
    setPinned(next)
    try {
      await getCurrentWindow().setAlwaysOnTop(next)
    } catch {
      setPinned(!next)
    }
  }, [pinned])

  // Listen for tray "new todo" event
  useEffect(() => {
    const unlisten = listen("tray-new-todo", () => {
      setFocusTrigger(n => n + 1)
    })
    return () => { unlisten.then(fn => fn()) }
  }, [])

  // Update tray badge count
  const activeCount = useMemo(
    () => todos.filter(t => !t.completed).length,
    [todos]
  )
  const completedCount = useMemo(
    () => todos.filter(t => !!t.completed).length,
    [todos]
  )

  const prevCountRef = useRef(activeCount)
  useEffect(() => {
    if (prevCountRef.current !== activeCount) {
      prevCountRef.current = activeCount
      invoke("update_tray_count", { count: activeCount }).catch(() => {})
    }
  }, [activeCount])

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter(t => !t.completed)
      case "completed":
        return todos.filter(t => !!t.completed)
      default:
        return todos
    }
  }, [todos, filter])

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="flex items-center justify-between px-4 pt-3 pb-2" data-tauri-drag-region>
        <h1 className="text-lg font-semibold text-gray-200">Todo List</h1>
        <button
          onClick={togglePin}
          className={`p-1.5 rounded-lg transition-colors
            ${pinned
              ? "bg-blue-600/20 text-blue-400"
              : "text-gray-600 hover:text-gray-400"
            }`}
          title={pinned ? "Unpin from top" : "Always on top"}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
          </svg>
        </button>
      </header>
      <AddTodo onAdd={addTodo} focusTrigger={focusTrigger} />
      <TodoList
        todos={filteredTodos}
        filter={filter}
        loading={loading}
        error={error}
        onToggle={toggleTodo}
        onUpdateName={updateName}
        onUpdateDescription={updateDescription}
        onUpdateDueDate={updateDueDate}
        onDelete={deleteTodo}
        onReorder={reorderTodos}
      />
      <FilterBar
        activeCount={activeCount}
        completedCount={completedCount}
        currentFilter={filter}
        onFilterChange={setFilter}
        onClearCompleted={clearCompleted}
      />
    </div>
  )
}

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { listen } from "@tauri-apps/api/event"
import { invoke } from "@tauri-apps/api/core"
import { useTodos } from "./hooks/useTodos"
import { useSidebar } from "./hooks/useSidebar"
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
  const [focusTrigger, setFocusTrigger] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    pinned,
    togglePin,
    handleMouseEnter,
    handleMouseLeave,
    showSidebar,
  } = useSidebar({ sidebarWidth: 400, tabVisible: 12 })

  // Listen for tray "new todo" event - show sidebar and focus input
  useEffect(() => {
    const unlisten = listen("tray-new-todo", () => {
      showSidebar()
      setFocusTrigger(n => n + 1)
    })
    return () => { unlisten.then(fn => fn()) }
  }, [showSidebar])

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

  const handleReorder = useCallback((filteredOrderedIds: number[]) => {
    if (filter === "all") {
      reorderTodos(filteredOrderedIds)
      return
    }
    const filteredSet = new Set(filteredOrderedIds)
    const fullIds: number[] = []
    let fi = 0
    for (const t of todos) {
      if (filteredSet.has(t.id)) {
        fullIds.push(filteredOrderedIds[fi++])
      } else {
        fullIds.push(t.id)
      }
    }
    reorderTodos(fullIds)
  }, [todos, filter, reorderTodos])

  return (
    <div
      className="h-screen flex flex-col bg-gray-950/70 backdrop-blur-2xl
                 border-l border-white/5 overflow-hidden relative"
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      {/* Handle tab - visible grab point at top-right corner when hidden */}
      <div
        className="absolute left-0 top-4
                   w-[10px] h-10 rounded-r-full
                   bg-gradient-to-r from-blue-400/50 to-blue-500/10
                   hover:from-blue-400/70 hover:to-blue-500/25
                   hover:w-3 transition-all duration-200
                   cursor-pointer z-50"
        onMouseEnter={handleMouseEnter}
        title="Hover to reveal sidebar"
      />

      <header
        className="flex items-center justify-between px-4 pt-3 pb-2"
        data-tauri-drag-region
      >
        <h1 className="text-lg font-semibold text-gray-200">Todo List</h1>
        <button
          onClick={togglePin}
          className={`p-1.5 rounded-lg transition-colors
            ${pinned
              ? "bg-blue-600/20 text-blue-400"
              : "text-gray-500 hover:text-gray-400"
            }`}
          title={pinned ? "Unlock sidebar" : "Lock sidebar open"}
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
        onReorder={handleReorder}
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

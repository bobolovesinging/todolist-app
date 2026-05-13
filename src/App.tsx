import { useState, useMemo } from "react"
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
    updateTitle,
    deleteTodo,
    clearCompleted,
  } = useTodos()

  const [filter, setFilter] = useState<Filter>("all")

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

  const activeCount = useMemo(
    () => todos.filter(t => !t.completed).length,
    [todos]
  )
  const completedCount = useMemo(
    () => todos.filter(t => !!t.completed).length,
    [todos]
  )

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="px-4 pt-4 pb-2" data-tauri-drag-region>
        <h1 className="text-lg font-semibold text-gray-200">Todo List</h1>
      </header>
      <AddTodo onAdd={addTodo} />
      <TodoList
        todos={filteredTodos}
        filter={filter}
        loading={loading}
        error={error}
        onToggle={toggleTodo}
        onUpdate={updateTitle}
        onDelete={deleteTodo}
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

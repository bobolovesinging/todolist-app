import { useState, type DragEvent } from "react"
import type { Todo, Filter } from "../lib/types"
import TodoItem from "./TodoItem"

interface Props {
  todos: Todo[]
  filter: Filter
  loading: boolean
  error: string | null
  onToggle: (id: number, completed: boolean) => void
  onUpdateName: (id: number, name: string) => void
  onUpdateDescription: (id: number, description: string) => void
  onUpdateDueDate: (id: number, due_date: string | null) => void
  onDelete: (id: number) => void
  onReorder: (orderedIds: number[]) => void
}

const emptyMessages: Record<Filter, { title: string; subtitle: string }> = {
  all: { title: "No todos yet", subtitle: "Add one above to get started" },
  active: { title: "No active todos", subtitle: "All done!" },
  completed: { title: "No completed todos", subtitle: "Complete a todo to see it here" },
}

export default function TodoList({
  todos,
  filter,
  loading,
  error,
  onToggle,
  onUpdateName,
  onUpdateDescription,
  onUpdateDueDate,
  onDelete,
  onReorder,
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  function handleDragStart(_e: DragEvent, index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex === null) return
    setDragOverIndex(index)
  }

  function handleDrop(_e: DragEvent, index: number) {
    if (dragIndex === null || dragIndex === index) return
    const ids = todos.map(t => t.id)
    const [moved] = ids.splice(dragIndex, 1)
    const newIndex = dragIndex < index ? index - 1 : index
    ids.splice(newIndex, 0, moved)
    onReorder(ids)
    setDragIndex(null)
    setDragOverIndex(null)
  }

  function handleDragEnd() {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400 text-sm">
        Failed to load: {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Loading...
      </div>
    )
  }

  if (todos.length === 0) {
    const msg = emptyMessages[filter]
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="w-16 h-16 text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <p className="text-gray-500 text-sm font-medium">{msg.title}</p>
        <p className="text-gray-600 text-xs mt-1">{msg.subtitle}</p>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 150px)" }}>
      {todos.map((todo, i) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          index={i}
          onToggle={onToggle}
          onUpdateName={onUpdateName}
          onUpdateDescription={onUpdateDescription}
          onUpdateDueDate={onUpdateDueDate}
          onDelete={onDelete}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          dragOverIndex={dragOverIndex}
        />
      ))}
    </div>
  )
}

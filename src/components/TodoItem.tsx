import { useState, useRef, type KeyboardEvent } from "react"
import type { Todo } from "../lib/types"

interface Props {
  todo: Todo
  onToggle: (id: number, completed: boolean) => void
  onUpdate: (id: number, title: string) => void
  onDelete: (id: number) => void
}

export default function TodoItem({ todo, onToggle, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEditing() {
    setEditing(true)
    setEditTitle(todo.title)
    requestAnimationFrame(() => inputRef.current?.select())
  }

  function commitEdit() {
    if (editTitle.trim() && editTitle !== todo.title) {
      onUpdate(todo.id, editTitle)
    }
    setEditing(false)
  }

  function handleEditKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") commitEdit()
    if (e.key === "Escape") {
      setEditTitle(todo.title)
      setEditing(false)
    }
  }

  function handleItemKeyDown(e: KeyboardEvent) {
    if (e.key === "Delete" || e.key === "Backspace") {
      onDelete(todo.id)
    }
    if (e.key === "Enter") {
      startEditing()
    }
    if (e.key === " ") {
      e.preventDefault()
      onToggle(todo.id, !todo.completed)
    }
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={handleItemKeyDown}
      className={`todo-enter group flex items-center gap-3 px-4 py-3 border-b border-gray-800
                  hover:bg-gray-800/50 transition-colors
                  outline-none focus:bg-gray-800/70 focus:ring-1 focus:ring-blue-500/50
                  ${todo.completed ? "opacity-50" : ""}`}
    >
      <button
        onClick={() => onToggle(todo.id, !todo.completed)}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0
                    flex items-center justify-center transition-colors
                    ${
                      todo.completed
                        ? "border-green-500 bg-green-500"
                        : "border-gray-600 hover:border-green-400"
                    }`}
      >
        {todo.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onKeyDown={handleEditKeyDown}
          onBlur={commitEdit}
          className="flex-1 bg-gray-700 text-gray-100 px-2 py-1 rounded
                     outline-none border border-blue-500"
        />
      ) : (
        <span
          onDoubleClick={startEditing}
          className={`flex-1 text-sm cursor-default select-none
                     ${todo.completed ? "line-through text-gray-500" : "text-gray-200"}`}
        >
          {todo.title}
        </span>
      )}

      <button
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-500
                   hover:text-red-400 transition-all flex-shrink-0"
        title="Delete"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

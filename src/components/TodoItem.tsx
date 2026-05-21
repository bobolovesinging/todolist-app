import { useState, useRef, type KeyboardEvent } from "react"
import type { Todo } from "../lib/types"

interface Props {
  todo: Todo
  index: number
  onToggle: (id: number, completed: boolean) => void
  onUpdateName: (id: number, name: string) => void
  onUpdateDescription: (id: number, description: string) => void
  onUpdateDueDate: (id: number, due_date: string | null) => void
  onDelete: (id: number) => void
  onDragStart: (index: number) => void
  isDragging: boolean
  isDragOver: boolean
  dragActive: boolean
}

function formatRecurrence(recurrence: string): string {
  const [type, n] = recurrence.split(":")
  const count = n ? parseInt(n) : 1
  const labels: Record<string, string> = {
    daily: "Daily", weekly: "Weekly", monthly: "Monthly", yearly: "Yearly",
    days: `Every ${count} day${count > 1 ? "s" : ""}`,
    weeks: `Every ${count} week${count > 1 ? "s" : ""}`,
    months: `Every ${count} month${count > 1 ? "s" : ""}`,
    years: `Every ${count} year${count > 1 ? "s" : ""}`,
  }
  return labels[type] ?? recurrence
}

function formatDueDate(dateStr: string): { text: string; urgent: boolean } {
  const [y, m, d] = dateStr.split("-").map(Number)
  const due = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = due.getTime() - today.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days < 0) return { text: "Overdue", urgent: true }
  if (days === 0) return { text: "Today", urgent: true }
  if (days === 1) return { text: "Tomorrow", urgent: false }
  if (days < 7) return { text: `${days} days`, urgent: false }
  return { text: due.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }), urgent: false }
}

export default function TodoItem({
  todo,
  index,
  onToggle,
  onUpdateName,
  onUpdateDescription,
  onUpdateDueDate,
  onDelete,
  onDragStart,
  isDragging,
  isDragOver,
  dragActive,
}: Props) {
  const [editingName, setEditingName] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [editName, setEditName] = useState(todo.name)
  const [editDesc, setEditDesc] = useState(todo.description)
  const [showDate, setShowDate] = useState(!!todo.due_date)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const descInputRef = useRef<HTMLTextAreaElement>(null)

  function startEditName() {
    setEditingName(true)
    setEditName(todo.name)
    requestAnimationFrame(() => nameInputRef.current?.select())
  }
  function commitName() {
    if (editName.trim() && editName !== todo.name) {
      onUpdateName(todo.id, editName)
    }
    setEditingName(false)
  }

  function startEditDesc() {
    setEditingDesc(true)
    setEditDesc(todo.description)
    requestAnimationFrame(() => descInputRef.current?.focus())
  }
  function commitDesc() {
    if (editDesc !== todo.description) {
      onUpdateDescription(todo.id, editDesc)
    }
    setEditingDesc(false)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (editingName || editingDesc) return
    if (e.key === "Delete" || e.key === "Backspace") {
      onDelete(todo.id)
    }
    if (e.key === "Enter") {
      startEditName()
    }
    if (e.key === " ") {
      e.preventDefault()
      onToggle(todo.id, !todo.completed)
    }
  }

  const dueInfo = todo.due_date ? formatDueDate(todo.due_date) : null

  return (
    <div
      data-todo-index={index}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`todo-enter group flex items-start gap-2 px-3 py-3 border-b border-white/5
                  hover:bg-white/5 transition-colors
                  outline-none focus:bg-white/10 focus:ring-1 focus:ring-blue-500/50
                  ${todo.completed ? "opacity-50" : ""}
                  ${isDragging ? "opacity-30 bg-white/10" : ""}
                  ${isDragOver ? "border-t-2 border-t-blue-400" : ""}
                  ${dragActive ? "cursor-default" : "cursor-default"}`}
    >
      {/* Drag handle */}
      <span
        onMouseDown={(e) => {
          e.preventDefault()
          onDragStart(index)
        }}
        className="mt-0.5 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing
                   opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 select-none"
        title="Drag to reorder"
      >
        <svg className="w-4 h-4 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z" />
        </svg>
      </span>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id, !todo.completed)}
        onMouseDown={(e) => e.stopPropagation()}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5
                    flex items-center justify-center transition-colors
                    ${
                      todo.completed
                        ? "border-green-500 bg-green-500"
                        : "border-white/10 hover:border-green-400"
                    }`}
      >
        {todo.completed && (
          <svg className="w-3 h-3 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {editingName ? (
          <input
            ref={nameInputRef}
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") commitName()
              if (e.key === "Escape") { setEditName(todo.name); setEditingName(false) }
            }}
            onBlur={commitName}
            className="w-full bg-white/15 text-white px-2 py-1 rounded text-sm
                       outline-none border border-blue-500"
          />
        ) : (
          <p
            onDoubleClick={startEditName}
            className={`text-sm truncate select-none
              ${todo.completed ? "line-through text-gray-500" : "text-gray-200 font-medium"}`}
          >
            {todo.name}
          </p>
        )}

        {editingDesc ? (
          <textarea
            ref={descInputRef}
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Escape") { setEditDesc(todo.description); setEditingDesc(false) }
            }}
            onBlur={commitDesc}
            rows={2}
            className="w-full bg-white/15 text-white px-2 py-1 rounded text-xs mt-1
                       outline-none border border-blue-500 resize-none"
          />
        ) : (
          todo.description && (
            <p
              onDoubleClick={startEditDesc}
              className="text-xs text-gray-400 mt-0.5 line-clamp-2 select-none"
            >
              {todo.description}
            </p>
          )
        )}

        {/* Due date, recurrence & add date button */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {todo.due_date && showDate && dueInfo && (
            <span
              onClick={() => {
                const newDate = prompt("Change due date (YYYY-MM-DD):", todo.due_date ?? "")
                if (newDate !== null && newDate.trim()) {
                  onUpdateDueDate(todo.id, newDate.trim())
                }
              }}
              className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer
                ${dueInfo.urgent ? "bg-red-500/20 text-red-400" : "bg-white/10 text-gray-400"}`}
            >
              {dueInfo.text}
            </span>
          )}
          {todo.recurrence && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
              {formatRecurrence(todo.recurrence)}
            </span>
          )}
          {(!todo.due_date || !showDate) && (
            <button
              onClick={() => {
                const newDate = prompt("Set due date (YYYY-MM-DD):", "")
                if (newDate !== null && newDate.trim()) {
                  onUpdateDueDate(todo.id, newDate.trim())
                  setShowDate(true)
                }
              }}
              className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
            >
              + Due date
            </button>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(todo.id)}
        onMouseDown={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 text-gray-500
                   hover:text-red-400 transition-all flex-shrink-0 mt-0.5"
        title="Delete"
      >
        <svg className="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

import { useState, useRef, useEffect, type KeyboardEvent } from "react"

interface Props {
  onAdd: (name: string, description: string, dueDate: string | null) => void
  focusTrigger: number
}

export default function AddTodo({ onAdd, focusTrigger }: Props) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focusTrigger > 0) {
      inputRef.current?.focus()
      setExpanded(true)
    }
  }, [focusTrigger])

  function handleSubmit() {
    if (name.trim()) {
      onAdd(name, description, dueDate || null)
      setName("")
      setDescription("")
      setDueDate("")
      setExpanded(false)
    }
    inputRef.current?.focus()
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === "Escape") {
      setName("")
      setDescription("")
      setDueDate("")
      setExpanded(false)
    }
  }

  return (
    <div className="px-4 py-3 border-b border-gray-700">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
          className="flex-1 bg-gray-800 text-gray-100 placeholder-gray-500
                     px-3 py-2 rounded-lg outline-none text-sm
                     border border-gray-700 focus:border-blue-500
                     transition-colors"
          autoFocus
        />
        <button
          onClick={() => setExpanded(!expanded)}
          className={`px-2 py-2 rounded-lg border transition-colors text-sm
            ${expanded
              ? "bg-gray-700 border-gray-600 text-gray-200"
              : "border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600"
            }`}
          title="More options"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg
                     hover:bg-blue-500 disabled:opacity-40
                     disabled:cursor-not-allowed transition-colors
                     font-medium text-sm"
        >
          Add
        </button>
      </div>

      {expanded && (
        <div className="mt-2 space-y-2 animate-slide-in">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Escape") {
                setDescription("")
                setExpanded(false)
                inputRef.current?.focus()
              }
            }}
            placeholder="Description (optional)"
            rows={2}
            className="w-full bg-gray-800 text-gray-200 placeholder-gray-500
                       px-3 py-2 rounded-lg outline-none text-sm resize-none
                       border border-gray-700 focus:border-blue-500
                       transition-colors"
          />
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full bg-gray-800 text-gray-200 px-3 py-2
                       rounded-lg outline-none text-sm
                       border border-gray-700 focus:border-blue-500
                       transition-colors [color-scheme:dark]"
          />
        </div>
      )}
    </div>
  )
}

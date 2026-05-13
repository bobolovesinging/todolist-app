import { useState, useRef, type KeyboardEvent } from "react"

interface Props {
  onAdd: (title: string) => void
}

export default function AddTodo({ onAdd }: Props) {
  const [title, setTitle] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit() {
    if (title.trim()) {
      onAdd(title)
      setTitle("")
    }
    inputRef.current?.focus()
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") handleSubmit()
    if (e.key === "Escape") setTitle("")
  }

  return (
    <div className="flex gap-2 p-4 border-b border-gray-700">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What needs to be done?"
        className="flex-1 bg-gray-800 text-gray-100 placeholder-gray-500
                   px-3 py-2 rounded-lg outline-none
                   border border-gray-700 focus:border-blue-500
                   transition-colors"
        autoFocus
      />
      <button
        onClick={handleSubmit}
        disabled={!title.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg
                   hover:bg-blue-500 disabled:opacity-40
                   disabled:cursor-not-allowed transition-colors
                   font-medium text-sm"
      >
        Add
      </button>
    </div>
  )
}

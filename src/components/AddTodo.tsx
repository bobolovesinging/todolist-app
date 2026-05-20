import { useState, useRef, useEffect, type KeyboardEvent } from "react"

function computeCountdownDate(n: number, unit: string): string {
  const d = new Date()
  switch (unit) {
    case "days":   d.setDate(d.getDate() + n); break
    case "weeks":  d.setDate(d.getDate() + 7 * n); break
    case "months": d.setMonth(d.getMonth() + n); break
    case "years":  d.setFullYear(d.getFullYear() + n); break
  }
  return d.toISOString().split("T")[0]
}

interface Props {
  onAdd: (name: string, description: string, dueDate: string | null, recurrence: string | null) => void
  focusTrigger: number
}

export default function AddTodo({ onAdd, focusTrigger }: Props) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [dateMode, setDateMode] = useState<"date" | "countdown">("date")
  const [countdownValue, setCountdownValue] = useState(1)
  const [countdownUnit, setCountdownUnit] = useState("days")
  const [recurrence, setRecurrence] = useState("")
  const [customInterval, setCustomInterval] = useState(1)
  const [customUnit, setCustomUnit] = useState("days")
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
      const finalDueDate = dateMode === "countdown"
        ? computeCountdownDate(countdownValue, countdownUnit)
        : dueDate || null
      const recurrenceValue = recurrence === "custom"
        ? `${customUnit}:${customInterval}`
        : recurrence || null
      onAdd(name, description, finalDueDate, recurrenceValue)
      setName("")
      setDescription("")
      setDueDate("")
      setDateMode("date")
      setCountdownValue(1)
      setCountdownUnit("days")
      setRecurrence("")
      setCustomInterval(1)
      setCustomUnit("days")
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
      setDateMode("date")
      setCountdownValue(1)
      setCountdownUnit("days")
      setRecurrence("")
      setCustomInterval(1)
      setCustomUnit("days")
      setExpanded(false)
    }
  }

  return (
    <div className="px-4 py-3 border-b border-white/10">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
          className="flex-1 bg-[#1d1d24] text-gray-100 placeholder-gray-500
                     px-3 py-2 rounded-lg outline-none text-sm
                     border border-gray-700/60 hover:border-gray-600/60 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20
                     transition-colors"
          autoFocus
        />
        <button
          onClick={() => setExpanded(!expanded)}
          className={`px-2 py-2 rounded-lg border transition-colors text-sm
            ${expanded
              ? "bg-white/10 border-white/15 text-white"
              : "border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/15"
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
                setDateMode("date")
                setCountdownValue(1)
                setCountdownUnit("days")
                setRecurrence("")
                setCustomInterval(1)
                setCustomUnit("days")
                setExpanded(false)
                inputRef.current?.focus()
              }
            }}
            placeholder="Description (optional)"
            rows={2}
            className="w-full bg-[#1d1d24] text-gray-100 placeholder-gray-500
                       px-3 py-2 rounded-lg outline-none text-sm resize-none
                       border border-gray-700/60 hover:border-gray-600/60 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20
                       transition-colors"
          />
          <select
            value={recurrence}
            onChange={e => setRecurrence(e.target.value)}
            className="w-full bg-[#1d1d24] text-gray-100 px-3 py-2
                       rounded-lg outline-none text-sm
                       border border-gray-700/60 hover:border-gray-600/60 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20
                       transition-colors"
          >
            <option value="">No repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom...</option>
          </select>

          {recurrence === "custom" && (
            <div className="flex gap-2">
              <span className="text-sm text-gray-400 self-center">Every</span>
              <input
                type="number"
                min={1}
                max={99}
                value={customInterval}
                onChange={e => setCustomInterval(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 bg-[#1d1d24] text-gray-100 px-2 py-2
                           rounded-lg outline-none text-sm text-center
                           border border-gray-700/60 hover:border-gray-600/60 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20
                           transition-colors"
              />
              <select
                value={customUnit}
                onChange={e => setCustomUnit(e.target.value)}
                className="flex-1 bg-[#1d1d24] text-gray-100 px-3 py-2
                           rounded-lg outline-none text-sm
                           border border-gray-700/60 hover:border-gray-600/60 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20
                           transition-colors"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          )}

          <div className="flex gap-1">
            <button
              onClick={() => setDateMode("date")}
              className={`flex-1 py-1.5 rounded-lg text-xs transition-colors
                ${dateMode === "date"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-gray-500 hover:text-gray-400 border border-transparent"}`}
            >
              Date
            </button>
            <button
              onClick={() => setDateMode("countdown")}
              className={`flex-1 py-1.5 rounded-lg text-xs transition-colors
                ${dateMode === "countdown"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-gray-500 hover:text-gray-400 border border-transparent"}`}
            >
              Countdown
            </button>
          </div>

          {dateMode === "date" ? (
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full bg-[#1d1d24] text-gray-100 px-3 py-2
                         rounded-lg outline-none text-sm
                         border border-gray-700/60 hover:border-gray-600/60 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20
                         transition-colors"
            />
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={999}
                value={countdownValue}
                onChange={e => setCountdownValue(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 bg-[#1d1d24] text-gray-100 px-2 py-2
                           rounded-lg outline-none text-sm text-center
                           border border-gray-700/60 hover:border-gray-600/60 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20
                           transition-colors"
              />
              <select
                value={countdownUnit}
                onChange={e => setCountdownUnit(e.target.value)}
                className="flex-1 bg-[#1d1d24] text-gray-100 px-3 py-2
                           rounded-lg outline-none text-sm
                           border border-gray-700/60 hover:border-gray-600/60 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20
                           transition-colors"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

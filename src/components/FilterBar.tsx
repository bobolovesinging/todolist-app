import type { Filter } from "../lib/types"

interface Props {
  activeCount: number
  completedCount: number
  currentFilter: Filter
  onFilterChange: (filter: Filter) => void
  onClearCompleted: () => void
}

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
]

export default function FilterBar({
  activeCount,
  completedCount,
  currentFilter,
  onFilterChange,
  onClearCompleted,
}: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700 text-xs">
      <span className="text-gray-500 w-20">
        {activeCount} item{activeCount !== 1 ? "s" : ""} left
      </span>

      <div className="flex gap-1">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`px-2 py-1 rounded transition-colors
              ${
                currentFilter === f.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {completedCount > 0 ? (
        <button
          onClick={onClearCompleted}
          className="text-gray-500 hover:text-red-400 transition-colors w-20 text-right"
        >
          Clear completed
        </button>
      ) : (
        <span className="w-20" />
      )}
    </div>
  )
}

import type { Todo, Filter } from "../lib/types"
import TodoItem from "./TodoItem"

interface Props {
  todos: Todo[]
  filter: Filter
  loading: boolean
  error: string | null
  onToggle: (id: number, completed: boolean) => void
  onUpdate: (id: number, title: string) => void
  onDelete: (id: number) => void
}

const emptyMessages: Record<Filter, { title: string; subtitle: string }> = {
  all: { title: "No todos yet", subtitle: "Add one above to get started" },
  active: { title: "No active todos", subtitle: "All done!" },
  completed: { title: "No completed todos", subtitle: "Complete a todo to see it here" },
}

export default function TodoList({ todos, filter, loading, error, onToggle, onUpdate, onDelete }: Props) {
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
    <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 130px)" }}>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

# CLAUDE.md - Todo List App

## Project Overview

A lightweight desktop todo list application built with Tauri v2 + React + TypeScript + Tailwind CSS. Data is persisted locally via SQLite (tauri-plugin-sql), no cloud dependencies.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | Tauri v2 (Rust backend) |
| UI Framework | React 18 + TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Build | Vite 5 |
| Database | SQLite via `@tauri-apps/plugin-sql` |
| Package Manager | npm |

## Project Structure

```
todolist-app/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Database & utility functions
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Tailwind imports + global styles
├── src-tauri/              # Tauri (Rust) backend
│   ├── src/
│   │   ├── main.rs         # Rust entry point
│   │   └── lib.rs          # Plugin registration
│   ├── capabilities/       # Permission declarations
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri window & build config
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Architecture Decisions

1. **Local-first, SQLite storage** — All data stored in `todolist.db` via `tauri-plugin-sql`. No network requests, no cloud sync. The database file lives alongside the executable.
2. **Functional components only** — All React components are function components. No class components.
3. **Hooks for state** — Business logic extracted into custom hooks under `src/hooks/`. Components stay thin.
4. **TypeScript strict mode** — `strict: true` in tsconfig. All props, state, and DB queries are typed.
5. **SQL queries in `src/lib/db.ts`** — Database access is centralized in a single module, not scattered across components.
6. **Dark theme by default** — App starts with a dark gray background. Lightweight, widget-like feel.
7. **Window size: 420×640** — Compact, portrait-oriented window suitable for a desktop sidebar widget.

## Code Conventions

- **Components**: `export default function ComponentName()` — PascalCase, default exports.
- **Hooks**: `export function useHookName()` — camelCase, named exports, prefixed with `use`.
- **Types/interfaces**: PascalCase, defined in the file where they're used unless shared.
- **No semi-colons** in TypeScript/JavaScript.
- **Single quotes** for strings.
- **Tailwind classes**: Use utility classes directly in JSX. No `@apply` in CSS unless absolutely necessary.
- **File naming**: `kebab-case` for files, `PascalCase` for component file names matching the component.

## Database Schema

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  completed INTEGER NOT NULL DEFAULT 0,
  due_date TEXT,
  sort_order REAL NOT NULL DEFAULT 0,
  recurrence TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

Migrations are handled incrementally in `src/lib/db.ts` — old columns (`title` → `name`) are renamed, missing columns are added via `ALTER TABLE ADD COLUMN`.

## Development Commands

```bash
npm install            # Install frontend dependencies
npm run dev            # Start Vite dev server (port 1420)
npx tauri dev          # Start Tauri dev mode (with hot reload)
npx tauri build        # Production build
npx tsc --noEmit       # TypeScript type check
```

## Development Plan

### Phase 1: Core CRUD
- [ ] Initialize SQLite database and create `todos` table
- [ ] Display todo list from database
- [ ] Add new todo items
- [ ] Toggle todo completion (checkbox)
- [ ] Edit todo title (inline or modal)
- [ ] Delete todo items

### Phase 2: Polish
- [ ] Keyboard shortcuts (Enter to add, Escape to cancel)
- [ ] Focus management & tab order
- [ ] Empty state UI
- [ ] Filter tabs (All / Active / Completed)
- [ ] Counter ("3 items left")
- [ ] Clear completed button

### Phase 3: Advanced
- [ ] Due dates with date picker
- [ ] Priority levels (drag to reorder)
- [ ] System tray integration
- [ ] Auto-start with OS
- [ ] Window always-on-top toggle

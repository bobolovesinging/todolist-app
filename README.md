# TodoList App

A lightweight desktop todo list application built with **Tauri v2** + **React** + **TypeScript** + **Tailwind CSS**. Data is persisted locally via **SQLite**, no cloud dependencies.

## Download

[Download Latest Release](https://github.com/bobolovesinging/todolist-app/releases/latest) — double-click to install, no dev environment required. Windows 10+ only.

## Features

- Create, edit, delete, and reorder tasks
- Due dates with date picker
- Drag-to-reorder priority
- Filter by All / Active / Completed
- Sidebar navigation
- System tray integration
- Dark theme by default

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | Tauri v2 (Rust) |
| UI | React 18 + TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Build | Vite 5 |
| Database | SQLite via `tauri-plugin-sql` |

## Development

```bash
npm install              # Install dependencies
npm run dev              # Start Vite dev server (port 1420)
npx tauri dev            # Start Tauri dev mode with hot reload
npx tauri build          # Production build
npx tsc --noEmit         # Type check
```

## Project Structure

```
src/                  # React frontend
  components/         # UI components
  hooks/              # Custom React hooks
  lib/                # Database & utility functions
  App.tsx             # Root component
src-tauri/            # Tauri (Rust) backend
  src/
  capabilities/       # Permission declarations
```

## License

MIT

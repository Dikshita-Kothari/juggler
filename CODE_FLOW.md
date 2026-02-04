# Juggler - Project Code Flow & Architecture

This document provides a comprehensive overview of the **Juggler** project architecture, its core code flow, and the technical features used in its implementation.

## 1. Project Overview
Juggler is a modern project management application designed for high productivity. It supports multiple views (Board, List, Calendar, Priority, Timeline) and features robust task management including subtasks and activity history.

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API

---

## 2. Core Architecture & State Management

### `AppContext.tsx` (The Engine)
The application uses a "Single Source of Truth" pattern via the React Context API.
- **Provider**: `AppProvider` wraps the entire application in `app/layout.tsx`.
- **State**: Manages all projects, tasks, comments, users, and global UI states (modals, toasts, dark mode).
- **Actions**: Centralized functions like `addTask`, `updateTask`, and `deleteTask` handle state transitions and side effects (like logging history).

### `useApp` Hook
Components interact with the global state using the `useApp` custom hook, ensuring a clean and consistent API across the codebase.

---

## 3. Data Flow & Routing

### Root Layout (`app/layout.tsx`)
Sets up the global environment:
1. Wraps the app in `AppProvider`.
2. Includes the `Sidebar` and global Modals (`ProjectModal`, `ProfileModal`).
3. Handles global UI elements like `Toasts`.

### Dashboard (`app/page.tsx`)
The entry point of the app:
- Fetches project summaries from `AppContext`.
- Calculates stats (Total Projects, Pending Tasks, etc.) on the fly.
- Renders project cards with real-time progress bars.

### Project View (`app/projects/[projectId]/page.tsx`)
A dynamic route that serves as the workspace for a specific project:
- Uses `useParams` to identify the active project.
- Implements a **View Switcher** to toggle between different visualization modes.
- Filters tasks based on search queries, priority, and subtask visibility settings.

---

## 4. Key Component Deep Dive

### `KanbanView` (Board Mode)
- **Purpose**: Visualizes tasks as cards in columns (`TODO`, `IN_PROGRESS`, `DONE`).
- **Features**: 
    - **Native Drag & Drop**: Uses HTML5 Drag and Drop API for status updates.
    - **Subtask Feedback**: Indicators show completion progress on parent cards.
    - **Quick Actions**: Inline archiving and assignee display.

### `ListView` (Table Mode)
- **Purpose**: Provides a high-density, structured view of all tasks.
- **Features**:
    - **Task Hierarchy**: Uses `useMemo` to flatten the task tree while maintaining visual nesting for subtasks.
    - **Sortable Metadata**: Displays status badges, priority dots, and deadlines.

### `TimelineView` (Planner Mode)
- **Purpose**: A sophisticated scheduling tool using a "Backlog-to-Planner" workflow.
- **Features**:
    - **Inbox/Backlog**: A sidebar for unscheduled tasks.
    - **Scalable Grid**: Supports Day, Week, and Month views.
    - **Scheduling**: Dragging tasks from the Inbox onto the grid auto-assigns the corresponding date.

### `TaskModal` (Detail View)
- **Purpose**: The central interface for editing a specific task.
- **Features**:
    - **Dual-Pane Layout**: Main content (Title, Desc, Subtasks) on the left; Metadata (Status, Priority, Date) on the right.
    - **Activity Feed**: Real-time comments with user avatars.
    - **Subtask Management**: Inline creation and completion of subtasks.

---

## 5. Coding Features & Best Practices

1. **TypeScript Type Safety**: 
    - Interfaces defined in `types/index.ts` ensure data consistency for `Task`, `Project`, and `User` objects across the app.
2. **Dynamic UI States**:
    - Uses conditional rendering and Tailwind's `transition` utilities for smooth view switching and dark mode support.
3. **Optimized Rendering**:
    - Utilizes `useMemo` for heavy task filtering and tree flattening to ensure high performance even with large datasets.
    - Implements `useEffect` for synchronized side effects like body-class dark mode toggling.
4. **Accessible Components**:
    - Semantic HTML5 structure (main, aside, nav, table).
    - Descriptive ARIA-like attributes and hover/focus states for all interactive buttons.
5. **Animation**:
    - Uses Tailwind's `animate-in` utilities for modal entries and toast notifications.

---

## 6. How to Add a New Feature
1. **Define Types**: Update `types/index.ts` if adding data structures.
2. **Context Extension**: Add necessary state and actions in `AppContext.tsx`.
3. **Component Creation**: Build the UI in `components/`.
4. **Integration**: Connect to the context via `useApp` and update the relevant page or layout.

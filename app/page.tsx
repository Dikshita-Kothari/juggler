/* eslint-disable react-hooks/purity */
'use client'
import {
  ArrowUpCircle,
  Bell,
  Calendar,
  CalendarRange,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  CornerDownRight,
  Eye,
  EyeOff,
  Filter,
  FolderKanban,
  LayoutDashboard,
  LayoutGrid,
  List,
  MessageSquare,
  Moon,
  Pencil,
  Plus,
  Search,
  Settings,
  Sun,
  Trash2,
  X
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

// --- TYPES ---

type Role = 'OWNER' | 'MEMBER';
type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
type ViewMode = 'BOARD' | 'LIST' | 'CALENDAR' | 'PRIORITY';

interface User {
  u_id: number;
  name: string;
  username: string;
  email: string;
  avatar_color: string;
}

interface Project {
  p_id: number;
  u_id: number; // Creator
  name: string;
  description: string;
  deadline: string;
  created_at: string;
  is_deleted: boolean;
}

interface ProjectMember {
  p_id: number;
  u_id: number;
  role: Role;
}

interface Task {
  t_id: number;
  p_id: number;
  parent_task_id: number | null;
  name: string;
  description: string;
  position: number;
  status: TaskStatus;
  priority: Priority;
  to_do_date: string;
  deadline: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

interface TaskComment {
  comment_id: number;
  t_id: number;
  u_id: number;
  comment_text: string;
  created_at: string;
}

interface TaskHistory {
  history_id: number;
  t_id: number;
  changed_by: number;
  action_type: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// --- MOCK DATA SEEDS ---

const SEED_USERS: User[] = [
  { u_id: 1, name: "Alex Admin", username: "alex", email: "alex@juggler.app", avatar_color: "bg-blue-500" },
  { u_id: 2, name: "Sarah Dev", username: "sarah", email: "sarah@juggler.app", avatar_color: "bg-emerald-500" },
  { u_id: 3, name: "Mike Manager", username: "mike", email: "mike@juggler.app", avatar_color: "bg-purple-500" },
  { u_id: 4, name: "Emily Design", username: "emily", email: "emily@juggler.app", avatar_color: "bg-pink-500" },
];

const SEED_PROJECTS: Project[] = [
  { p_id: 1, u_id: 1, name: "Juggler App V1", description: "Launch the MVP of the new todo app.", deadline: "2024-03-15", created_at: "2024-01-01", is_deleted: false },
  { p_id: 2, u_id: 1, name: "Marketing Q1", description: "Social media and ad campaigns.", deadline: "2024-04-01", created_at: "2024-01-05", is_deleted: false },
];

const SEED_MEMBERS: ProjectMember[] = [
  { p_id: 1, u_id: 1, role: 'OWNER' },
  { p_id: 1, u_id: 2, role: 'MEMBER' },
  { p_id: 2, u_id: 1, role: 'OWNER' },
];

const SEED_TASKS: Task[] = [
  { t_id: 1, p_id: 1, parent_task_id: null, name: "Design Database Schema", description: "Create SQL tables for users, projects, and tasks.", position: 1, status: "DONE", priority: "HIGH", to_do_date: "2024-01-10", deadline: "2024-01-12", created_at: "2024-01-10", updated_at: "2024-01-11", is_deleted: false },
  { t_id: 2, p_id: 1, parent_task_id: null, name: "Frontend Setup", description: "Initialize Next.js and Tailwind.", position: 2, status: "IN_PROGRESS", priority: "MEDIUM", to_do_date: "2024-01-15", deadline: "2024-01-20", created_at: "2024-01-12", updated_at: "2024-01-13", is_deleted: false },
  { t_id: 3, p_id: 1, parent_task_id: null, name: "API Routes", description: "Implement CRUD endpoints.", position: 3, status: "TODO", priority: "HIGH", to_do_date: "2024-01-20", deadline: "2024-01-25", created_at: "2024-01-15", updated_at: "2024-01-15", is_deleted: false },
  { t_id: 4, p_id: 2, parent_task_id: null, name: "Draft Ad Copy", description: "Write copy for Instagram ads.", position: 1, status: "TODO", priority: "LOW", to_do_date: "2024-02-01", deadline: "2024-02-05", created_at: "2024-01-20", updated_at: "2024-01-20", is_deleted: false },
  // Subtask example
  { t_id: 5, p_id: 1, parent_task_id: 2, name: "Install Shadcn UI", description: "Add button and card components", position: 1, status: "DONE", priority: "LOW", to_do_date: "2024-01-15", deadline: "2024-01-15", created_at: "2024-01-13", updated_at: "2024-01-13", is_deleted: false },
];

const SEED_COMMENTS: TaskComment[] = [
  { comment_id: 1, t_id: 2, u_id: 2, comment_text: "I'll handle the Tailwind config.", created_at: "2024-01-13 10:00:00" }
];

const SEED_HISTORY: TaskHistory[] = [
  { history_id: 1, t_id: 1, changed_by: 1, action_type: "STATUS_CHANGE", old_value: "IN_PROGRESS", new_value: "DONE", created_at: "2024-01-11 14:30:00" }
];

// --- APP COMPONENT ---

export default function App() {
  // --- "DATABASE" STATE ---
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [currentUser, setCurrentUser] = useState<User>(SEED_USERS[0]);
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [members, setMembers] = useState<ProjectMember[]>(SEED_MEMBERS);
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [comments, setComments] = useState<TaskComment[]>(SEED_COMMENTS);
  const [history, setHistory] = useState<TaskHistory[]>(SEED_HISTORY);

  // --- UI STATE ---
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'PROJECT'>('DASHBOARD');
  const [viewMode, setViewMode] = useState<ViewMode>('BOARD');
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date()); // New Calendar State

  // Modals & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);

  // Subtask UI State
  const [newSubtaskName, setNewSubtaskName] = useState("");

  // --- EFFECT: DARK MODE ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- HELPERS ---
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const logHistory = (t_id: number, action: string, oldVal: string | null, newVal: string | null) => {
    const h_id = Math.max(0, ...history.map(h => h.history_id)) + 1;
    setHistory(prev => [...prev, {
      history_id: h_id,
      t_id,
      changed_by: currentUser.u_id,
      action_type: action,
      old_value: oldVal,
      new_value: newVal,
      created_at: new Date().toLocaleString()
    }]);
  };

  // --- ACTIONS: USER ---
  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    setUsers(users.map(u => u.u_id === currentUser.u_id ? { ...u, name, email } : u));
    setCurrentUser(prev => ({ ...prev, name, email }));
    setIsProfileModalOpen(false);
    showToast("Profile updated successfully");
  };

  // --- ACTIONS: PROJECTS ---

  const handleSaveProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const desc = formData.get("description") as string;
    const deadline = formData.get("deadline") as string;

    if (editingProject) {
      setProjects(projects.map(p => p.p_id === editingProject.p_id ? { ...p, name, description: desc, deadline } : p));
      showToast("Project updated");
    } else {
      const newPid = Math.max(0, ...projects.map(p => p.p_id)) + 1;
      const newProject: Project = {
        p_id: newPid,
        u_id: currentUser.u_id,
        name,
        description: desc,
        deadline,
        created_at: new Date().toISOString(),
        is_deleted: false
      };
      setProjects([...projects, newProject]);
      setMembers([...members, { p_id: newPid, u_id: currentUser.u_id, role: 'OWNER' }]);
      showToast("Project created successfully");
    }
    setIsProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (p_id: number) => {
    if (confirm("Are you sure you want to archive this project?")) {
      setProjects(projects.map(p => p.p_id === p_id ? { ...p, is_deleted: true } : p));
      if (activeProjectId === p_id) setActiveView('DASHBOARD');
      showToast("Project archived", "info");
    }
  };

  const handleToggleMember = (u_id: number) => {
    if (!activeProjectId) return;
    const existing = members.find(m => m.p_id === activeProjectId && m.u_id === u_id);
    if (existing) {
      setMembers(members.filter(m => !(m.p_id === activeProjectId && m.u_id === u_id)));
    } else {
      setMembers([...members, { p_id: activeProjectId, u_id, role: 'MEMBER' }]);
    }
  };

  // --- ACTIONS: TASKS ---

  const handleCreateTask = (newTask: Partial<Task>) => {
    const t_id = Math.max(0, ...tasks.map(t => t.t_id)) + 1;
    const task: Task = {
      t_id,
      p_id: activeProjectId!,
      parent_task_id: newTask.parent_task_id || null,
      name: newTask.name || "New Task",
      description: newTask.description || "",
      position: tasks.length + 1,
      status: 'TODO',
      priority: newTask.priority || 'MEDIUM',
      to_do_date: new Date().toISOString().split('T')[0],
      deadline: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
      ...newTask
    };
    setTasks([...tasks, task]);
    logHistory(t_id, "CREATED", null, task.name);
    if (!newTask.parent_task_id) showToast("Task created");
  };

  const handleUpdateTask = (t_id: number, updates: Partial<Task>) => {
    const oldTask = tasks.find(t => t.t_id === t_id);
    if (!oldTask) return;

    setTasks(tasks.map(t => t.t_id === t_id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));

    if (updates.status && updates.status !== oldTask.status) {
      logHistory(t_id, "STATUS_CHANGE", oldTask.status, updates.status);
    }
    if (updates.priority && updates.priority !== oldTask.priority) {
      logHistory(t_id, "PRIORITY_CHANGE", oldTask.priority, updates.priority);
    }

    if (selectedTask?.t_id === t_id) {
      setSelectedTask(prev => prev ? ({ ...prev, ...updates }) : null);
    }
  };

  const handleDeleteTask = (t_id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      // CASCADE DELETE: Delete subtasks as well
      setTasks(tasks.map(t => (t.t_id === t_id || t.parent_task_id === t_id) ? { ...t, is_deleted: true } : t));
      setIsTaskModalOpen(false);
      showToast("Task archived", "info");
    }
  };

  const handleAddComment = (t_id: number, text: string) => {
    const c_id = Math.max(0, ...comments.map(c => c.comment_id)) + 1;
    setComments([...comments, {
      comment_id: c_id,
      t_id,
      u_id: currentUser.u_id,
      comment_text: text,
      created_at: new Date().toLocaleString()
    }]);
  };

  // --- CALENDAR HELPERS ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    return { days, firstDay, month, year };
  };

  const changeMonth = (delta: number) => {
    setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta)));
  };

  // --- VIEW HELPERS ---

  const navigateToProject = (pId: number) => {
    setActiveProjectId(pId);
    setActiveView('PROJECT');
    setSearchQuery(""); // Reset search
    setPriorityFilter('ALL'); // Reset filter
  };

  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    setNewSubtaskName("");
    setIsTaskModalOpen(true);
  };

  // Filter Logic
  const activeProject = projects.find(p => p.p_id === activeProjectId);
  const activeMembers = members.filter(m => m.p_id === activeProjectId).map(m => users.find(u => u.u_id === m.u_id)!);

  const projectTasks = tasks.filter(t =>
    t.p_id === activeProjectId &&
    !t.is_deleted &&
    (showSubtasks || viewMode === 'CALENDAR' ? true : t.parent_task_id === null) && // Show subtasks always in Calendar to be visible deadlines
    (priorityFilter === 'ALL' || t.priority === priorityFilter) &&
    (t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.priority.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Grouping Logic for List View to ensure Subtasks follow parents
  const listTasks = useMemo(() => {
    if (viewMode !== 'LIST') return projectTasks;

    const taskMap = new Map(projectTasks.map(t => [t.t_id, t]));

    // Identify roots
    const roots = projectTasks.filter(t => !t.parent_task_id || !taskMap.has(t.parent_task_id));

    // Group children
    const childrenMap = new Map<number, Task[]>();
    projectTasks.forEach(t => {
      if (t.parent_task_id && taskMap.has(t.parent_task_id)) {
        const siblings = childrenMap.get(t.parent_task_id) || [];
        siblings.push(t);
        childrenMap.set(t.parent_task_id, siblings);
      }
    });

    const flattened: Task[] = [];
    roots.forEach(root => {
      flattened.push(root);
      const kids = childrenMap.get(root.t_id);
      if (kids) {
        flattened.push(...kids);
      }
    });
    return flattened;
  }, [projectTasks, viewMode]);

  return (
    <div className={`flex h-screen w-full bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200`}>

      {/* TOASTS CONTAINER */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`bg-white dark:bg-slate-800 shadow-lg border-l-4 p-4 rounded-r-md animate-in slide-in-from-right-full fade-in flex items-center gap-3 min-w-[300px] pointer-events-auto
            ${t.type === 'success' ? 'border-green-500' : t.type === 'error' ? 'border-red-500' : 'border-blue-500'}`}>
            <Bell size={18} className={`${t.type === 'success' ? 'text-green-500' : t.type === 'error' ? 'text-red-500' : 'text-blue-500'}`} />
            <span className="text-sm font-medium">{t.message}</span>
          </div>
        ))}
      </div>

      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
            J
          </div>
          <span className="text-xl font-bold tracking-tight">Juggler</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeView === 'DASHBOARD'}
            onClick={() => setActiveView('DASHBOARD')}
          />
          <div className="pt-4 pb-2 flex justify-between items-center px-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Projects</p>
            <button
              onClick={() => { setEditingProject(null); setIsProjectModalOpen(true); }}
              className="text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          {projects.filter(p => !p.is_deleted).map(p => (
            <NavItem
              key={p.p_id}
              icon={<FolderKanban size={20} />}
              label={p.name}
              active={activeView === 'PROJECT' && activeProjectId === p.p_id}
              onClick={() => navigateToProject(p.p_id)}
            />
          ))}
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Settings</p>
          </div>
          <NavItem icon={<Settings size={20} />} label="Preferences" onClick={() => { }} />
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center justify-center w-full gap-2 p-2 rounded-md bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors mb-3 text-sm font-medium"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 rounded p-1 transition-colors"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${currentUser.avatar_color}`}>
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">@{currentUser.username}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* VIEW: DASHBOARD */}
        {activeView === 'DASHBOARD' && (
          <div className="flex-1 overflow-auto p-8">
            <header className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser.name} 👋</h1>
              <p className="text-gray-500 dark:text-slate-400">Here's what's happening in your workspace today.</p>
            </header>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <StatCard title="Total Projects" value={projects.filter(p => !p.is_deleted).length} icon={<FolderKanban className="text-blue-600" />} />
              <StatCard title="Pending Tasks" value={tasks.filter(t => t.status !== 'DONE' && !t.is_deleted).length} icon={<CheckSquare className="text-orange-600" />} />
              <StatCard title="Due Soon" value={tasks.filter(t => !t.is_deleted && t.status !== 'DONE').length} icon={<Clock className="text-red-600" />} />
              <StatCard title="Completed" value={tasks.filter(t => t.status === 'DONE' && !t.is_deleted).length} icon={<CheckSquare className="text-green-600" />} />
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FolderKanban size={24} className="text-blue-600" />
                Your Projects
              </h2>
              <button
                onClick={() => { setEditingProject(null); setIsProjectModalOpen(true); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                + New Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.filter(p => !p.is_deleted).map(p => {
                const pTasks = tasks.filter(t => t.p_id === p.p_id && !t.is_deleted);
                const progress = pTasks.length ? Math.round((pTasks.filter(t => t.status === 'DONE').length / pTasks.length) * 100) : 0;

                return (
                  <div
                    key={p.p_id}
                    onClick={() => navigateToProject(p.p_id)}
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 hover:shadow-lg dark:hover:shadow-blue-900/10 transition-all cursor-pointer group relative"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <FolderKanban size={20} />
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded text-gray-600 dark:text-slate-400">OWNER</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{p.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 line-clamp-2 h-10">{p.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-slate-400">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div
                className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors min-h-[220px]"
                onClick={() => { setEditingProject(null); setIsProjectModalOpen(true); }}
              >
                <Plus size={32} className="mb-2" />
                <span className="font-medium">Create New Project</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PROJECT DETAILS */}
        {activeView === 'PROJECT' && activeProject && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">{activeProject.name}</h2>
                <button
                  onClick={() => setIsProjectSettingsOpen(true)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  title="Project Settings"
                >
                  <Settings size={18} />
                </button>
                <div className="h-4 w-[1px] bg-gray-300 dark:bg-slate-700 mx-2"></div>
                {/* VIEW TOGGLE */}
                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('BOARD')}
                    className={`p-1.5 rounded transition-all ${viewMode === 'BOARD' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
                    title="Board View"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('LIST')}
                    className={`p-1.5 rounded transition-all ${viewMode === 'LIST' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
                    title="List View"
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('CALENDAR')}
                    className={`p-1.5 rounded transition-all ${viewMode === 'CALENDAR' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
                    title="Calendar View"
                  >
                    <CalendarRange size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('PRIORITY')}
                    className={`p-1.5 rounded transition-all ${viewMode === 'PRIORITY' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
                    title="Priority Board"
                  >
                    <ArrowUpCircle size={16} />
                  </button>
                </div>

                {/* SUBTASK TOGGLE */}
                <button
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showSubtasks
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  title={showSubtasks ? "Hide Subtasks" : "Show Subtasks"}
                >
                  {showSubtasks ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>

              {/* FILTER BAR */}
              <div className="flex items-center gap-3">
                {viewMode !== 'PRIORITY' && (
                  <div className="relative group">
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as any)}
                      className="appearance-none bg-gray-100 dark:bg-slate-800 border-none rounded-md py-1.5 pl-3 pr-8 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                      <option value="ALL">All Priorities</option>
                      <option value="HIGH">High Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="LOW">Low Priority</option>
                    </select>
                    <Filter className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  </div>
                )}

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="pl-9 pr-4 py-1.5 text-sm bg-gray-100 dark:bg-slate-800 border-none rounded-md focus:ring-2 focus:ring-blue-500 outline-none w-64"
                  />
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => handleCreateTask({ name: "New Task" })}
                >
                  <Plus size={16} /> Add Task
                </button>
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-950">

              {/* BOARD VIEW */}
              {viewMode === 'BOARD' && (
                <div className="h-full overflow-x-auto overflow-y-hidden p-6">
                  <div className="flex h-full gap-6">
                    {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
                      <KanbanColumn
                        key={status}
                        title={status === 'TODO' ? 'To Do' : status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                        status={status}
                        tasks={projectTasks.filter(t => t.status === status)}
                        allTasks={tasks}
                        onTaskClick={openTaskModal}
                        onDrop={(id) => handleUpdateTask(id, { status: status as TaskStatus })}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* PRIORITY BOARD VIEW */}
              {viewMode === 'PRIORITY' && (
                <div className="h-full overflow-x-auto overflow-y-hidden p-6">
                  <div className="flex h-full gap-6">
                    {['HIGH', 'MEDIUM', 'LOW'].map(prio => (
                      <KanbanColumn
                        key={prio}
                        title={`${prio} Priority`}
                        status={prio}
                        tasks={projectTasks.filter(t => t.priority === prio)}
                        allTasks={tasks}
                        onTaskClick={openTaskModal}
                        onDrop={(id) => handleUpdateTask(id, { priority: prio as Priority })}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* LIST VIEW */}
              {viewMode === 'LIST' && (
                <div className="p-6">
                  <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                          <th className="p-4 pl-6">Task Name</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Priority</th>
                          <th className="p-4">Deadline</th>
                          <th className="p-4">Assignee</th>
                          <th className="p-4 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {listTasks.map(task => {
                          const subtasks = tasks.filter(t => t.parent_task_id === task.t_id && !t.is_deleted);
                          const completedSub = subtasks.filter(t => t.status === 'DONE').length;
                          const isSubtask = !!task.parent_task_id;
                          const parentVisible = isSubtask && listTasks.some(t => t.t_id === task.parent_task_id);

                          return (
                            <tr
                              key={task.t_id}
                              onClick={() => openTaskModal(task)}
                              className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group ${parentVisible ? 'bg-gray-50/50 dark:bg-slate-900/50' : ''}`}
                            >
                              <td className="p-4 pl-6">
                                <div className={`flex items-center gap-2 ${parentVisible ? 'pl-8 border-l-2 border-gray-100 dark:border-slate-800' : ''}`}>
                                  {isSubtask && <CornerDownRight size={14} className="text-gray-400" />}
                                  <div>
                                    <div className={`font-medium text-sm ${isSubtask ? 'text-gray-600 dark:text-slate-300' : 'text-gray-900 dark:text-slate-100'}`}>
                                      {task.name}
                                    </div>
                                    {subtasks.length > 0 && (
                                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <CheckSquare size={12} /> {completedSub}/{subtasks.length} subtasks
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                        ${task.status === 'TODO' ? 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300' :
                                    task.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-900 dark:text-blue-300' :
                                      'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-900 dark:text-green-300'}`}>
                                  {task.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${task.priority === 'HIGH' ? 'bg-red-500' :
                                    task.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                                    }`} />
                                  <span className="text-sm text-gray-600 dark:text-slate-300 capitalize">{task.priority.toLowerCase()}</span>
                                </div>
                              </td>
                              <td className="p-4 text-sm text-gray-500 dark:text-slate-400">
                                {new Date(task.deadline).toLocaleDateString()}
                              </td>
                              <td className="p-4">
                                <div className="w-6 h-6 rounded-full bg-emerald-500 text-[10px] text-white flex items-center justify-center">S</div>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.t_id); }}
                                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                        {projectTasks.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-400 dark:text-slate-500 italic">
                              No tasks found. Try adjusting your filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CALENDAR VIEW */}
              {viewMode === 'CALENDAR' && (
                <div className="p-6 h-full flex flex-col bg-gray-50 dark:bg-slate-950 overflow-hidden">
                  <div className="flex items-center justify-between mb-6 shrink-0">
                    <div className="flex items-center gap-4">
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="flex bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-50 dark:hover:bg-slate-800 border-r border-gray-200 dark:border-slate-800 rounded-l-lg transition-colors text-gray-600 dark:text-slate-400"><ChevronLeft size={20} /></button>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-r-lg transition-colors text-gray-600 dark:text-slate-400"><ChevronRight size={20} /></button>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentCalendarDate(new Date())}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all hover:shadow-md"
                    >
                      Today
                    </button>
                  </div>

                  <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-3 text-center text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{day}</div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="flex-1 grid grid-cols-7 grid-rows-[repeat(6,minmax(0,1fr))] min-h-0">
                      {(() => {
                        const { days, firstDay, year, month } = getDaysInMonth(currentCalendarDate);
                        const cells = [];

                        // Empty cells for prev month
                        for (let i = 0; i < firstDay; i++) {
                          cells.push(<div key={`empty-${i}`} className="border-r border-b border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-950/30"></div>);
                        }

                        // Day cells
                        for (let d = 1; d <= days; d++) {
                          const dateObj = new Date(year, month, d);
                          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                          const isToday = new Date().toDateString() === dateObj.toDateString();

                          // Filter tasks for this day based on deadline or to_do_date
                          const dayTasks = projectTasks.filter(t => t.deadline === dateStr || t.to_do_date === dateStr);

                          cells.push(
                            <div
                              key={d}
                              onClick={() => handleCreateTask({ deadline: dateStr, to_do_date: dateStr })}
                              className={`
                                relative border-r border-b border-gray-100 dark:border-slate-800 p-2 group transition-all duration-200
                                hover:bg-blue-50/30 dark:hover:bg-blue-900/10 cursor-pointer flex flex-col gap-1 min-h-0
                                ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}
                              `}
                            >
                              <div className="flex justify-between items-start mb-1 shrink-0">
                                <span className={`
                                  text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-all
                                  ${isToday
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-110'
                                    : 'text-gray-700 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}
                                `}>
                                  {d}
                                </span>
                                {dayTasks.length > 0 && (
                                  <span className="text-[10px] font-medium text-gray-400 dark:text-slate-600">
                                    {dayTasks.length} tasks
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 scrollbar-hide min-h-0">
                                {dayTasks.map((t, index) => (
                                  <div
                                    key={t.t_id}
                                    onClick={(e) => { e.stopPropagation(); openTaskModal(t); }}
                                    className={`
                                      text-[10px] px-2 py-1 rounded-[4px] truncate cursor-pointer border shadow-sm hover:translate-x-0.5 transition-transform shrink-0
                                      ${t.status === 'DONE'
                                        ? 'bg-gray-100 text-gray-500 border-gray-200 line-through opacity-70 dark:bg-slate-800 dark:border-slate-700'
                                        : t.priority === 'HIGH'
                                          ? 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400'
                                          : t.priority === 'MEDIUM'
                                            ? 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-400'
                                            : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-400'
                                      }
                                    `}
                                    title={t.name}
                                  >
                                    {t.name}
                                  </div>
                                ))}
                              </div>

                              {/* Add Button on Hover */}
                              <div className="opacity-0 group-hover:opacity-100 absolute bottom-2 right-2 transition-opacity z-10 block">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                  <Plus size={14} />
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Fill remaining grid to keep structure if needed (optional)
                        const totalSlots = Math.ceil((days + firstDay) / 7) * 7;
                        for (let i = days + firstDay; i < 42; i++) { // Always render 42 cells (6 rows * 7 cols) to keep grid stable
                          cells.push(<div key={`empty-end-${i}`} className="border-r border-b border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-950/30"></div>);
                        }

                        return cells;
                      })()}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* --- MODALS --- */}

        {/* PROFILE MODAL */}
        {isProfileModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Edit Profile</h2>
                <button onClick={() => setIsProfileModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleUpdateProfile}>
                <div className="flex justify-center mb-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white ${currentUser.avatar_color}`}>
                    {currentUser.name.charAt(0)}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Name</label>
                    <input name="name" defaultValue={currentUser.name} required className="w-full border dark:border-slate-700 rounded p-2 dark:bg-slate-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Address</label>
                    <input name="email" type="email" defaultValue={currentUser.email} required className="w-full border dark:border-slate-700 rounded p-2 dark:bg-slate-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Username (Read Only)</label>
                    <input value={currentUser.username} disabled className="w-full border dark:border-slate-700 rounded p-2 bg-gray-100 dark:bg-slate-800/50 text-gray-500" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE/EDIT PROJECT MODAL */}
        {isProjectModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl p-6">
              <h2 className="text-xl font-bold mb-4">{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
              <form onSubmit={handleSaveProject}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Project Name</label>
                    <input name="name" defaultValue={editingProject?.name} required className="w-full border dark:border-slate-700 rounded p-2 dark:bg-slate-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" defaultValue={editingProject?.description} className="w-full border dark:border-slate-700 rounded p-2 dark:bg-slate-800" rows={3} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Deadline</label>
                    <input type="date" name="deadline" defaultValue={editingProject?.deadline} required className="w-full border dark:border-slate-700 rounded p-2 dark:bg-slate-800" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save Project</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PROJECT SETTINGS MODAL */}
        {isProjectSettingsOpen && activeProject && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">Project Settings</h2>
                <button onClick={() => setIsProjectSettingsOpen(false)}><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-8">
                {/* General Settings */}
                <section>
                  <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">General</h3>
                  <button
                    onClick={() => { setIsProjectSettingsOpen(false); setEditingProject(activeProject); setIsProjectModalOpen(true); }}
                    className="w-full flex items-center justify-between p-3 border dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="font-medium">Edit Project Details</span>
                    <Pencil size={16} />
                  </button>
                </section>

                {/* Members */}
                <section>
                  <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">Members</h3>
                  <div className="space-y-2">
                    {users.map(u => {
                      const isMember = members.some(m => m.p_id === activeProjectId && m.u_id === u.u_id);
                      return (
                        <div key={u.u_id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-800">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${u.avatar_color}`}>{u.name.charAt(0)}</div>
                            <div>
                              <div className="text-sm font-medium">{u.name}</div>
                              <div className="text-xs text-gray-400">@{u.username}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleMember(u.u_id)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${isMember ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'}`}
                          >
                            {isMember ? 'Member' : 'Add'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </section>

                {/* Danger Zone */}
                <section>
                  <h3 className="text-sm font-bold uppercase text-red-500 mb-4">Danger Zone</h3>
                  <button
                    onClick={() => { handleDeleteProject(activeProjectId!); setIsProjectSettingsOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 p-3 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 text-red-600 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span className="font-medium">Archive Project</span>
                  </button>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* TASK DETAIL MODAL */}
        {isTaskModalOpen && selectedTask && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-slate-800">

              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-xs text-gray-500 font-mono">T-{selectedTask.t_id}</span>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => handleUpdateTask(selectedTask.t_id, { status: e.target.value as TaskStatus })}
                    className="bg-transparent text-sm font-semibold uppercase tracking-wider outline-none cursor-pointer hover:text-blue-600 focus:ring-2 focus:ring-blue-500 rounded px-1"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteTask(selectedTask.t_id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button onClick={() => setIsTaskModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left: Content */}
                <div className="flex-1 p-8 overflow-y-auto">

                  {/* Editable Title */}
                  <input
                    value={selectedTask.name}
                    onChange={(e) => handleUpdateTask(selectedTask.t_id, { name: e.target.value })}
                    className="text-3xl font-bold mb-6 w-full bg-transparent outline-none focus:underline decoration-blue-500/50"
                  />

                  {/* Description */}
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-2">
                      Description
                    </h3>
                    <textarea
                      value={selectedTask.description}
                      onChange={(e) => handleUpdateTask(selectedTask.t_id, { description: e.target.value })}
                      className="w-full p-4 bg-gray-50 dark:bg-slate-950 rounded-lg border border-gray-100 dark:border-slate-800 text-gray-700 dark:text-slate-300 min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Add a more detailed description..."
                    />
                  </div>

                  {/* Subtasks */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase flex items-center gap-2">
                        <CheckCircle2 size={16} /> Subtasks
                      </h3>
                    </div>

                    <div className="space-y-2 mb-3">
                      {tasks.filter(t => t.parent_task_id === selectedTask.t_id && !t.is_deleted).map(sub => (
                        <div key={sub.t_id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-800 group">
                          <button
                            onClick={() => handleUpdateTask(sub.t_id, { status: sub.status === 'DONE' ? 'TODO' : 'DONE' })}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${sub.status === 'DONE' ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 dark:border-slate-600'}`}
                          >
                            {sub.status === 'DONE' && <CheckCircle2 size={12} />}
                          </button>
                          <span className={`flex-1 text-sm ${sub.status === 'DONE' ? 'text-gray-400 line-through' : ''}`}>{sub.name}</span>
                          <button onClick={() => handleDeleteTask(sub.t_id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        value={newSubtaskName}
                        onChange={(e) => setNewSubtaskName(e.target.value)}
                        placeholder="Add a subtask..."
                        className="flex-1 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newSubtaskName.trim()) {
                            handleCreateTask({ name: newSubtaskName, parent_task_id: selectedTask.t_id });
                            setNewSubtaskName("");
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (newSubtaskName.trim()) {
                            handleCreateTask({ name: newSubtaskName, parent_task_id: selectedTask.t_id });
                            setNewSubtaskName("");
                          }
                        }}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-sm font-medium transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase mb-4 flex items-center gap-2">
                      <MessageSquare size={16} /> Comments
                    </h3>

                    <div className="space-y-6 mb-6">
                      {comments.filter(c => c.t_id === selectedTask.t_id).map(c => {
                        const user = users.find(u => u.u_id === c.u_id) || SEED_USERS[0];
                        return (
                          <div key={c.comment_id} className="flex gap-4">
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs ${user.avatar_color}`}>
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="font-semibold text-sm">{user.name}</span>
                                <span className="text-xs text-gray-400">{c.created_at}</span>
                              </div>
                              <p className="text-gray-700 dark:text-slate-300 mt-1 text-sm">{c.comment_text}</p>
                            </div>
                          </div>
                        )
                      })}
                      {comments.filter(c => c.t_id === selectedTask.t_id).length === 0 && (
                        <p className="text-gray-400 text-sm italic">No comments yet.</p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs ${currentUser.avatar_color}`}>
                        {currentUser.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <textarea
                          placeholder="Add a comment..."
                          className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                          rows={2}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(selectedTask.t_id, e.currentTarget.value);
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Sidebar Meta */}
                <div className="w-80 border-l border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 p-6 overflow-y-auto">

                  <div className="space-y-6">
                    <MetaBlock label="Status">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                           ${selectedTask.status === 'TODO' ? 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300' :
                          selectedTask.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                        {selectedTask.status.replace('_', ' ')}
                      </span>
                    </MetaBlock>

                    <MetaBlock label="Priority">
                      <select
                        value={selectedTask.priority}
                        onChange={(e) => handleUpdateTask(selectedTask.t_id, { priority: e.target.value as Priority })}
                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded px-2 py-1 text-sm outline-none"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </MetaBlock>

                    <MetaBlock label="Deadline">
                      <input
                        type="date"
                        value={selectedTask.deadline}
                        onChange={(e) => handleUpdateTask(selectedTask.t_id, { deadline: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded px-2 py-1 text-sm outline-none"
                      />
                    </MetaBlock>

                    <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">History</h4>
                      <div className="space-y-4">
                        {history.filter(h => h.t_id === selectedTask.t_id).reverse().map(h => {
                          const u = users.find(user => user.u_id === h.changed_by);
                          return (
                            <div key={h.history_id} className="text-xs">
                              <div className="flex gap-1 mb-0.5">
                                <span className="font-semibold text-gray-900 dark:text-white">{u?.name}</span>
                                <span className="text-gray-500">{h.action_type === "CREATED" ? "created this task" : "updated"}</span>
                              </div>
                              {h.old_value && h.new_value && (
                                <div className="text-gray-500 dark:text-slate-400 pl-1 border-l-2 border-gray-200 dark:border-slate-700">
                                  {h.old_value} <ArrowRight /> {h.new_value}
                                </div>
                              )}
                              <div className="text-gray-400 mt-0.5 text-[10px]">{h.created_at}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200
        ${active
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
          : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
        }`}
    >
      <div className={`${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'}`}>
        {icon}
      </div>
      <span className="font-medium text-sm">{label}</span>
      {active && <ChevronRight size={14} className="ml-auto text-blue-500" />}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
      </div>
      <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
        {icon}
      </div>
    </div>
  )
}

function KanbanColumn({ title, status, tasks, allTasks, onTaskClick, onDrop, onDelete }: {
  title: string,
  status: string,
  tasks: Task[],
  allTasks: Task[],
  onTaskClick: (t: Task) => void,
  onDrop: (id: number) => void,
  onDelete: (id: number) => void
}) {

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    const t_id = Number(e.dataTransfer.getData("t_id"));
    onDrop(t_id);
  };

  return (
    <div
      className="flex flex-col w-80 flex-shrink-0"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-semibold text-gray-700 dark:text-slate-200">{title}</h3>
        <span className="bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-2 py-0.5 rounded text-xs font-medium">{tasks.length}</span>
      </div>

      <div className="flex-1 rounded-xl bg-gray-100/50 dark:bg-slate-900/50 border border-transparent dark:border-slate-800 p-3 space-y-3 overflow-y-auto">
        {tasks.map(task => {
          // Calculate subtask completion
          const subtasks = allTasks.filter(t => t.parent_task_id === task.t_id && !t.is_deleted);
          const completedSubtasks = subtasks.filter(t => t.status === 'DONE').length;

          const isSubtask = !!task.parent_task_id;
          const parentTask = isSubtask ? allTasks.find(t => t.t_id === task.parent_task_id) : null;

          return (
            <div
              key={task.t_id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("t_id", task.t_id.toString())}
              onClick={() => onTaskClick(task)}
              className={`rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative
                 ${isSubtask ? 'bg-gray-50/80 dark:bg-slate-900/80 p-3' : 'bg-white dark:bg-slate-800 p-4'}`}
            >
              {/* SUBTASK HEADER */}
              {isSubtask && parentTask && (
                <div className="flex items-center gap-1.5 text-[10px] text-blue-600 dark:text-blue-400 font-medium mb-1.5">
                  <CornerDownRight size={10} />
                  <span className="truncate max-w-[150px]">{parentTask.name}</span>
                </div>
              )}

              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${task.priority === 'HIGH' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                  task.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                  {task.priority}
                </span>

                {/* Quick actions for task */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 flex gap-1 bg-white dark:bg-slate-800 shadow-sm rounded border dark:border-slate-700">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(task.t_id); }}
                    className="p-1 hover:text-red-500"
                    title="Archive"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <h4 className={`font-medium text-gray-900 dark:text-slate-100 mb-3 line-clamp-2 ${isSubtask ? 'text-xs' : 'text-sm'}`}>{task.name}</h4>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700/50">
                <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span>{new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                  {/* Subtask Indicator */}
                  {subtasks.length > 0 && (
                    <div className="flex items-center gap-1.5 hover:text-blue-600 transition-colors" title={`${completedSubtasks}/${subtasks.length} subtasks completed`}>
                      <CheckSquare size={12} />
                      <span>{completedSubtasks}/{subtasks.length}</span>
                    </div>
                  )}
                </div>
                {/* Avatar placeholder for assignee */}
                {!isSubtask && <div className="w-5 h-5 rounded-full bg-emerald-500 text-[8px] text-white flex items-center justify-center">S</div>}
              </div>
            </div>
          )
        })}
        {tasks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-600 text-sm italic border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-lg min-h-[100px]">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}

function MetaBlock({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide block mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function ArrowRight() {
  return <span className="mx-1">→</span>
}
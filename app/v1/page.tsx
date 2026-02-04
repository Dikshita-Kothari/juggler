'use client'
import {
    ArrowRight,
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
    GanttChartSquare,
    GitMerge,
    GripVertical,
    Inbox,
    LayoutDashboard,
    LayoutGrid,
    List,
    Moon,
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
type ViewMode = 'BOARD' | 'LIST' | 'CALENDAR' | 'PRIORITY' | 'TIMELINE';
type TimelineScale = 'MONTH' | 'WEEK' | 'DAY';

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
    deadline: string; // Can be empty string if unscheduled
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
    { t_id: 1, p_id: 1, parent_task_id: null, name: "Design Database Schema", description: "Create SQL tables for users, projects, and tasks.", position: 1, status: "DONE", priority: "HIGH", to_do_date: "2024-02-01", deadline: "2024-02-05", created_at: "2024-01-10", updated_at: "2024-01-11", is_deleted: false },
    { t_id: 2, p_id: 1, parent_task_id: null, name: "Frontend Setup", description: "Initialize Next.js and Tailwind.", position: 2, status: "IN_PROGRESS", priority: "MEDIUM", to_do_date: "2024-02-03", deadline: "2024-02-10", created_at: "2024-01-12", updated_at: "2024-01-13", is_deleted: false },
    { t_id: 3, p_id: 1, parent_task_id: null, name: "API Routes", description: "Implement CRUD endpoints.", position: 3, status: "TODO", priority: "HIGH", to_do_date: "2024-02-08", deadline: "2024-02-15", created_at: "2024-01-15", updated_at: "2024-01-15", is_deleted: false },
    { t_id: 4, p_id: 2, parent_task_id: null, name: "Draft Ad Copy", description: "Write copy for Instagram ads.", position: 1, status: "TODO", priority: "LOW", to_do_date: "2024-02-05", deadline: "2024-02-07", created_at: "2024-01-20", updated_at: "2024-01-20", is_deleted: false },
    // Subtask example
    { t_id: 5, p_id: 1, parent_task_id: 2, name: "Install Shadcn UI", description: "Add button and card components", position: 1, status: "DONE", priority: "LOW", to_do_date: "2024-02-03", deadline: "2024-02-04", created_at: "2024-01-13", updated_at: "2024-01-13", is_deleted: false },
    // Unscheduled Task Example
    { t_id: 6, p_id: 1, parent_task_id: null, name: "Brainstorming Session", description: "Plan next features", position: 6, status: "TODO", priority: "MEDIUM", to_do_date: "", deadline: "", created_at: "2024-01-22", updated_at: "2024-01-22", is_deleted: false },
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
    const [timelineScale, setTimelineScale] = useState<TimelineScale>('WEEK');
    const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [showSubtasks, setShowSubtasks] = useState(false);
    const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [showInbox, setShowInbox] = useState(false);
    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

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

    const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // --- ACTIONS: DRAG AND DROP ---
    const handleDragStart = (e: React.DragEvent, t_id: number) => {
        e.dataTransfer.setData("t_id", t_id.toString());
        e.dataTransfer.effectAllowed = "move";
        setDraggedTaskId(t_id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDropOnDate = (e: React.DragEvent, dateStr: string) => {
        e.preventDefault();
        const t_id = Number(e.dataTransfer.getData("t_id"));
        if (t_id) {
            handleUpdateTask(t_id, { deadline: dateStr, to_do_date: dateStr });
            setDraggedTaskId(null);
            showToast(`Scheduled for ${dateStr}`);
        }
    };

    const handleDropOnInbox = (e: React.DragEvent) => {
        e.preventDefault();
        const t_id = Number(e.dataTransfer.getData("t_id"));
        if (t_id) {
            handleUpdateTask(t_id, { deadline: "", to_do_date: "" });
            setDraggedTaskId(null);
            showToast("Moved to Inbox");
        }
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
        let finalDeadline = newTask.deadline;
        if (finalDeadline === undefined) {
            finalDeadline = formatDate(new Date());
        }

        const task: Task = {
            t_id,
            p_id: activeProjectId!,
            parent_task_id: newTask.parent_task_id || null,
            name: newTask.name || "New Task",
            description: newTask.description || "",
            position: tasks.length + 1,
            status: 'TODO',
            priority: newTask.priority || 'MEDIUM',
            to_do_date: formatDate(new Date()),
            deadline: finalDeadline,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_deleted: false,
            ...newTask
        };
        setTasks([...tasks, task]);
        logHistory(t_id, "CREATED", null, task.name);
        if (!newTask.parent_task_id && finalDeadline) showToast("Task created");
        if (!finalDeadline) showToast("Added to Inbox");
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

    const getWeekDays = (date: Date) => {
        const curr = new Date(date);
        const day = curr.getDay();
        const diff = curr.getDate() - day + (day === 0 ? -6 : 1);

        const week = [];
        const monday = new Date(curr.setDate(diff));

        for (let i = 0; i < 7; i++) {
            const next = new Date(monday);
            next.setDate(monday.getDate() + i);
            week.push(next);
        }
        return week;
    }

    const changeMonth = (delta: number) => {
        setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta)));
    };

    const changeDay = (delta: number) => {
        const newDate = new Date(currentCalendarDate);
        newDate.setDate(newDate.getDate() + delta);
        setCurrentCalendarDate(newDate);
    }

    const changeWeek = (delta: number) => {
        const newDate = new Date(currentCalendarDate);
        newDate.setDate(newDate.getDate() + (delta * 7));
        setCurrentCalendarDate(newDate);
    }

    // --- VIEW HELPERS ---

    const navigateToProject = (pId: number) => {
        setActiveProjectId(pId);
        setActiveView('PROJECT');
        setSearchQuery("");
        setPriorityFilter('ALL');
        setViewMode('TIMELINE');
        setTimelineScale('WEEK');
        setShowInbox(true);
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
        (showSubtasks || viewMode === 'CALENDAR' || viewMode === 'TIMELINE' ? true : t.parent_task_id === null) &&
        (priorityFilter === 'ALL' || t.priority === priorityFilter) &&
        (t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.priority.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const inboxTasks = tasks.filter(t =>
        t.p_id === activeProjectId &&
        !t.is_deleted &&
        (!t.deadline || t.deadline === "")
    );

    const listTasks = useMemo(() => {
        if (viewMode !== 'LIST') return projectTasks;
        const taskMap = new Map(projectTasks.map(t => [t.t_id, t]));
        const roots = projectTasks.filter(t => !t.parent_task_id || !taskMap.has(t.parent_task_id));
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
            if (kids) flattened.push(...kids);
        });
        return flattened;
    }, [projectTasks, viewMode]);

    return (
        <div className={`flex h-screen w-full bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200`}>

            {/* TOASTS */}
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
                {/* ... Sidebar content ... */}
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
                                    <button
                                        onClick={() => setViewMode('TIMELINE')}
                                        className={`p-1.5 rounded transition-all ${viewMode === 'TIMELINE' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
                                        title="Planner / Timeline"
                                    >
                                        <GanttChartSquare size={16} />
                                    </button>
                                </div>

                                {/* SUBTASK TOGGLE */}
                                {viewMode !== 'TIMELINE' && (
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
                                )}
                            </div>

                            {/* FILTER BAR */}
                            <div className="flex items-center gap-3">
                                {/* Inbox Toggle in Timeline View */}
                                {viewMode === 'TIMELINE' && (
                                    <button
                                        onClick={() => setShowInbox(!showInbox)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border
                        ${showInbox
                                                ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300'
                                                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
                                            }`}
                                    >
                                        <Inbox size={16} />
                                        <span className="hidden lg:inline">Inbox</span>
                                        {inboxTasks.length > 0 && <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs px-1.5 py-0.5 rounded-full">{inboxTasks.length}</span>}
                                    </button>
                                )}

                                {viewMode !== 'PRIORITY' && viewMode !== 'TIMELINE' && (
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
                                        placeholder="Search..."
                                        className="pl-9 pr-4 py-1.5 text-sm bg-gray-100 dark:bg-slate-800 border-none rounded-md focus:ring-2 focus:ring-blue-500 outline-none w-48 lg:w-64"
                                    />
                                </div>
                                {viewMode !== 'CALENDAR' && (
                                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                        onClick={() => handleCreateTask({ name: "New Task" })}
                                    >
                                        <Plus size={16} /> Add
                                    </button>
                                )}
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
                                                                {task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}
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

                            {/* CALENDAR VIEW - FIXED OVERFLOW */}
                            {viewMode === 'CALENDAR' && (
                                <div className="flex h-full">
                                    {/* Left: Calendar Grid */}
                                    <div className="flex-1 flex flex-col p-6 pr-0 overflow-hidden">
                                        <div className="flex items-center justify-between mb-6 pr-6">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                </h3>
                                                <div className="flex bg-white dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700">
                                                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 border-r border-gray-200 dark:border-slate-700"><ChevronLeft size={16} /></button>
                                                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700"><ChevronRight size={16} /></button>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const today = new Date();
                                                    setCurrentCalendarDate(today);
                                                    setSelectedDay(today);
                                                }}
                                                className="text-sm font-medium text-blue-600 hover:underline"
                                            >
                                                Today
                                            </button>
                                        </div>

                                        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col">
                                            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-800">
                                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                    <div key={day} className="p-3 text-center text-xs font-semibold text-gray-500 uppercase">{day}</div>
                                                ))}
                                            </div>
                                            <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                                                {(() => {
                                                    const { days, firstDay, year, month } = getDaysInMonth(currentCalendarDate);
                                                    const cells = [];
                                                    for (let i = 0; i < firstDay; i++) {
                                                        cells.push(<div key={`empty-${i}`} className="border-r border-b border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/50"></div>);
                                                    }
                                                    for (let d = 1; d <= days; d++) {
                                                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                                        const dayTasks = projectTasks.filter(t => t.deadline === dateStr);
                                                        const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
                                                        const isSelected = selectedDay.toDateString() === new Date(year, month, d).toDateString();

                                                        cells.push(
                                                            <div
                                                                key={d}
                                                                onClick={() => setSelectedDay(new Date(year, month, d))}
                                                                className={`border-r border-b border-gray-100 dark:border-slate-800 p-2 min-h-[100px] cursor-pointer transition-colors relative flex flex-col
                                      ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/20 ring-2 ring-inset ring-blue-500 z-10' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'}
                                      ${isToday && !isSelected ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                                            >
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <div className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full 
                                          ${isToday ? 'bg-blue-600 text-white' : isSelected ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                        {d}
                                                                    </div>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleCreateTask({ deadline: dateStr, name: "New Task" }); }}
                                                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity"
                                                                    >
                                                                        <Plus size={14} />
                                                                    </button>
                                                                </div>

                                                                {/* Simplified Task Count View */}
                                                                <div className="flex-1 flex items-center justify-center">
                                                                    {dayTasks.length > 0 && (
                                                                        <div className="flex flex-col items-center">
                                                                            <div className={`text-xl font-bold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                                                                {dayTasks.length}
                                                                            </div>
                                                                            <div className="text-[10px] text-gray-400 uppercase font-medium tracking-wider">
                                                                                {dayTasks.length === 1 ? 'Task' : 'Tasks'}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return cells;
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Day Detail Panel */}
                                    <div className="w-72 my-6 mr-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col overflow-hidden shrink-0">
                                        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                                            <div className="text-lg font-bold mb-1">
                                                {selectedDay.toLocaleDateString(undefined, { weekday: 'long' })}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-slate-400">
                                                {selectedDay.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                            {projectTasks.filter(t => t.deadline === formatDate(selectedDay)).map(t => (
                                                <div
                                                    key={t.t_id}
                                                    onClick={() => openTaskModal(t)}
                                                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${t.priority === 'HIGH' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                            }`}>
                                                            {t.priority}
                                                        </span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(t.t_id); }}
                                                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <div className={`text-sm font-medium mb-1 ${t.status === 'DONE' ? 'line-through text-gray-400' : ''}`}>{t.name}</div>
                                                    {t.parent_task_id && (
                                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                                            <CornerDownRight size={10} /> Subtask
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {projectTasks.filter(t => t.deadline === formatDate(selectedDay)).length === 0 && (
                                                <div className="text-center py-8 text-gray-400 dark:text-slate-600 text-sm italic">
                                                    No tasks for this day
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
                                            <button
                                                onClick={() => handleCreateTask({ deadline: formatDate(selectedDay), name: "New Task" })}
                                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Plus size={16} /> Add Task
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TIMELINE / PLANNER VIEW - REFINED */}
                            {viewMode === 'TIMELINE' && (
                                <div className="flex h-full overflow-hidden">
                                    {/* INBOX SIDEBAR - FOR PLANNING */}
                                    {showInbox && (
                                        <div
                                            className="w-80 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 animate-in slide-in-from-left duration-200"
                                            onDragOver={handleDragOver} // Allow dropping back to inbox
                                            onDrop={handleDropOnInbox} // Handle drop to unschedule
                                        >
                                            <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-purple-50/50 dark:bg-purple-900/10">
                                                <div className="flex items-center gap-2 font-bold text-purple-800 dark:text-purple-300">
                                                    <Inbox size={18} /> Backlog / Inbox
                                                </div>
                                                <button onClick={() => setShowInbox(false)}><X size={16} className="text-purple-400 hover:text-purple-600" /></button>
                                            </div>
                                            <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                                                <button
                                                    onClick={() => handleCreateTask({ name: "New Idea", deadline: "" })}
                                                    className="w-full py-2 border-2 border-dashed border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                                                >
                                                    + Add Unscheduled Task
                                                </button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                                {inboxTasks.map(t => {
                                                    const subtasks = tasks.filter(sub => sub.parent_task_id === t.t_id && !sub.is_deleted);
                                                    return (
                                                        <div
                                                            key={t.t_id}
                                                            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 shadow-sm group cursor-grab active:cursor-grabbing hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, t.t_id)}
                                                            onClick={() => openTaskModal(t)}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex items-start gap-2">
                                                                    <GripVertical size={14} className="text-gray-300 mt-0.5" />
                                                                    <div
                                                                        className="text-sm font-medium cursor-pointer hover:text-blue-600"
                                                                    >
                                                                        {t.name}
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        className="p-1 text-gray-300 hover:text-blue-500"
                                                                        title="Schedule for Today"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleUpdateTask(t.t_id, { deadline: formatDate(new Date()) });
                                                                        }}
                                                                    >
                                                                        <Calendar size={14} />
                                                                    </button>
                                                                    <button
                                                                        className="p-1 text-gray-300 hover:text-red-500"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteTask(t.t_id);
                                                                        }}
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {subtasks.length > 0 && (
                                                                <div className="text-xs text-gray-400 mb-2 flex gap-1 items-center pl-5">
                                                                    <GitMerge size={12} /> {subtasks.length} subtasks
                                                                </div>
                                                            )}
                                                            {/* Quick Schedule Actions */}
                                                            <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-slate-700/50 pl-5">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleUpdateTask(t.t_id, { deadline: formatDate(new Date()) });
                                                                    }}
                                                                    className="text-[10px] bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 transition-colors"
                                                                >
                                                                    Today
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const tmrw = new Date();
                                                                        tmrw.setDate(tmrw.getDate() + 1);
                                                                        handleUpdateTask(t.t_id, { deadline: formatDate(tmrw) });
                                                                    }}
                                                                    className="text-[10px] bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 transition-colors"
                                                                >
                                                                    Tmrw
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                                {inboxTasks.length === 0 && (
                                                    <div className="text-center text-xs text-gray-400 italic py-8">
                                                        Inbox empty. Great job!
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex-1 flex flex-col p-6 h-full overflow-hidden">
                                        <div className="flex items-center justify-between mb-6 shrink-0">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {timelineScale === 'WEEK'
                                                        ? `Week of ${currentCalendarDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                                                        : currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                </h3>
                                                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                                                    <button
                                                        onClick={() => setTimelineScale('MONTH')}
                                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timelineScale === 'MONTH' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'}`}
                                                    >
                                                        Month
                                                    </button>
                                                    <button
                                                        onClick={() => setTimelineScale('WEEK')}
                                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timelineScale === 'WEEK' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'}`}
                                                    >
                                                        Week
                                                    </button>
                                                    <button
                                                        onClick={() => setTimelineScale('DAY')}
                                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timelineScale === 'DAY' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'}`}
                                                    >
                                                        Day
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => timelineScale === 'MONTH' ? changeMonth(-1) : timelineScale === 'WEEK' ? changeWeek(-1) : changeDay(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"><ChevronLeft size={18} /></button>
                                                <button onClick={() => timelineScale === 'MONTH' ? changeMonth(1) : timelineScale === 'WEEK' ? changeWeek(1) : changeDay(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"><ChevronRight size={18} /></button>
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col relative">

                                            {/* WEEK VIEW - NEW */}
                                            {timelineScale === 'WEEK' && (
                                                <div className="flex flex-col h-full">
                                                    <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                                                        {getWeekDays(currentCalendarDate).map((day, i) => {
                                                            const isToday = new Date().toDateString() === day.toDateString();
                                                            return (
                                                                <div key={i} className={`p-3 text-center border-r border-gray-200 dark:border-slate-800 last:border-0 ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                                                                    <div className={`text-xs font-bold uppercase mb-1 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                                                                        {day.toLocaleDateString(undefined, { weekday: 'short' })}
                                                                    </div>
                                                                    <div className={`text-lg font-bold ${isToday ? 'text-blue-700' : ''}`}>
                                                                        {day.getDate()}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                    <div className="flex-1 grid grid-cols-7 overflow-y-auto">
                                                        {getWeekDays(currentCalendarDate).map((day, i) => {
                                                            const dateStr = formatDate(day); // FIX: Use formatDate here
                                                            const dayTasks = projectTasks.filter(t => t.deadline === dateStr);
                                                            const isToday = new Date().toDateString() === day.toDateString();

                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className={`border-r border-gray-100 dark:border-slate-800 last:border-0 p-2 min-h-[200px] group transition-colors ${isToday ? 'bg-blue-50/10' : ''}`}
                                                                    onDragOver={handleDragOver}
                                                                    onDrop={(e) => handleDropOnDate(e, dateStr)}
                                                                >
                                                                    <div className="space-y-2 pointer-events-none">
                                                                        {dayTasks.map(t => (
                                                                            <div
                                                                                key={t.t_id}
                                                                                onClick={() => openTaskModal(t)}
                                                                                draggable // Added draggable
                                                                                onDragStart={(e) => handleDragStart(e, t.t_id)} // Added drag start
                                                                                className={`p-2 rounded-lg border text-xs shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all pointer-events-auto
                                                    ${t.status === 'DONE' ? 'bg-gray-50 border-gray-200 text-gray-400 line-through dark:bg-slate-800 dark:border-slate-700' :
                                                                                        t.priority === 'HIGH' ? 'bg-red-50 border-red-100 text-red-900 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-100' :
                                                                                            'bg-white border-gray-200 text-gray-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'}`}
                                                                            >
                                                                                <div className="font-medium mb-1 line-clamp-2">{t.name}</div>
                                                                                {t.parent_task_id && <div className="flex items-center gap-1 text-[10px] opacity-70"><CornerDownRight size={8} /> Subtask</div>}
                                                                            </div>
                                                                        ))}
                                                                        <button
                                                                            onClick={() => handleCreateTask({ deadline: dateStr, name: "New Task" })}
                                                                            className="w-full py-1.5 rounded border border-dashed border-gray-200 dark:border-slate-700 text-gray-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all opacity-0 group-hover:opacity-100 flex justify-center pointer-events-auto"
                                                                        >
                                                                            <Plus size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* MONTH GANTT VIEW */}
                                            {timelineScale === 'MONTH' && (
                                                <>
                                                    <div className="grid grid-cols-[200px_1fr] border-b border-gray-200 dark:border-slate-800 h-full overflow-hidden">
                                                        {/* Sidebar */}
                                                        <div className="border-r border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 p-4">
                                                            <div className="text-xs font-bold text-gray-500 uppercase mb-4">Task</div>
                                                            <div className="space-y-6">
                                                                {projectTasks.map(t => (
                                                                    <div key={t.t_id} className="text-sm font-medium truncate h-6">{t.name}</div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Chart Area */}
                                                        <div className="overflow-x-auto">
                                                            <div className="min-w-[800px] h-full flex flex-col">
                                                                {/* Date Header - Droppable */}
                                                                <div className="flex border-b border-gray-200 dark:border-slate-800 relative">
                                                                    {(() => {
                                                                        const { days, year, month } = getDaysInMonth(currentCalendarDate);
                                                                        const headers = [];
                                                                        const today = new Date();
                                                                        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

                                                                        for (let d = 1; d <= days; d++) {
                                                                            const isToday = isCurrentMonth && today.getDate() === d;
                                                                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

                                                                            headers.push(
                                                                                <div
                                                                                    key={d}
                                                                                    onDragOver={handleDragOver}
                                                                                    onDrop={(e) => handleDropOnDate(e, dateStr)}
                                                                                    onClick={() => {
                                                                                        setCurrentCalendarDate(new Date(year, month, d));
                                                                                        setTimelineScale('DAY');
                                                                                    }}
                                                                                    className={`flex-1 min-w-[30px] text-center py-2 border-r border-gray-100 dark:border-slate-800/50 text-[10px] cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors
                                                    ${isToday ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 font-bold' : 'text-gray-500'}`}
                                                                                >
                                                                                    {d}
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return headers;
                                                                    })()}
                                                                </div>

                                                                {/* Bars */}
                                                                <div className="p-4 space-y-6 relative">
                                                                    {/* Grid Lines */}
                                                                    <div className="absolute inset-0 top-0 pointer-events-none flex pl-4">
                                                                        {(() => {
                                                                            const { days, year, month } = getDaysInMonth(currentCalendarDate);
                                                                            const today = new Date();
                                                                            const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
                                                                            const lines = [];

                                                                            for (let d = 1; d <= days; d++) {
                                                                                const isToday = isCurrentMonth && today.getDate() === d;
                                                                                lines.push(
                                                                                    <div key={d} className={`flex-1 border-r h-full relative ${isToday ? 'bg-blue-50/20 dark:bg-blue-900/10' : 'border-gray-50 dark:border-slate-800/30'}`}>
                                                                                        {isToday && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500 z-10 opacity-50"></div>}
                                                                                    </div>
                                                                                )
                                                                            }
                                                                            return lines;
                                                                        })()}
                                                                    </div>

                                                                    {projectTasks.map(t => {
                                                                        const { days, year, month } = getDaysInMonth(currentCalendarDate);
                                                                        const start = new Date(t.to_do_date);
                                                                        const end = new Date(t.deadline);
                                                                        const monthStart = new Date(year, month, 1);
                                                                        // Simple position calc
                                                                        let startDay = start.getDate();
                                                                        let duration = (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1;

                                                                        // Clip to current month view
                                                                        if (end < monthStart) return <div key={t.t_id} className="h-6"></div>;

                                                                        if (start < monthStart) {
                                                                            startDay = 1;
                                                                            duration -= (monthStart.getTime() - start.getTime()) / (1000 * 3600 * 24);
                                                                        }

                                                                        const widthPct = (duration / days) * 100;
                                                                        const leftPct = ((startDay - 1) / days) * 100;

                                                                        return (
                                                                            <div key={t.t_id} className="relative h-6 w-full">
                                                                                <div
                                                                                    className={`absolute h-5 rounded-md text-[10px] flex items-center px-2 text-white font-medium shadow-sm cursor-grab active:cursor-grabbing hover:brightness-110 transition-all z-20
                                                     ${t.priority === 'HIGH' ? 'bg-red-500' : t.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                                                                    style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 3.5)}%` }} // Min width so visible
                                                                                    draggable // Added draggable
                                                                                    onDragStart={(e) => handleDragStart(e, t.t_id)} // Added drag start
                                                                                    onClick={() => openTaskModal(t)}
                                                                                >
                                                                                    <span className="truncate">{t.name}</span>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* DAY SCHEDULE VIEW - NEW DESIGN */}
                                            {timelineScale === 'DAY' && (
                                                <div className="flex h-full">
                                                    {/* Timeline Sidebar (Hours) */}
                                                    <div className="w-16 border-r border-gray-200 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/30 flex flex-col py-6 gap-12 text-xs text-gray-400 font-mono items-center shrink-0">
                                                        <div>08:00</div>
                                                        <div>10:00</div>
                                                        <div>12:00</div>
                                                        <div>14:00</div>
                                                        <div>16:00</div>
                                                        <div>18:00</div>
                                                        <div>20:00</div>
                                                    </div>

                                                    {/* Main Drop Area */}
                                                    <div
                                                        className="flex-1 p-6 overflow-y-auto relative bg-white dark:bg-slate-950"
                                                        onDragOver={handleDragOver}
                                                        onDrop={(e) => handleDropOnDate(e, formatDate(currentCalendarDate))} // FIX: Use formatDate
                                                    >
                                                        {/* Current Day Header */}
                                                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-950 z-10">
                                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex flex-col items-center justify-center text-blue-700 dark:text-blue-400">
                                                                <span className="text-xs font-bold uppercase">{currentCalendarDate.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                                                <span className="text-lg font-bold leading-none">{currentCalendarDate.getDate()}</span>
                                                            </div>
                                                            <div>
                                                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daily Schedule</h2>
                                                                <p className="text-sm text-gray-500">Drag tasks here to schedule for today</p>
                                                            </div>
                                                        </div>

                                                        {/* Tasks List as Timeline Blocks */}
                                                        <div className="space-y-4 pl-4 border-l-2 border-blue-100 dark:border-slate-800 ml-3">
                                                            {projectTasks.filter(t => t.deadline === formatDate(currentCalendarDate)).map(t => (
                                                                <div
                                                                    key={t.t_id}
                                                                    className="relative group"
                                                                    draggable // Added draggable
                                                                    onDragStart={(e) => handleDragStart(e, t.t_id)} // Added drag start
                                                                >
                                                                    {/* Dot on line */}
                                                                    <div className={`absolute -left-[21px] top-4 w-3 h-3 rounded-full border-2 border-white dark:border-slate-950 shadow-sm
                                            ${t.status === 'DONE' ? 'bg-green-500' : t.priority === 'HIGH' ? 'bg-red-500' : 'bg-blue-500'}`}></div>

                                                                    <div
                                                                        onClick={() => openTaskModal(t)}
                                                                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing flex justify-between items-center"
                                                                    >
                                                                        <div>
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider
                                                      ${t.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                                                                    {t.priority}
                                                                                </span>
                                                                                {t.parent_task_id && <span className="text-xs text-gray-400 flex items-center"><CornerDownRight size={10} className="mr-1" /> Subtask</span>}
                                                                            </div>
                                                                            <h4 className={`text-sm font-semibold ${t.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{t.name}</h4>
                                                                        </div>

                                                                        <div className="flex items-center gap-3">
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); handleUpdateTask(t.t_id, { status: t.status === 'DONE' ? 'TODO' : 'DONE' }); }}
                                                                                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors
                                                    ${t.status === 'DONE' ? 'bg-green-50 border-green-200 text-green-600' : 'border-gray-200 hover:bg-gray-50 dark:border-slate-700'}`}
                                                                            >
                                                                                <CheckCircle2 size={16} />
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); handleDeleteTask(t.t_id); }}
                                                                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            {projectTasks.filter(t => t.deadline === formatDate(currentCalendarDate)).length === 0 && (
                                                                <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/50">
                                                                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-gray-400">
                                                                        <Calendar size={20} />
                                                                    </div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">No tasks scheduled</p>
                                                                    <p className="text-xs text-gray-500 max-w-[200px] mt-1">Drag tasks from the Inbox on the left to schedule them for today.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}

                {/* TASK MODAL OVERLAY */}
                <TaskModal
                    isOpen={isTaskModalOpen}
                    task={selectedTask}
                    onClose={() => setIsTaskModalOpen(false)}
                    onUpdate={(updates) => selectedTask && handleUpdateTask(selectedTask.t_id, updates)}
                    onDelete={() => selectedTask && handleDeleteTask(selectedTask.t_id)}
                    onAddComment={(text) => selectedTask && handleAddComment(selectedTask.t_id, text)}
                    comments={selectedTask ? comments.filter(c => c.t_id === selectedTask.t_id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : []}
                    users={users}
                    currentUser={currentUser}
                    subtasks={selectedTask ? tasks.filter(t => t.parent_task_id === selectedTask.t_id && !t.is_deleted) : []}
                    onCreateSubtask={(name) => selectedTask && handleCreateTask({ parent_task_id: selectedTask.t_id, name, p_id: selectedTask.p_id })}
                />

                {/* PROJECT MODAL */}
                {isProjectModalOpen && (
                    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsProjectModalOpen(false)}>
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                            <h2 className="text-xl font-bold mb-4">{editingProject ? 'Edit Project' : 'New Project'}</h2>
                            <form onSubmit={handleSaveProject} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium block mb-1">Project Name</label>
                                    <input name="name" defaultValue={editingProject?.name} required className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700" placeholder="e.g. Website Redesign" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium block mb-1">Description</label>
                                    <textarea name="description" defaultValue={editingProject?.description} className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700" rows={3} placeholder="Project goals..." />
                                </div>
                                <div>
                                    <label className="text-sm font-medium block mb-1">Deadline</label>
                                    <input type="date" name="deadline" defaultValue={editingProject?.deadline} className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700" />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Project</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* PROFILE MODAL */}
                {isProfileModalOpen && (
                    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsProfileModalOpen(false)}>
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium block mb-1">Display Name</label>
                                    <input name="name" defaultValue={currentUser.name} required className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium block mb-1">Email</label>
                                    <input name="email" type="email" defaultValue={currentUser.email} required className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700" />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// ... existing sub components ...
// (Sub components are unchanged, keeping them in the full file for completeness if needed, but for brevity here I focused on App component changes)
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
                                        <span>{task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}</span>
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

function TaskModal({ task, isOpen, onClose, onUpdate, onDelete, onAddComment, comments, users, currentUser, subtasks, onCreateSubtask }: {
    task: Task | null,
    isOpen: boolean,
    onClose: () => void,
    onUpdate: (updates: Partial<Task>) => void,
    onDelete: () => void,
    onAddComment: (text: string) => void,
    comments: TaskComment[],
    users: User[],
    currentUser: User,
    subtasks: Task[],
    onCreateSubtask: (name: string) => void
}) {
    if (!isOpen || !task) return null;

    // Local state for inputs
    const [newComment, setNewComment] = useState("");
    const [newSubtask, setNewSubtask] = useState("");

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        onAddComment(newComment);
        setNewComment("");
    }

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;
        onCreateSubtask(newSubtask);
        setNewSubtask("");
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-slate-800"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onUpdate({ status: task.status === 'DONE' ? 'TODO' : 'DONE' })}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                   ${task.status === 'DONE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-gray-200'}`}
                        >
                            {task.status === 'DONE' ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />}
                            {task.status === 'DONE' ? 'Completed' : 'Mark Complete'}
                        </button>
                        <div className="h-4 w-[1px] bg-gray-200 dark:bg-slate-700"></div>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">TASK-{task.t_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X size={18} /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto flex md:flex-row flex-col bg-white dark:bg-slate-900">
                    {/* LEFT MAIN CONTENT */}
                    <div className="flex-1 p-8 border-r border-gray-100 dark:border-slate-800">
                        <input
                            type="text"
                            value={task.name}
                            onChange={(e) => onUpdate({ name: e.target.value })}
                            className="text-2xl font-bold w-full bg-transparent border-none focus:ring-0 p-0 mb-6 text-gray-900 dark:text-white placeholder-gray-400"
                            placeholder="Task Name"
                        />

                        <div className="mb-8">
                            <MetaBlock label="Description">
                                <textarea
                                    value={task.description || ""}
                                    onChange={(e) => onUpdate({ description: e.target.value })}
                                    placeholder="Add a more detailed description..."
                                    className="w-full min-h-[120px] p-4 rounded-xl bg-gray-50 dark:bg-slate-950/50 border-none resize-y text-sm focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-700 dark:text-slate-300"
                                />
                            </MetaBlock>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Subtasks ({subtasks.filter(t => t.status === 'DONE').length}/{subtasks.length})</label>
                            </div>
                            <div className="space-y-2 mb-3">
                                {subtasks.map(st => (
                                    <div key={st.t_id} className="flex items-center gap-3 group p-2 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${st.status === 'DONE' ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 dark:border-slate-600'}`}>
                                            {st.status === 'DONE' && <CheckSquare size={10} />}
                                        </div>
                                        <span className={`text-sm flex-1 ${st.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-700 dark:text-slate-300'}`}>{st.name}</span>
                                    </div>
                                ))}
                                {subtasks.length === 0 && <div className="text-sm text-gray-400 italic">No subtasks</div>}
                            </div>
                            <form onSubmit={handleAddSubtask} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSubtask}
                                    onChange={e => setNewSubtask(e.target.value)}
                                    placeholder="Add a subtask..."
                                    className="flex-1 bg-gray-50 dark:bg-slate-950/50 border-none rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-blue-500/20"
                                />
                                <button type="submit" disabled={!newSubtask.trim()} className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50">
                                    <Plus size={16} />
                                </button>
                            </form>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide block mb-3">Activity & Comments</label>
                            <div className="space-y-4 mb-4">
                                {comments.map(c => {
                                    const user = users.find(u => u.u_id === c.u_id);
                                    return (
                                        <div key={c.comment_id} className="flex gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${user?.avatar_color || 'bg-gray-400'}`}>
                                                {user?.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{user?.name}</span>
                                                    <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-slate-300">{c.comment_text}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                                {comments.length === 0 && <div className="text-sm text-gray-400 italic">No comments yet</div>}
                            </div>
                            <form onSubmit={handleSubmitComment} className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${currentUser.avatar_color}`}>
                                    {currentUser.name.charAt(0)}
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-slate-950/50 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="Write a comment..."
                                    />
                                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="w-full md:w-80 p-8 bg-gray-50/50 dark:bg-slate-950/30">
                        <div className="space-y-6">
                            <MetaBlock label="Status">
                                <select
                                    value={task.status}
                                    onChange={(e) => onUpdate({ status: e.target.value as TaskStatus })}
                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                >
                                    <option value="TODO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="DONE">Done</option>
                                </select>
                            </MetaBlock>

                            <MetaBlock label="Priority">
                                <select
                                    value={task.priority}
                                    onChange={(e) => onUpdate({ priority: e.target.value as Priority })}
                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </MetaBlock>

                            <MetaBlock label="Due Date">
                                <input
                                    type="date"
                                    value={task.deadline}
                                    onChange={(e) => onUpdate({ deadline: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </MetaBlock>

                            {/* Created/Updated Info */}
                            <div className="pt-6 border-t border-gray-200 dark:border-slate-800 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Created</span>
                                    <span className="text-gray-600 dark:text-slate-400">{new Date(task.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Updated</span>
                                    <span className="text-gray-600 dark:text-slate-400">{new Date(task.updated_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
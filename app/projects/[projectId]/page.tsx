'use client'

import {
    ArrowUpCircle,
    CalendarRange,
    Eye,
    EyeOff,
    Filter,
    GanttChartSquare,
    Inbox,
    LayoutGrid,
    List as ListIcon,
    Plus,
    Search,
    Settings
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Task, ViewMode } from '../../../types';

import TaskModal from '../../../components/tasks/TaskModal';
import CalendarView from '../../../components/views/CalendarView';
import KanbanView from '../../../components/views/KanbanBoard';
import ListView from '../../../components/views/ListView';
import PriorityBoard from '../../../components/views/PriorityBoard';
import TimelineView from '../../../components/views/TimelineView';

export default function ProjectPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = Number(params.projectId);

    const {
        projects, tasks, users, currentUser, comments, taskHistory,
        addTask, updateTask, deleteTask, addComment,
        showToast
    } = useApp();

    // UI State
    const [viewMode, setViewMode] = useState<ViewMode>('BOARD');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
    const [showSubtasks, setShowSubtasks] = useState(false);
    const [showInbox, setShowInbox] = useState(false);

    // Validation
    const project = projects.find(p => p.p_id === projectId && !p.is_deleted);

    useEffect(() => {
        if (!project && projects.length > 0) {
            // Only redirect if projects are loaded and this one is missing
            // router.push('/'); // Optional: redirect if project not found
        }
    }, [project, projects, router]);

    if (!project) return <div className="p-8 text-center text-gray-400">Project not found</div>;

    // Filter Tasks
    const projectTasks = tasks.filter(t =>
        t.p_id === projectId &&
        !t.is_deleted &&
        (showSubtasks || viewMode === 'CALENDAR' || viewMode === 'TIMELINE' ? true : t.parent_task_id === null) &&
        (priorityFilter === 'ALL' || t.priority === priorityFilter) &&
        (t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.priority.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const inboxTasks = tasks.filter(t =>
        t.p_id === projectId &&
        !t.is_deleted &&
        (!t.deadline || t.deadline === "")
    );

    // Handlers
    const handleTaskClick = (t: Task) => {
        setSelectedTask(t);
        setIsTaskModalOpen(true);
    };

    const handleCreateTask = async (newTaskProps: Partial<Task> = {}) => {
        const taskPayload = {
            p_id: projectId,
            parent_task_id: newTaskProps.parent_task_id || null,
            name: newTaskProps.name || "New Task",
            description: "",
            position: 0,
            status: newTaskProps.status || "TODO",
            priority: newTaskProps.priority || "MEDIUM",
            deadline: newTaskProps.deadline !== undefined ? newTaskProps.deadline : formatDate(new Date()),
            changed_by: currentUser?.id,
        };
        await addTask(taskPayload);
    };

    function formatDate(date: Date) {
        return date.toISOString().split('T')[0];
    }

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50/50 dark:bg-slate-950/50">
            {/* Header / Toolbar - Responsive */}
            <div className="min-h-16 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between px-6 py-4 sm:py-0 bg-white dark:bg-slate-900 shrink-0 gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-none">{project.name}</h2>
                    <Link 
                        href={`/projects/${projectId}/settings`} 
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hidden sm:block" 
                        title="Project Settings"
                    >
                        <Settings size={18} />
                    </Link>
                    <div className="h-4 w-[1px] bg-gray-300 dark:bg-slate-700 mx-2 hidden sm:block"></div>

                    {/* View Toggles */}
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg shrink-0">
                        <button onClick={() => setViewMode('BOARD')} className={`p-1.5 rounded transition-all ${viewMode === 'BOARD' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`} title="Board View"><LayoutGrid size={16} /></button>
                        <button onClick={() => setViewMode('LIST')} className={`p-1.5 rounded transition-all ${viewMode === 'LIST' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`} title="List View"><ListIcon size={16} /></button>
                        <button onClick={() => setViewMode('CALENDAR')} className={`p-1.5 rounded transition-all ${viewMode === 'CALENDAR' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`} title="Calendar View"><CalendarRange size={16} /></button>
                        <button onClick={() => setViewMode('PRIORITY')} className={`p-1.5 rounded transition-all ${viewMode === 'PRIORITY' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`} title="Priority Board"><ArrowUpCircle size={16} /></button>
                        <button onClick={() => setViewMode('TIMELINE')} className={`p-1.5 rounded transition-all ${viewMode === 'TIMELINE' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`} title="Planner / Timeline"><GanttChartSquare size={16} /></button>
                    </div>

                    {/* Subtask Toggle */}
                    {viewMode !== 'TIMELINE' && (
                        <button
                            onClick={() => setShowSubtasks(!showSubtasks)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${showSubtasks ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
                        >
                            {showSubtasks ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Inbox Toggle */}
                    {viewMode === 'TIMELINE' && (
                        <button
                            onClick={() => setShowInbox(!showInbox)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border
                            ${showInbox ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'}`}
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

                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="pl-9 pr-4 py-1.5 text-sm bg-gray-100 dark:bg-slate-800 border-none rounded-md focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-44 lg:w-64 dark:text-white"
                        />
                    </div>

                    {viewMode !== 'CALENDAR' && (
                        <button
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            onClick={() => handleCreateTask({ name: "New Task" })}
                        >
                            <Plus size={16} /> Add
                        </button>
                    )}
                </div>
            </div>

            {/* View Content */}
            <div className="flex-1 overflow-hidden relative">
                {viewMode === 'BOARD' && (
                    <KanbanView
                        tasks={projectTasks}
                        onTaskClick={handleTaskClick}
                        onUpdateTask={updateTask}
                        onDeleteTask={deleteTask}
                    />
                )}
                {viewMode === 'LIST' && (
                    <ListView
                        tasks={projectTasks}
                        allTasks={tasks}
                        onTaskClick={handleTaskClick}
                        onDeleteTask={deleteTask}
                    />
                )}
                {viewMode === 'CALENDAR' && (
                    <CalendarView
                        tasks={projectTasks}
                        onTaskClick={handleTaskClick}
                        onDeleteTask={deleteTask}
                        onUpdateTask={updateTask}
                        onCreateTask={(dateStr) => handleCreateTask({ deadline: dateStr })}
                    />
                )}
                {viewMode === 'TIMELINE' && (
                    <TimelineView
                        tasks={projectTasks}
                        onTaskClick={handleTaskClick}
                        onDeleteTask={deleteTask}
                        onUpdateTask={updateTask}
                        onCreateTask={handleCreateTask}
                        showInbox={showInbox}
                        onToggleInbox={() => setShowInbox(!showInbox)}
                    />
                )}
                {viewMode === 'PRIORITY' && (
                    <PriorityBoard
                        tasks={projectTasks}
                        onTaskClick={handleTaskClick}
                        onUpdateTask={updateTask}
                        onDeleteTask={deleteTask}
                    />
                )}
            </div>

            <TaskModal
                isOpen={isTaskModalOpen}
                task={selectedTask}
                onClose={() => setIsTaskModalOpen(false)}
                onUpdate={(updates) => {
                    if (selectedTask) {
                        setSelectedTask({ ...selectedTask, ...updates });
                    }
                }}
                onDelete={() => {
                    selectedTask && deleteTask(selectedTask.t_id);
                    setIsTaskModalOpen(false);
                }}
                onAddComment={(text) => selectedTask && addComment(selectedTask.t_id, text)}
                comments={selectedTask ? comments.filter(c => c.t_id === selectedTask.t_id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : []}
                history={selectedTask ? taskHistory.filter(h => h.t_id === selectedTask.t_id) : []}
                users={users}
                currentUser={currentUser}
                subtasks={selectedTask ? tasks.filter(t => t.parent_task_id === selectedTask.t_id && !t.is_deleted) : []}
                onCreateSubtask={(name) => selectedTask && addTask({
                    p_id: projectId,
                    parent_task_id: selectedTask.t_id,
                    name,
                    status: "TODO",
                    priority: "LOW",
                    position: 0,
                })}
                onSave={async (updates) => {
                    if (selectedTask) {
                        await updateTask(selectedTask.t_id, updates);
                        setIsTaskModalOpen(false);
                    }
                }}
            />
        </div>
    )
}

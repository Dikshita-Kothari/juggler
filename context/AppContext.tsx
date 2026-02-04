'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SEED_COMMENTS, SEED_HISTORY, SEED_MEMBERS, SEED_PROJECTS, SEED_TASKS, SEED_USERS } from '../lib/data';
import { Project, ProjectMember, Task, TaskComment, TaskHistory, Toast, User } from '../types';

interface AppContextType {
    users: User[];
    currentUser: User;
    setCurrentUser: (user: User) => void;
    projects: Project[];
    members: ProjectMember[];
    tasks: Task[];
    comments: TaskComment[];
    history: TaskHistory[];
    toasts: Toast[];
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

    // Actions
    addProject: (p: Project) => void;
    updateProject: (p: Project) => void;
    deleteProject: (pid: number) => void;

    addTask: (t: Task) => void;
    updateTask: (tid: number, updates: Partial<Task>) => void;
    deleteTask: (tid: number) => void;

    addComment: (t_id: number, text: string) => void;
    updateUser: (u: User) => void;

    darkMode: boolean;
    setDarkMode: (mode: boolean) => void;

    // UI State
    isProjectModalOpen: boolean;
    setIsProjectModalOpen: (isOpen: boolean) => void;
    isProfileModalOpen: boolean;
    setIsProfileModalOpen: (isOpen: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [users, setUsers] = useState<User[]>(SEED_USERS);
    const [currentUser, setCurrentUser] = useState<User>(SEED_USERS[0]);
    const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
    const [members, setMembers] = useState<ProjectMember[]>(SEED_MEMBERS);
    const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
    const [comments, setComments] = useState<TaskComment[]>(SEED_COMMENTS);
    const [history, setHistory] = useState<TaskHistory[]>(SEED_HISTORY);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [darkMode, setDarkMode] = useState(false);

    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // --- EFFECT: DARK MODE ---
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

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

    const addProject = (p: Project) => {
        setProjects(prev => [...prev, p]);
        setMembers(prev => [...prev, { p_id: p.p_id, u_id: currentUser.u_id, role: 'OWNER' }]);
    };

    const updateProject = (p: Project) => {
        setProjects(prev => prev.map(proj => proj.p_id === p.p_id ? p : proj));
    };

    const deleteProject = (p_id: number) => {
        setProjects(prev => prev.map(p => p.p_id === p_id ? { ...p, is_deleted: true } : p));
    };

    const addTask = (t: Task) => {
        setTasks(prev => [...prev, t]);
        logHistory(t.t_id, "CREATED", null, t.name);
    };

    const updateTask = (t_id: number, updates: Partial<Task>) => {
        const oldTask = tasks.find(t => t.t_id === t_id);
        if (!oldTask) return;

        setTasks(prev => prev.map(t => t.t_id === t_id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));

        if (updates.status && updates.status !== oldTask.status) {
            logHistory(t_id, "STATUS_CHANGE", oldTask.status, updates.status);
        }
        if (updates.priority && updates.priority !== oldTask.priority) {
            logHistory(t_id, "PRIORITY_CHANGE", oldTask.priority, updates.priority);
        }
    };

    const deleteTask = (t_id: number) => {
        setTasks(prev => prev.map(t => (t.t_id === t_id || t.parent_task_id === t_id) ? { ...t, is_deleted: true } : t));
    };

    const addComment = (t_id: number, text: string) => {
        const c_id = Math.max(0, ...comments.map(c => c.comment_id)) + 1;
        setComments(prev => [...prev, {
            comment_id: c_id,
            t_id,
            u_id: currentUser.u_id,
            comment_text: text,
            created_at: new Date().toLocaleString()
        }]);
    };

    const updateUser = (u: User) => {
        setUsers(prev => prev.map(usr => usr.u_id === u.u_id ? u : usr));
        if (currentUser.u_id === u.u_id) setCurrentUser(u);
    };

    return (
        <AppContext.Provider value={{
            users, currentUser, setCurrentUser,
            projects, members, tasks, comments, history, toasts,
            showToast, addProject, updateProject, deleteProject,
            addTask, updateTask, deleteTask, addComment, updateUser,
            darkMode, setDarkMode,
            isProjectModalOpen, setIsProjectModalOpen,
            isProfileModalOpen, setIsProfileModalOpen
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}

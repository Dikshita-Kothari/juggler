'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Project, ProjectMember, Task, TaskComment, TaskHistory, Toast, User } from '../types';
import { useSession } from 'next-auth/react';

interface AppContextType {
    users: User[];
    currentUser: User | null;
    projects: Project[];
    members: ProjectMember[];
    tasks: Task[];
    comments: TaskComment[];
    taskHistory: TaskHistory[];
    toasts: Toast[];
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

    // Actions
    addProject: (name: string, description: string, deadline: string) => Promise<void>;
    updateProject: (p: Project) => Promise<void>;
    deleteProject: (pid: number) => Promise<void>;
    archiveProject: (pid: number, is_archived: boolean) => Promise<void>;

    addTask: (t: Partial<Task>) => Promise<void>;
    updateTask: (tid: number, updates: Partial<Task>) => Promise<void>;
    deleteTask: (tid: number) => Promise<void>;

    addComment: (t_id: number, text: string) => Promise<void>;
    updateUser: (u: User) => Promise<void>;

    darkMode: boolean;
    setDarkMode: (mode: boolean) => void;

    // UI State
    isProjectModalOpen: boolean;
    setIsProjectModalOpen: (isOpen: boolean) => void;
    isProfileModalOpen: boolean;
    setIsProfileModalOpen: (isOpen: boolean) => void;
    isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    
    // State
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [darkMode, setDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    
    // Sync currentUser with Session
    useEffect(() => {
        if (session?.user) {
            setCurrentUser({
                id: session.user.id as string,
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                username: (session.user as any).username || '',
                avatar_color: (session.user as any).avatar_color || 'bg-blue-600'
            });
        } else {
            setCurrentUser(null);
        }
    }, [session]);

    // --- INITIAL FETCH ---
    useEffect(() => {
        if (session) {
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [session]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [projRes, taskRes] = await Promise.all([
                fetch('/api/projects'),
                fetch('/api/tasks')
            ]);
            
            if (projRes.ok) setProjects(await projRes.json());
            if (taskRes.ok) {
                const allTasks = await taskRes.json();
                setTasks(allTasks);
                // Flatten nested relations into global state for easier UI access
                setComments(allTasks.flatMap((t: any) => t.comments || []));
                setTaskHistory(allTasks.flatMap((t: any) => t.history || []));
            }
        } catch (error) {
            showToast("Failed to load workspace data", "error");
        } finally {
            setIsLoading(false);
        }
    };

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

    // --- ACTIONS ---

    const jsonHeaders = { 'Content-Type': 'application/json' };

    const addProject = async (name: string, description: string, deadline: string) => {
        if (!currentUser) return;
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify({ name, description, deadline, u_id: currentUser.id })
            });
            if (res.ok) {
                const newProj = await res.json();
                setProjects(prev => [...prev, newProj]);
                showToast("Project created successfully");
            } else {
                const err = await res.json();
                console.error("Create project failed:", err);
                showToast("Error creating project", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Error creating project", "error");
        }
    };

    const updateProject = async (p: Project) => {
        try {
            const { p_id, u_id, created_at, updated_at, members, tasks, creator, ...cleanUpdates } = p as any;
            const res = await fetch(`/api/projects/${p.p_id}`, {
                method: 'PATCH',
                headers: jsonHeaders,
                body: JSON.stringify(cleanUpdates)
            });
            if (res.ok) {
                const updated = await res.json();
                setProjects(prev => prev.map(proj => proj.p_id === p.p_id ? updated : proj));
                showToast("Project updated");
            } else {
                showToast("Update failed", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Update failed", "error");
        }
    };

    const archiveProject = async (p_id: number, is_archived: boolean) => {
        try {
            const res = await fetch(`/api/projects/${p_id}`, {
                method: 'PATCH',
                headers: jsonHeaders,
                body: JSON.stringify({ is_archived })
            });
            if (res.ok) {
                const updated = await res.json();
                setProjects(prev => prev.map(proj => proj.p_id === p_id ? updated : proj));
                showToast(is_archived ? "Project archived" : "Project restored");
            }
        } catch (error) {
            showToast("Archive failed", "error");
        }
    };

    const deleteProject = async (p_id: number) => {
        try {
            const res = await fetch(`/api/projects/${p_id}`, { method: 'DELETE' });
            if (res.ok) {
                setProjects(prev => prev.filter(p => p.p_id !== p_id));
                showToast("Project deleted", "error");
            }
        } catch (error) {
            showToast("Deletion failed", "error");
        }
    };

    const addTask = async (taskData: Partial<Task>) => {
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify(taskData)
            });
            if (res.ok) {
                const newTask = await res.json();
                setTasks(prev => [...prev, newTask]);
                showToast("Task added");
            } else {
                const err = await res.json();
                console.error("Create task failed:", err);
                showToast("Failed to add task", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to add task", "error");
        }
    };

    const updateTask = async (t_id: number, updates: Partial<Task>) => {
        try {
            // Remove fields that should not be updated directly in Prisma
            const { t_id: _, created_at, updated_at, ...cleanUpdates } = updates as any;
            
            const res = await fetch(`/api/tasks/${t_id}`, {
                method: 'PATCH',
                headers: jsonHeaders,
                body: JSON.stringify({ ...cleanUpdates, changed_by: currentUser?.id })
            });
            if (res.ok) {
                const updated = await res.json();
                setTasks(prev => prev.map(t => t.t_id === t_id ? updated : t));
                showToast("Task updated");
            } else {
                const err = await res.json();
                console.error("Update task failed:", err);
                showToast("Update failed", "error");
            }
        } catch (error) {
            console.error("Update task error:", error);
            showToast("Task update failed", "error");
        }
    };

    const deleteTask = async (t_id: number) => {
        try {
            const res = await fetch(`/api/tasks/${t_id}`, { method: 'DELETE' });
            if (res.ok) {
                setTasks(prev => prev.filter(t => t.t_id !== t_id));
                showToast("Task deleted");
            }
        } catch (error) {
            showToast("Deletion failed", "error");
        }
    };

    const addComment = async (t_id: number, text: string) => {
        try {
            const res = await fetch(`/api/tasks/${t_id}/comments`, {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify({ text })
            });

            if (res.ok) {
                const newComment = await res.json();
                setComments(prev => [newComment, ...prev]);
                showToast("Comment added");
            }
        } catch (error) {
            showToast("Failed to add comment", "error");
        }
    };

    const updateUser = async (u: Partial<User>) => {
        try {
            const res = await fetch('/api/users/profile', {
                method: 'PATCH',
                headers: jsonHeaders,
                body: JSON.stringify(u)
            });
            if (res.ok) {
                const updated = await res.json();
                setCurrentUser(updated);
                showToast("Profile updated successfully", "success");
            } else {
                const err = await res.json();
                showToast(err.error || "Update failed", "error");
            }
        } catch (error) {
            console.error("Update user error:", error);
            showToast("Network error updating profile", "error");
        }
    };

    return (
        <AppContext.Provider value={{
            users, currentUser,
            projects, members, tasks, comments, taskHistory, toasts,
            showToast, addProject, updateProject, deleteProject, archiveProject,
            addTask, updateTask, deleteTask, addComment, updateUser,
            darkMode, setDarkMode,
            isProjectModalOpen, setIsProjectModalOpen,
            isProfileModalOpen, setIsProfileModalOpen,
            isLoading
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

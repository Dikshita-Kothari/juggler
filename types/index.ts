export type Role = 'OWNER' | 'MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ViewMode = 'BOARD' | 'LIST' | 'CALENDAR' | 'PRIORITY' | 'TIMELINE';
export type TimelineScale = 'MONTH' | 'WEEK' | 'DAY';

export interface User {
    u_id: number;
    name: string;
    username: string;
    email: string;
    avatar_color: string;
}

export interface Project {
    p_id: number;
    u_id: number; // Creator
    name: string;
    description: string;
    deadline: string;
    created_at: string;
    is_deleted: boolean;
}

export interface ProjectMember {
    p_id: number;
    u_id: number;
    role: Role;
}

export interface Task {
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

export interface TaskComment {
    comment_id: number;
    t_id: number;
    u_id: number;
    comment_text: string;
    created_at: string;
}

export interface TaskHistory {
    history_id: number;
    t_id: number;
    changed_by: number;
    action_type: string;
    old_value: string | null;
    new_value: string | null;
    created_at: string;
}

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

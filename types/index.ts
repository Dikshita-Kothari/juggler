export type Role = 'OWNER' | 'MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ViewMode = 'BOARD' | 'LIST' | 'CALENDAR' | 'PRIORITY' | 'TIMELINE';
export type TimelineScale = 'MONTH' | 'WEEK' | 'DAY';

export interface User {
    id: string; // Changed from u_id (number) to id (string) for NextAuth compatibility
    name?: string | null;
    username?: string | null;
    email?: string | null;
    emailVerified?: string | null;
    image?: string | null;
    avatar_color?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Project {
    p_id: number;
    u_id: string; // Updated to String ID
    name: string;
    description: string;
    deadline: string;
    created_at: string;
    updated_at?: string;
    is_deleted: boolean;
    is_archived: boolean;
}

export interface ProjectMember {
    p_id: number;
    u_id: string;
    role: Role;
}

export interface MembershipHistory {
    mh_id: number;
    p_id: number;
    u_id: string;
    changed_by: string;
    action_type: 'ADDED' | 'REMOVED' | 'ROLE_CHANGED';
    old_role: Role | null;
    new_role: Role | null;
    created_at: string;
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
    start_time?: string; // e.g. "09:00"
    end_time?: string;   // e.g. "10:30"
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
}

export interface TaskComment {
    comment_id: number;
    t_id: number;
    u_id: string;
    comment_text: string;
    created_at: string;
    updated_at?: string;
    is_deleted?: boolean;
}

export interface TaskHistory {
    history_id: number;
    t_id: number;
    p_id: number;
    changed_by: string;
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

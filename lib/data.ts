import { Project, ProjectMember, Task, TaskComment, TaskHistory, User } from "../types";

export const SEED_USERS: User[] = [
    { u_id: 1, name: "Alex Admin", username: "alex", email: "alex@juggler.app", avatar_color: "bg-blue-500" },
    { u_id: 2, name: "Sarah Dev", username: "sarah", email: "sarah@juggler.app", avatar_color: "bg-emerald-500" },
    { u_id: 3, name: "Mike Manager", username: "mike", email: "mike@juggler.app", avatar_color: "bg-purple-500" },
    { u_id: 4, name: "Emily Design", username: "emily", email: "emily@juggler.app", avatar_color: "bg-pink-500" },
];

export const SEED_PROJECTS: Project[] = [
    { p_id: 1, u_id: 1, name: "Juggler App V1", description: "Launch the MVP of the new todo app.", deadline: "2024-03-15", created_at: "2024-01-01", is_deleted: false },
    { p_id: 2, u_id: 1, name: "Marketing Q1", description: "Social media and ad campaigns.", deadline: "2024-04-01", created_at: "2024-01-05", is_deleted: false },
];

export const SEED_MEMBERS: ProjectMember[] = [
    { p_id: 1, u_id: 1, role: 'OWNER' },
    { p_id: 1, u_id: 2, role: 'MEMBER' },
    { p_id: 2, u_id: 1, role: 'OWNER' },
];

export const SEED_TASKS: Task[] = [
    { t_id: 1, p_id: 1, parent_task_id: null, name: "Design Database Schema", description: "Create SQL tables for users, projects, and tasks.", position: 1, status: "DONE", priority: "HIGH", to_do_date: "2024-02-01", deadline: "2024-02-05", created_at: "2024-01-10", updated_at: "2024-01-11", is_deleted: false },
    { t_id: 2, p_id: 1, parent_task_id: null, name: "Frontend Setup", description: "Initialize Next.js and Tailwind.", position: 2, status: "IN_PROGRESS", priority: "MEDIUM", to_do_date: "2024-02-03", deadline: "2024-02-10", created_at: "2024-01-12", updated_at: "2024-01-13", is_deleted: false },
    { t_id: 3, p_id: 1, parent_task_id: null, name: "API Routes", description: "Implement CRUD endpoints.", position: 3, status: "TODO", priority: "HIGH", to_do_date: "2024-02-08", deadline: "2024-02-15", created_at: "2024-01-15", updated_at: "2024-01-15", is_deleted: false },
    { t_id: 4, p_id: 2, parent_task_id: null, name: "Draft Ad Copy", description: "Write copy for Instagram ads.", position: 1, status: "TODO", priority: "LOW", to_do_date: "2024-02-05", deadline: "2024-02-07", created_at: "2024-01-20", updated_at: "2024-01-20", is_deleted: false },
    // Subtask example
    { t_id: 5, p_id: 1, parent_task_id: 2, name: "Install Shadcn UI", description: "Add button and card components", position: 1, status: "DONE", priority: "LOW", to_do_date: "2024-02-03", deadline: "2024-02-04", created_at: "2024-01-13", updated_at: "2024-01-13", is_deleted: false },
    // Unscheduled Task Example
    { t_id: 6, p_id: 1, parent_task_id: null, name: "Brainstorming Session", description: "Plan next features", position: 6, status: "TODO", priority: "MEDIUM", to_do_date: "", deadline: "", created_at: "2024-01-22", updated_at: "2024-01-22", is_deleted: false },
];

export const SEED_COMMENTS: TaskComment[] = [
    { comment_id: 1, t_id: 2, u_id: 2, comment_text: "I'll handle the Tailwind config.", created_at: "2024-01-13 10:00:00" }
];

export const SEED_HISTORY: TaskHistory[] = [
    { history_id: 1, t_id: 1, changed_by: 1, action_type: "STATUS_CHANGE", old_value: "IN_PROGRESS", new_value: "DONE", created_at: "2024-01-11 14:30:00" }
];

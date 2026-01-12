# Juggler
Juggler is a modern project and task management system designed to help individuals and teams efficiently plan, organize, and track their work. Unlike a simple To-Do list, Juggler provides a multi-user collaborative environment where users can create projects, assign tasks, track progress through multiple views (list, Kanban, dashboard, detailed task view), and maintain a complete audit trail of all actions.
The system supports role-based access, enabling project owners and members to interact according to permissions. Users can comment on tasks, edit them, and view task histories to improve accountability and collaboration. Soft-delete functionality ensures that projects and tasks can be archived instead of permanently removed, while system and business logs provide monitoring and debugging capabilities.
Juggler aims to streamline workflow, enhance team productivity, and provide detailed insights into project and task management, making it suitable for both academic and professional project planning scenarios.

# Features of Juggler

## A. User Management
User Registration & Login
Users can securely register with username, email, and password.
Users can log in and log out of the system.
Profile Management
Users can view and update their profile information (name, email, username, password).
updated_at timestamp tracks profile changes.
Password Security
Passwords are stored securely using hashing.
## B. Project Management
Create Project
Users can create a new project with name, description, and deadline.
Edit Project
Users can update project details (name, description, deadline).
Soft Delete / Archive Project
Projects can be soft-deleted (is_deleted = TRUE) instead of permanent deletion.
Project Membership
Owners can add/remove members to/from a project.
Track membership changes in membership_history.
Roles assigned as OWNER or MEMBER.
## C. Task Management
Create Task
Users can create tasks within a project.
Tasks can have a parent task (parent_task_id) to support subtasks.
Edit Task
Update task name, description, status, priority, deadline, and to_do_date.
updated_at timestamp records last modification.
Delete / Archive Task
Soft-delete tasks (is_deleted = TRUE).
Task Hierarchy
Support subtasks and task ordering (position).
Task History
Every task action is recorded in task_history with old_value and new_value.
Task Comments
Users can add comments to tasks.
Comments can be edited (updated_at) and soft-deleted (is_deleted).
## D. Views & UI
Dashboard View
Overview of projects, tasks, and deadlines.
List View
Display tasks in a structured list format.
Kanban Board
Visual task tracking based on status (TODO, IN_PROGRESS, DONE).
Detailed Task View
Show full task details, subtasks, comments, and history.
## E. Search & Filtering
Task Search
Users can search tasks by name, status, priority, or deadline.
Project Filtering
Filter projects by deadline, ownership, or member participation.
## F. Logs & Auditing
Task Logs
Actions like status changes, edits, and assignments are stored in task_history.
Membership Logs
Track additions, removals, and role changes in membership_history.
System Logs

Optional file-based logs for debugging and monitoring server activity.

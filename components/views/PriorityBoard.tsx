'use client'

import { Task } from '../../types';
import { KanbanColumn } from './KanbanBoard';

export default function PriorityBoard({ tasks, onTaskClick, onUpdateTask, onDeleteTask }: {
    tasks: Task[],
    onTaskClick: (t: Task) => void,
    onUpdateTask: (id: number, updates: Partial<Task>) => void,
    onDeleteTask: (id: number) => void
}) {
    const highTasks = tasks.filter(t => t.priority === 'HIGH');
    const mediumTasks = tasks.filter(t => t.priority === 'MEDIUM');
    const lowTasks = tasks.filter(t => t.priority === 'LOW');

    return (
        <div className="flex h-full overflow-x-auto p-6 gap-6 bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
            <KanbanColumn
                title="High Priority"
                status="HIGH"
                tasks={highTasks}
                allTasks={tasks}
                onTaskClick={onTaskClick}
                onDrop={(id) => onUpdateTask(id, { priority: 'HIGH' })}
                onDelete={onDeleteTask}
            />
            <KanbanColumn
                title="Medium Priority"
                status="MEDIUM"
                tasks={mediumTasks}
                allTasks={tasks}
                onTaskClick={onTaskClick}
                onDrop={(id) => onUpdateTask(id, { priority: 'MEDIUM' })}
                onDelete={onDeleteTask}
            />
            <KanbanColumn
                title="Low Priority"
                status="LOW"
                tasks={lowTasks}
                allTasks={tasks}
                onTaskClick={onTaskClick}
                onDrop={(id) => onUpdateTask(id, { priority: 'LOW' })}
                onDelete={onDeleteTask}
            />
        </div>
    );
}

'use client'

import {
    Calendar,
    CheckSquare,
    CornerDownRight,
    Trash2
} from 'lucide-react';
import React from 'react';
import { Task, TaskStatus } from '../../types';

export function KanbanColumn({ title, status, tasks, allTasks, onTaskClick, onDrop, onDelete }: {
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
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 flex gap-1 bg-white dark:bg-slate-800 shadow-sm rounded border dark:border-slate-700">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(task.t_id); }}
                                        className="p-1 hover:text-red-500 text-gray-400"
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
                                    {subtasks.length > 0 && (
                                        <div className="flex items-center gap-1.5" title={`${completedSubtasks}/${subtasks.length} subtasks completed`}>
                                            <CheckSquare size={12} />
                                            <span>{completedSubtasks}/{subtasks.length}</span>
                                        </div>
                                    )}
                                </div>
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

export default function KanbanView({ tasks, onTaskClick, onUpdateTask, onDeleteTask }: {
    tasks: Task[],
    onTaskClick: (t: Task) => void,
    onUpdateTask: (id: number, status: TaskStatus) => void,
    onDeleteTask: (id: number) => void
}) {
    const todoTasks = tasks.filter(t => t.status === 'TODO');
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
    const doneTasks = tasks.filter(t => t.status === 'DONE');

    return (
        <div className="flex h-full overflow-x-auto p-6 gap-6 bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
            <KanbanColumn
                title="To Do"
                status="TODO"
                tasks={todoTasks}
                allTasks={tasks}
                onTaskClick={onTaskClick}
                onDrop={(id) => onUpdateTask(id, 'TODO')}
                onDelete={onDeleteTask}
            />
            <KanbanColumn
                title="In Progress"
                status="IN_PROGRESS"
                tasks={inProgressTasks}
                allTasks={tasks}
                onTaskClick={onTaskClick}
                onDrop={(id) => onUpdateTask(id, 'IN_PROGRESS')}
                onDelete={onDeleteTask}
            />
            <KanbanColumn
                title="Done"
                status="DONE"
                tasks={doneTasks}
                allTasks={tasks}
                onTaskClick={onTaskClick}
                onDrop={(id) => onUpdateTask(id, 'DONE')}
                onDelete={onDeleteTask}
            />
        </div>
    );
}

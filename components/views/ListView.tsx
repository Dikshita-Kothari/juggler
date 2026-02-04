'use client'

import {
    CheckSquare,
    CornerDownRight,
    Trash2
} from 'lucide-react';
import { useMemo } from 'react';
import { Task } from '../../types';

export default function ListView({
    tasks,
    allTasks,
    onTaskClick,
    onDeleteTask
}: {
    tasks: Task[],
    allTasks: Task[],
    onTaskClick: (t: Task) => void,
    onDeleteTask: (id: number) => void
}) {
    const listTasks = useMemo(() => {
        const taskMap = new Map(tasks.map(t => [t.t_id, t]));
        const roots = tasks.filter(t => !t.parent_task_id || !taskMap.has(t.parent_task_id));
        const childrenMap = new Map<number, Task[]>();
        tasks.forEach(t => {
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
    }, [tasks]);

    return (
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
                            const subtasks = allTasks.filter(t => t.parent_task_id === task.t_id && !t.is_deleted);
                            const completedSub = subtasks.filter(t => t.status === 'DONE').length;
                            const isSubtask = !!task.parent_task_id;
                            const parentVisible = isSubtask && listTasks.some(t => t.t_id === task.parent_task_id);

                            return (
                                <tr
                                    key={task.t_id}
                                    onClick={() => onTaskClick(task)}
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
                                            onClick={(e) => { e.stopPropagation(); onDeleteTask(task.t_id); }}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                        {tasks.length === 0 && (
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
    );
}

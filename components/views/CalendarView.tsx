'use client'

import {
    ChevronLeft,
    ChevronRight,
    CornerDownRight,
    Plus,
    Trash2
} from 'lucide-react';
import React from 'react';
import { Task } from '../../types';

export default function CalendarView({
    tasks,
    onTaskClick,
    onDeleteTask,
    onUpdateTask,
    onCreateTask
}: {
    tasks: Task[],
    onTaskClick: (t: Task) => void,
    onDeleteTask: (id: number) => void,
    onUpdateTask: (id: number, updates: Partial<Task>) => void,
    onCreateTask: (dateStr: string) => void
}) {
    const [currentCalendarDate, setCurrentCalendarDate] = React.useState(new Date());
    const [selectedDay, setSelectedDay] = React.useState(new Date());

    const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay, month, year };
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentCalendarDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentCalendarDate(newDate);
    };

    return (
        <div className="flex h-full">
            {/* Left: Calendar Grid */}
            <div className="flex-1 flex flex-col p-6 pr-0 overflow-hidden">
                <div className="flex items-center justify-between mb-6 pr-6">
                    <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex bg-white dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700">
                            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 border-r border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"><ChevronLeft size={16} /></button>
                            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col">
                    <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-800">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="p-3 text-center text-xs font-semibold text-gray-500 uppercase">{day}</div>
                        ))}
                    </div>
                    <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                        {(() => {
                            const { days, firstDay, year, month } = getDaysInMonth(currentCalendarDate);
                            const cells = [];
                            for (let i = 0; i < firstDay; i++) {
                                cells.push(<div key={`empty-${i}`} className="border-r border-b border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/50"></div>);
                            }
                            for (let d = 1; d <= days; d++) {
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                const dayTasks = tasks.filter(t => t.deadline === dateStr);
                                const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
                                const isSelected = selectedDay.toDateString() === new Date(year, month, d).toDateString();

                                cells.push(
                                    <div
                                        key={d}
                                        onClick={() => setSelectedDay(new Date(year, month, d))}
                                        className={`border-r border-b border-gray-100 dark:border-slate-800 p-2 min-h-[100px] cursor-pointer transition-colors relative flex flex-col
                                        ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/20 ring-2 ring-inset ring-blue-500 z-10' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'}
                                        ${isToday && !isSelected ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full 
                                            ${isToday ? 'bg-blue-600 text-white' : isSelected ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {d}
                                            </div>
                                        </div>

                                        <div className="flex-1 flex items-center justify-center">
                                            {dayTasks.length > 0 && (
                                                <div className="flex flex-col items-center">
                                                    <div className={`text-xl font-bold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                                        {dayTasks.length}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 uppercase font-medium tracking-wider">
                                                        {dayTasks.length === 1 ? 'Task' : 'Tasks'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }
                            return cells;
                        })()}
                    </div>
                </div>
            </div>

            {/* Right: Day Detail Panel */}
            <div className="w-72 my-6 mr-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col overflow-hidden shrink-0">
                <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                    <div className="text-lg font-bold mb-1 text-gray-900 dark:text-white">
                        {selectedDay.toLocaleDateString(undefined, { weekday: 'long' })}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                        {selectedDay.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {tasks.filter(t => t.deadline === formatDate(selectedDay)).map(t => (
                        <div
                            key={t.t_id}
                            onClick={() => onTaskClick(t)}
                            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${t.priority === 'HIGH' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                    }`}>
                                    {t.priority}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteTask(t.t_id); }}
                                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className={`text-sm font-medium mb-1 ${t.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{t.name}</div>
                            {t.parent_task_id && (
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                    <CornerDownRight size={10} /> Subtask
                                </div>
                            )}
                        </div>
                    ))}

                    {tasks.filter(t => t.deadline === formatDate(selectedDay)).length === 0 && (
                        <div className="text-center py-8 text-gray-400 dark:text-slate-600 text-sm italic">
                            No tasks for this day
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-slate-800">
                    <button
                        onClick={() => onCreateTask(formatDate(selectedDay))}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> Add Task
                    </button>
                </div>
            </div>
        </div>
    );
}

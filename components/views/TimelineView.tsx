'use client'

import { Calendar, CheckCircle2, ChevronLeft, ChevronRight, CornerDownRight, GitMerge, GripVertical, Inbox, Plus, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { Task, TimelineScale } from '../../types';

function formatDate(date: Date) {
    return date.toISOString().split('T')[0];
}

function getDaysInMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    return { days, firstDay, year, month };
}

function getWeekDays(currentDate: Date) {
    const startOfWeek = new Date(currentDate);
    // Adjust to Monday start or Sunday start? Let's use Sunday start as per typical getDay()
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // adjust when day is sunday
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        days.push(d);
    }
    return days;
}

export default function TimelineView({ tasks, onTaskClick, onDeleteTask, onUpdateTask, onCreateTask, showInbox = false, onToggleInbox }: {
    tasks: Task[],
    onTaskClick: (t: Task) => void,
    onDeleteTask: (id: number) => void,
    onUpdateTask: (id: number, updates: Partial<Task>) => void,
    onCreateTask: (task: Partial<Task>) => void,
    showInbox?: boolean,
    onToggleInbox?: () => void
}) {
    const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
    const [timelineScale, setTimelineScale] = useState<TimelineScale>('WEEK');

    const inboxTasks = tasks.filter(t => !t.deadline && !t.is_deleted);
    const scheduledTasks = tasks.filter(t => t.deadline && !t.is_deleted);

    const [dropIndicator, setDropIndicator] = useState<{ top: number, time: string } | null>(null);

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentCalendarDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentCalendarDate(newDate);
    };

    const changeWeek = (delta: number) => {
        const newDate = new Date(currentCalendarDate);
        newDate.setDate(newDate.getDate() + (delta * 7));
        setCurrentCalendarDate(newDate);
    }

    const changeDay = (delta: number) => {
        const newDate = new Date(currentCalendarDate);
        newDate.setDate(newDate.getDate() + delta);
        setCurrentCalendarDate(newDate);
    }

    const handleDragStart = (e: React.DragEvent, id: number) => {
        e.dataTransfer.setData("t_id", id.toString());
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    }

    const handleDragOverGrid = (e: React.DragEvent) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const hour = Math.floor(y / 80);
        const minute = Math.floor(((y % 80) / 80) * 60);
        const snappedMinute = Math.round(minute / 15) * 15;

        const top = (hour * 80) + (snappedMinute / 60 * 80);
        const timeStr = `${String(hour % 24).padStart(2, '0')}:${String(snappedMinute % 60).padStart(2, '0')}`;

        setDropIndicator({ top, time: timeStr });
    }

    const handleDropOnInbox = (e: React.DragEvent) => {
        const t_id = Number(e.dataTransfer.getData("t_id"));
        if (!t_id) return;
        onUpdateTask(t_id, { deadline: "" });
        setDropIndicator(null);
    }

    const handleDropOnDate = (e: React.DragEvent, dateStr: string) => {
        const t_id = Number(e.dataTransfer.getData("t_id"));
        if (!t_id) return;
        onUpdateTask(t_id, { deadline: dateStr });
        setDropIndicator(null);
    }

    return (
        <div className="flex h-full overflow-hidden relative" onDragLeave={() => setDropIndicator(null)}>
            {/* INBOX SIDEBAR - FOR PLANNING - Responsive */}
            {showInbox && (
                <>
                    {/* Mobile Overlay for Inbox */}
                    <div 
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] lg:hidden"
                        onClick={onToggleInbox}
                    />
                    <div
                        className="fixed inset-y-0 left-0 lg:relative z-[60] lg:z-0 w-72 sm:w-80 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 animate-in slide-in-from-left duration-200 shadow-2xl lg:shadow-none"
                        onDragOver={handleDragOver}
                        onDrop={handleDropOnInbox}
                    >
                    <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-purple-50/50 dark:bg-purple-900/10">
                        <div className="flex items-center gap-2 font-bold text-purple-800 dark:text-purple-300">
                            <Inbox size={18} /> Backlog / Inbox
                        </div>
                        {onToggleInbox && <button onClick={onToggleInbox}><X size={16} className="text-purple-400 hover:text-purple-600" /></button>}
                    </div>
                    <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                        <button
                            onClick={() => onCreateTask({ name: "New Idea", deadline: "" })}
                            className="w-full py-2 border-2 border-dashed border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                        >
                            + Add Unscheduled Task
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {inboxTasks.map(t => {
                            const subtasks = tasks.filter(sub => sub.parent_task_id === t.t_id && !sub.is_deleted);
                            return (
                                <div
                                    key={t.t_id}
                                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 shadow-sm group cursor-grab active:cursor-grabbing hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, t.t_id)}
                                    onClick={() => onTaskClick(t)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-start gap-2">
                                            <GripVertical size={14} className="text-gray-300 mt-0.5" />
                                            <div className="text-sm font-medium cursor-pointer hover:text-blue-600 flex-1">
                                                {t.name}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <button
                                                className="p-1 text-gray-300 hover:text-blue-500"
                                                title="Schedule for Today"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onUpdateTask(t.t_id, { deadline: formatDate(new Date()) });
                                                }}
                                            >
                                                <Calendar size={14} />
                                            </button>
                                            <button
                                                className="p-1 text-gray-300 hover:text-red-500"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteTask(t.t_id);
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    {subtasks.length > 0 && (
                                        <div className="text-xs text-gray-400 mb-2 flex gap-1 items-center pl-5">
                                            <GitMerge size={12} /> {subtasks.length} subtasks
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        {inboxTasks.length === 0 && (
                            <div className="text-center text-xs text-gray-400 italic py-8">
                                Inbox empty. Great job!
                            </div>
                        )}
                    </div>
                </div>
            </>
        )}

            <div className="flex-1 flex flex-col p-4 sm:p-6 h-full overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 shrink-0 gap-4">
                    <div className="flex items-center gap-4 justify-between sm:justify-start">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                            {timelineScale === 'WEEK'
                                ? `Week of ${currentCalendarDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                                : timelineScale === 'DAY'
                                    ? currentCalendarDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
                                    : currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg shrink-0">
                            <button
                                onClick={() => setTimelineScale('MONTH')}
                                className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-all ${timelineScale === 'MONTH' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => setTimelineScale('WEEK')}
                                className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-all ${timelineScale === 'WEEK' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => setTimelineScale('DAY')}
                                className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-all ${timelineScale === 'DAY' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Day
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button onClick={() => timelineScale === 'MONTH' ? changeMonth(-1) : timelineScale === 'WEEK' ? changeWeek(-1) : changeDay(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full outline-none"><ChevronLeft size={18} /></button>
                        <button onClick={() => timelineScale === 'MONTH' ? changeMonth(1) : timelineScale === 'WEEK' ? changeWeek(1) : changeDay(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full outline-none"><ChevronRight size={18} /></button>
                    </div>
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col relative">

                    {/* WEEK VIEW ... (rest of the code follows) */}

                    {/* WEEK VIEW */}
                    {timelineScale === 'WEEK' && (
                        <div className="flex flex-col h-full">
                            <div className="overflow-x-auto overflow-y-hidden">
                                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 min-w-[600px]">
                                    {getWeekDays(currentCalendarDate).map((day, i) => {
                                        const isToday = new Date().toDateString() === day.toDateString();
                                        return (
                                            <div key={i} className={`p-2 sm:p-3 text-center border-r border-gray-200 dark:border-slate-800 last:border-0 ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                                                <div className={`text-[10px] font-bold uppercase mb-1 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                                                    {day.toLocaleDateString(undefined, { weekday: 'short' })}
                                                </div>
                                                <div className={`text-base sm:text-lg font-bold ${isToday ? 'text-blue-700' : ''}`}>
                                                    {day.getDate()}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto">
                                <div className="grid grid-cols-7 min-w-[600px] min-h-full">
                                {getWeekDays(currentCalendarDate).map((day, i) => {
                                    const dateStr = formatDate(day);
                                    const dayTasks = tasks.filter(t => t.deadline?.split('T')[0] === dateStr);
                                    const isToday = new Date().toDateString() === day.toDateString();

                                    return (
                                        <div
                                            key={i}
                                            className={`border-r border-gray-100 dark:border-slate-800 last:border-0 p-2 min-h-[200px] group transition-colors ${isToday ? 'bg-blue-50/10' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDropOnDate(e, dateStr)}
                                        >
                                            <div className="space-y-2 pointer-events-none">
                                                {dayTasks.map(t => (
                                                    <div
                                                        key={t.t_id}
                                                        onClick={() => onTaskClick(t)}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, t.t_id)}
                                                        className={`p-2 rounded-lg border text-xs shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all pointer-events-auto
                                                        ${t.status === 'DONE' ? 'bg-gray-50 border-gray-200 text-gray-400 line-through dark:bg-slate-800 dark:border-slate-700' :
                                                                t.priority === 'HIGH' ? 'bg-red-50 border-red-100 text-red-900 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-100' :
                                                                    'bg-white border-gray-200 text-gray-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'}`}
                                                    >
                                                        <div className="font-medium mb-1 line-clamp-2">{t.name}</div>
                                                        {t.parent_task_id && <div className="flex items-center gap-1 text-[10px] opacity-70"><CornerDownRight size={8} /> Subtask</div>}
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => onCreateTask({ deadline: dateStr, name: "New Task" })}
                                                    className="w-full py-1.5 rounded border border-dashed border-gray-200 dark:border-slate-700 text-gray-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all opacity-0 group-hover:opacity-100 flex justify-center pointer-events-auto"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MONTH GANTT VIEW */}
                    {timelineScale === 'MONTH' && (
                        <div className="grid grid-cols-[200px_1fr] border-b border-gray-200 dark:border-slate-800 h-full overflow-hidden">
                            {/* Sidebar */}
                            <div className="border-r border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 p-4 overflow-y-auto">
                                <div className="text-xs font-bold text-gray-500 uppercase mb-4">Task</div>
                                <div className="space-y-6">
                                    {scheduledTasks.map(t => (
                                        <div key={t.t_id} className="text-sm font-medium truncate h-6">{t.name}</div>
                                    ))}
                                </div>
                            </div>

                            {/* Chart Area */}
                            <div className="overflow-x-auto">
                                <div className="min-w-[800px] h-full flex flex-col">
                                    {/* Date Header */}
                                    <div className="flex border-b border-gray-200 dark:border-slate-800 relative">
                                        {(() => {
                                            const { days, year, month } = getDaysInMonth(currentCalendarDate);
                                            const headers = [];
                                            const today = new Date();
                                            const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

                                            for (let d = 1; d <= days; d++) {
                                                const isToday = isCurrentMonth && today.getDate() === d;
                                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

                                                headers.push(
                                                    <div
                                                        key={d}
                                                        onDragOver={handleDragOver}
                                                        onDrop={(e) => handleDropOnDate(e, dateStr)}
                                                        onClick={() => {
                                                            setCurrentCalendarDate(new Date(year, month, d));
                                                            setTimelineScale('DAY');
                                                        }}
                                                        className={`flex-1 min-w-[30px] text-center py-2 border-r border-gray-100 dark:border-slate-800/50 text-[10px] cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors
                                                        ${isToday ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 font-bold' : 'text-gray-500'}`}
                                                    >
                                                        {d}
                                                    </div>
                                                );
                                            }
                                            return headers;
                                        })()}
                                    </div>

                                    {/* Bars */}
                                    <div className="p-4 space-y-6 relative flex-1 overflow-y-auto">
                                        {/* Grid Lines */}
                                        <div className="absolute inset-0 top-0 pointer-events-none flex pl-4 h-full">
                                            {(() => {
                                                const { days, year, month } = getDaysInMonth(currentCalendarDate);
                                                const today = new Date();
                                                const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
                                                const lines = [];

                                                for (let d = 1; d <= days; d++) {
                                                    const isToday = isCurrentMonth && today.getDate() === d;
                                                    lines.push(
                                                        <div key={d} className={`flex-1 border-r h-full relative ${isToday ? 'bg-blue-50/20 dark:bg-blue-900/10' : 'border-gray-50 dark:border-slate-800/30'}`}>
                                                            {isToday && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500 z-10 opacity-50"></div>}
                                                        </div>
                                                    )
                                                }
                                                return lines;
                                            })()}
                                        </div>

                                        {scheduledTasks.map(t => {
                                            const { days, year, month } = getDaysInMonth(currentCalendarDate);
                                            const start = new Date(t.to_do_date || t.deadline); // fallback to deadline if todo not set
                                            const end = new Date(t.deadline);
                                            const monthStart = new Date(year, month, 1);

                                            // Validate dates
                                            if (isNaN(start.getTime()) || isNaN(end.getTime())) return <div key={t.t_id} className="h-6"></div>;

                                            // Simple position calculation
                                            let startDay = start.getDate();
                                            let duration = (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1; // +1 to include end day

                                            // Handle cross-month logic roughly
                                            if (end < monthStart) return <div key={t.t_id} className="h-6"></div>;

                                            if (start < monthStart) {
                                                // Task starts before this month
                                                const diffDays = (monthStart.getTime() - start.getTime()) / (1000 * 3600 * 24);
                                                startDay = 1;
                                                duration -= diffDays;
                                            }

                                            // Calc percentages relative to month length
                                            const widthPct = (duration / days) * 100;
                                            const leftPct = ((startDay - 1) / days) * 100;

                                            return (
                                                <div key={t.t_id} className="relative h-6 w-full z-10">
                                                    <div
                                                        className={`absolute h-5 rounded-md text-[10px] flex items-center px-2 text-white font-medium shadow-sm cursor-grab active:cursor-grabbing hover:brightness-110 transition-all
                                                         ${t.priority === 'HIGH' ? 'bg-red-500' : t.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                                        style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 2)}%` }}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, t.t_id)}
                                                        onClick={() => onTaskClick(t)}
                                                    >
                                                        <span className="truncate">{t.name}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DAY SCHEDULE VIEW */}
                    {timelineScale === 'DAY' && (
                        <div className="flex-1 overflow-y-auto relative bg-white dark:bg-slate-950">
                            {/* Unscheduled Tasks for Day Banner - Sticky at the very top of scroll */}
                            {tasks.filter(t => t.deadline?.split('T')[0] === formatDate(currentCalendarDate) && (!t.start_time || !t.end_time)).length > 0 && (
                                <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm p-3 border-b border-gray-200 dark:border-slate-800 flex gap-2 overflow-x-auto shadow-sm">
                                    <div className="flex items-center gap-2 mr-4 shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Plan Today</span>
                                    </div>
                                    {tasks.filter(t => t.deadline?.split('T')[0] === formatDate(currentCalendarDate) && (!t.start_time || !t.end_time)).map(t => (
                                        <div
                                            key={t.t_id}
                                            onClick={() => onTaskClick(t)}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, t.t_id)}
                                            className="shrink-0 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-300 cursor-grab hover:scale-105 transition-all shadow-sm"
                                        >
                                            {t.name}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex min-h-full relative" style={{ height: '1920px' }}>
                                {/* Timeline Sidebar (Hours) */}
                                <div className="w-20 border-r border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/10 flex flex-col shrink-0 pointer-events-none">
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <div key={i} className="h-20 border-b border-gray-100 dark:border-slate-800/30 relative">
                                            <span className="absolute -top-2.5 left-0 right-0 text-center text-[10px] font-bold font-mono text-gray-400">
                                                {String(i).padStart(2, '0')}:00
                                            </span>
                                        </div>
                                    ))}
                                    <div className="h-0 relative">
                                        <span className="absolute -top-2.5 left-0 right-0 text-center text-[10px] font-bold font-mono text-gray-400">
                                            24:00
                                        </span>
                                    </div>
                                </div>

                                {/* Main Grid Area */}
                                <div
                                    className="flex-1 relative"
                                    onDragOver={handleDragOverGrid}
                                    onDrop={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const y = e.clientY - rect.top;
                                        // Calculate time based on drop position relative to the grid start
                                        const hour = Math.floor(y / 80);
                                        const minute = Math.floor(((y % 80) / 80) * 60);
                                        const snappedMinute = Math.round(minute / 15) * 15;
                                        const timeStr = `${String(hour % 24).padStart(2, '0')}:${String(snappedMinute % 60).padStart(2, '0')}`;

                                        const t_id = Number(e.dataTransfer.getData("t_id"));
                                        if (t_id) {
                                            const endHour = snappedMinute >= 45 ? hour + 2 : hour + 1;
                                            const endTimeStr = `${String(endHour % 24).padStart(2, '0')}:${String(snappedMinute % 60).padStart(2, '0')}`;
                                            onUpdateTask(t_id, {
                                                deadline: formatDate(currentCalendarDate),
                                                start_time: timeStr,
                                                end_time: endTimeStr
                                            });
                                        }
                                        setDropIndicator(null);
                                    }}
                                >
                                    {/* Grid Lines */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        {Array.from({ length: 24 }).map((_, i) => (
                                            <div key={i} className="h-20 border-b border-gray-100 dark:border-slate-800/30 w-full relative">
                                                {/* 30min subtle line */}
                                                <div className="absolute top-10 left-0 right-0 border-b border-gray-50 dark:border-slate-800/10 w-full border-dashed"></div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Drop Indicator / Preview */}
                                    {dropIndicator && (
                                        <div
                                            className="absolute left-2 right-2 rounded-lg bg-blue-500/10 border-2 border-dashed border-blue-500/50 z-30 flex items-center justify-center transition-all duration-75 pointer-events-none"
                                            style={{ top: `${dropIndicator.top}px`, height: '80px' }}
                                        >
                                            <span className="text-blue-600 dark:text-blue-400 text-[10px] font-black bg-white dark:bg-slate-900 px-2 py-0.5 rounded shadow-sm">
                                                Schedule at {dropIndicator.time}
                                            </span>
                                        </div>
                                    )}

                                    {/* Current Time Indicator */}
                                    {new Date().toDateString() === currentCalendarDate.toDateString() && (
                                        <div
                                            className="absolute left-0 right-0 border-t-2 border-red-500 z-30 flex items-center pointer-events-none"
                                            style={{ top: `${(new Date().getHours() * 80) + (new Date().getMinutes() / 60 * 80)}px` }}
                                        >
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 shadow-sm"></div>
                                        </div>
                                    )}

                                    {/* Tasks */}
                                    <div className="relative w-full h-full">
                                        {tasks.filter(t => t.deadline?.split('T')[0] === formatDate(currentCalendarDate)).map(t => {
                                            if (!t.start_time || !t.end_time) return null;

                                            const [sH, sM] = t.start_time.split(':').map(Number);
                                            const [eH, eM] = t.end_time.split(':').map(Number);

                                            const top = (sH * 80) + (sM / 60 * 80);
                                            let height = ((eH === 0 && eM === 0 ? 24 : eH) * 80 + (eM / 60 * 80)) - top;
                                            if (height < 40) height = 40;

                                            return (
                                                <div
                                                    key={t.t_id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, t.t_id)}
                                                    onClick={() => onTaskClick(t)}
                                                    className={`absolute left-4 right-4 rounded-xl border-l-[6px] p-4 shadow-md cursor-grab active:cursor-grabbing hover:shadow-xl hover:-translate-y-0.5 transition-all z-20 overflow-hidden group
                                                        ${t.status === 'DONE' ? 'bg-gray-50/95 border-gray-300 text-gray-400 dark:bg-slate-800/95 dark:border-slate-700' :
                                                            t.priority === 'HIGH' ? 'bg-red-50 border-red-500 text-red-900 dark:bg-red-900/20 dark:border-red-600 dark:text-red-100' :
                                                                t.priority === 'MEDIUM' ? 'bg-amber-50 border-amber-500 text-amber-900 dark:bg-amber-900/20 dark:border-amber-600 dark:text-amber-100' :
                                                                    'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-100'}`}
                                                    style={{ top: `${top}px`, height: `${height}px` }}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-[10px] font-black uppercase tracking-wider opacity-60 mb-1.5">{t.start_time} - {t.end_time}</div>
                                                            <h4 className={`text-sm font-black leading-tight truncate ${t.status === 'DONE' ? 'line-through' : ''}`}>{t.name}</h4>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onUpdateTask(t.t_id, { status: t.status === 'DONE' ? 'TODO' : 'DONE' }); }}
                                                                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${t.status === 'DONE' ? 'bg-green-500 border-green-500 text-white' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:border-blue-500'}`}
                                                            >
                                                                {t.status === 'DONE' && <CheckCircle2 size={12} strokeWidth={3} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

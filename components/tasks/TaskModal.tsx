'use client'

import { ArrowRight, CheckCircle2, CheckSquare, Plus, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { Priority, Task, TaskComment, TaskStatus, User } from '../../types';

function MetaBlock({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div>
            <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide block mb-1.5">{label}</label>
            {children}
        </div>
    )
}

export default function TaskModal({
    task, isOpen, onClose, onUpdate, onDelete, onAddComment, comments, users, currentUser, subtasks, onCreateSubtask
}: {
    task: Task | null,
    isOpen: boolean,
    onClose: () => void,
    onUpdate: (updates: Partial<Task>) => void,
    onDelete: () => void,
    onAddComment: (text: string) => void,
    comments: TaskComment[],
    users: User[],
    currentUser: User,
    subtasks: Task[],
    onCreateSubtask: (name: string) => void
}) {
    if (!isOpen || !task) return null;

    // Local state for inputs
    const [newComment, setNewComment] = useState("");
    const [newSubtask, setNewSubtask] = useState("");

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        onAddComment(newComment);
        setNewComment("");
    }

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;
        onCreateSubtask(newSubtask);
        setNewSubtask("");
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-slate-800"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onUpdate({ status: task.status === 'DONE' ? 'TODO' : 'DONE' })}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                   ${task.status === 'DONE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-gray-200'}`}
                        >
                            {task.status === 'DONE' ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />}
                            {task.status === 'DONE' ? 'Completed' : 'Mark Complete'}
                        </button>
                        <div className="h-4 w-[1px] bg-gray-200 dark:bg-slate-700"></div>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">TASK-{task.t_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X size={18} /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto flex md:flex-row flex-col bg-white dark:bg-slate-900">
                    {/* LEFT MAIN CONTENT */}
                    <div className="flex-1 p-8 border-r border-gray-100 dark:border-slate-800">
                        <input
                            type="text"
                            value={task.name}
                            onChange={(e) => onUpdate({ name: e.target.value })}
                            className="text-2xl font-bold w-full bg-transparent border-none focus:ring-0 p-0 mb-6 text-gray-900 dark:text-white placeholder-gray-400"
                            placeholder="Task Name"
                        />

                        <div className="mb-8">
                            <MetaBlock label="Description">
                                <textarea
                                    value={task.description || ""}
                                    onChange={(e) => onUpdate({ description: e.target.value })}
                                    placeholder="Add a more detailed description..."
                                    className="w-full min-h-[120px] p-4 rounded-xl bg-gray-50 dark:bg-slate-950/50 border-none resize-y text-sm focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-700 dark:text-slate-300"
                                />
                            </MetaBlock>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Subtasks ({subtasks.filter(t => t.status === 'DONE').length}/{subtasks.length})</label>
                            </div>
                            <div className="space-y-2 mb-3">
                                {subtasks.map(st => (
                                    <div key={st.t_id} className="flex items-center gap-3 group p-2 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${st.status === 'DONE' ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 dark:border-slate-600'}`}>
                                            {st.status === 'DONE' && <CheckSquare size={10} />}
                                        </div>
                                        <span className={`text-sm flex-1 ${st.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-700 dark:text-slate-300'}`}>{st.name}</span>
                                    </div>
                                ))}
                                {subtasks.length === 0 && <div className="text-sm text-gray-400 italic">No subtasks</div>}
                            </div>
                            <form onSubmit={handleAddSubtask} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSubtask}
                                    onChange={e => setNewSubtask(e.target.value)}
                                    placeholder="Add a subtask..."
                                    className="flex-1 bg-gray-50 dark:bg-slate-950/50 border-none rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-blue-500/20"
                                />
                                <button type="submit" disabled={!newSubtask.trim()} className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50">
                                    <Plus size={16} />
                                </button>
                            </form>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide block mb-3">Activity & Comments</label>
                            <div className="space-y-4 mb-4">
                                {comments.map(c => {
                                    const user = users.find(u => u.u_id === c.u_id);
                                    return (
                                        <div key={c.comment_id} className="flex gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${user?.avatar_color || 'bg-gray-400'}`}>
                                                {user?.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{user?.name}</span>
                                                    <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-slate-300">{c.comment_text}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                                {comments.length === 0 && <div className="text-sm text-gray-400 italic">No comments yet</div>}
                            </div>
                            <form onSubmit={handleSubmitComment} className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${currentUser.avatar_color}`}>
                                    {currentUser.name.charAt(0)}
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-slate-950/50 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="Write a comment..."
                                    />
                                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="w-full md:w-80 p-8 bg-gray-50/50 dark:bg-slate-950/30">
                        <div className="space-y-6">
                            <MetaBlock label="Status">
                                <select
                                    value={task.status}
                                    onChange={(e) => onUpdate({ status: e.target.value as TaskStatus })}
                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                >
                                    <option value="TODO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="DONE">Done</option>
                                </select>
                            </MetaBlock>

                            <MetaBlock label="Priority">
                                <select
                                    value={task.priority}
                                    onChange={(e) => onUpdate({ priority: e.target.value as Priority })}
                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </MetaBlock>

                            <MetaBlock label="Due Date">
                                <input
                                    type="date"
                                    value={task.deadline}
                                    onChange={(e) => onUpdate({ deadline: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </MetaBlock>

                            {/* Created/Updated Info */}
                            <div className="pt-6 border-t border-gray-200 dark:border-slate-800 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Created</span>
                                    <span className="text-gray-600 dark:text-slate-400">{new Date(task.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Updated</span>
                                    <span className="text-gray-600 dark:text-slate-400">{new Date(task.updated_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client'

import { ArrowRight, CheckCircle2, CheckSquare, Plus, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { Priority, Task, TaskComment, TaskHistory, TaskStatus, User } from '../../types';

function MetaBlock({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div>
            <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide block mb-1.5">{label}</label>
            {children}
        </div>
    )
}

export default function TaskModal({
    task, isOpen, onClose, onUpdate, onDelete, onAddComment, comments, history, users, currentUser, subtasks, onCreateSubtask, onSave
}: {
    task: Task | null,
    isOpen: boolean,
    onClose: () => void,
    onUpdate: (updates: Partial<Task>) => void,
    onDelete: () => void,
    onAddComment: (text: string) => void,
    comments: TaskComment[],
    history: TaskHistory[],
    users: User[],
    currentUser: User | null,
    subtasks: Task[],
    onCreateSubtask: (name: string) => void,
    onSave?: (updates: Partial<Task>) => void
}) {
    // Local state for draft
    const [draft, setDraft] = useState<Partial<Task> | null>(null);
    const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
    const [newComment, setNewComment] = useState("");
    const [newSubtask, setNewSubtask] = useState("");

    React.useEffect(() => {
        if (task && isOpen) {
            setDraft({ ...task });
        }
    }, [task, isOpen]);

    if (!isOpen || !task || !draft) return null;

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

    const handleSave = () => {
        if (onSave) {
            onSave(draft);
        } else {
            onUpdate(draft);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-screen md:max-h-[90vh] rounded-none md:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-slate-800"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setDraft({ ...draft, status: draft.status === 'DONE' ? 'TODO' : 'DONE' })}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                   ${draft.status === 'DONE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-gray-200'}`}
                        >
                            {draft.status === 'DONE' ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />}
                            {draft.status === 'DONE' ? 'Completed' : 'Mark Complete'}
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
                    <div className="flex-1 p-4 sm:p-8 border-r border-gray-100 dark:border-slate-800">
                        <input
                            type="text"
                            value={draft.name || ""}
                            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                            className="text-2xl font-bold w-full bg-transparent border-none focus:ring-0 p-0 mb-6 text-gray-900 dark:text-white placeholder-gray-400"
                            placeholder="Task Name"
                        />

                        <div className="mb-8">
                            <MetaBlock label="Description">
                                <textarea
                                    value={draft.description || ""}
                                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
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
                            <div className="flex items-center gap-6 border-b border-gray-100 dark:border-slate-800 mb-6">
                                <button 
                                    onClick={() => setActiveTab('comments')}
                                    className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === 'comments' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Comments ({comments.length})
                                    {activeTab === 'comments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 animate-in slide-in-from-bottom-1" />}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('history')}
                                    className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Activity History ({history.length})
                                    {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 animate-in slide-in-from-bottom-1" />}
                                </button>
                            </div>

                            {activeTab === 'comments' ? (
                                <div className="space-y-6">
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {comments.map(c => {
                                            const user = users.find(u => u.id === c.u_id);
                                            return (
                                                <div key={c.comment_id} className="flex gap-3 animate-in flex-in slide-in-from-left-2 duration-300">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${user?.avatar_color || 'bg-gray-400'}`}>
                                                        {user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-baseline gap-2 mb-1">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{user?.name}</span>
                                                            <span className="text-[10px] text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                                                        </div>
                                                        <div className="p-3 bg-gray-50 dark:bg-slate-950/50 rounded-xl rounded-tl-none border border-gray-100 dark:border-slate-800/50">
                                                            <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">{c.comment_text}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {comments.length === 0 && <div className="text-sm text-gray-400 italic py-4">No comments yet. Start the conversation!</div>}
                                    </div>
                                    <form onSubmit={handleSubmitComment} className="flex gap-3 pt-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${currentUser?.avatar_color || 'bg-blue-600'}`}>
                                            {currentUser?.name?.charAt(0) || 'M'}
                                        </div>
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={newComment}
                                                onChange={e => setNewComment(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-slate-950/50 border border-gray-100 dark:border-slate-800 rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                                placeholder="Write a comment..."
                                            />
                                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {history.map(h => {
                                        const user = users.find(u => u.id === h.changed_by);
                                        return (
                                            <div key={h.history_id} className="flex gap-3 text-xs animate-in fade-in slide-in-from-left-1 duration-200">
                                                <div className="w-8 flex flex-col items-center shrink-0">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${user?.avatar_color || 'bg-gray-400'}`}>
                                                        {user?.name?.charAt(0) || 'A'}
                                                    </div>
                                                    <div className="w-[1px] flex-1 bg-gray-100 dark:bg-slate-800 mt-2"></div>
                                                </div>
                                                <div className="pb-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-gray-900 dark:text-white">{user?.name}</span>
                                                        <span className="text-gray-400">{new Date(h.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <div className="text-gray-500 dark:text-slate-400">
                                                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-[10px] font-black uppercase text-gray-600 dark:text-slate-300 mr-2">{h.action_type.replace('_', ' ')}</span>
                                                        {h.old_value && h.new_value ? (
                                                            <>changed from <span className="font-medium text-gray-700 dark:text-slate-200">{h.old_value}</span> to <span className="font-medium text-blue-600 dark:text-blue-400">{h.new_value}</span></>
                                                        ) : h.new_value ? (
                                                            <><span className="font-medium text-blue-600 dark:text-blue-400">{h.new_value}</span></>
                                                        ) : (
                                                            <>updated this task</>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {history.length === 0 && <div className="text-sm text-gray-400 italic py-4">No activity recorded yet</div>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="w-full md:w-80 p-4 sm:p-8 bg-gray-50/50 dark:bg-slate-950/30 border-t md:border-t-0 border-gray-100 dark:border-slate-800">
                        <div className="space-y-6">
                            <MetaBlock label="Status">
                                <select
                                    value={draft.status}
                                    onChange={(e) => setDraft({ ...draft, status: e.target.value as TaskStatus })}
                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                >
                                    <option value="TODO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="DONE">Done</option>
                                </select>
                            </MetaBlock>

                            <MetaBlock label="Priority">
                                <select
                                    value={draft.priority}
                                    onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}
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
                                    value={draft.deadline ? draft.deadline.split('T')[0] : ""}
                                    onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </MetaBlock>

                            <div className="grid grid-cols-2 gap-3">
                                <MetaBlock label="Start Time">
                                    <input
                                        type="time"
                                        value={draft.start_time || ""}
                                        onChange={(e) => setDraft({ ...draft, start_time: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </MetaBlock>
                                <MetaBlock label="End Time">
                                    <input
                                        type="time"
                                        value={draft.end_time || ""}
                                        onChange={(e) => setDraft({ ...draft, end_time: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </MetaBlock>
                            </div>

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

                            {/* Save Button for UX */}
                            <button 
                                onClick={handleSave}
                                className="w-full mt-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm focus:ring-2 focus:ring-blue-500/50 outline-none flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={16} />
                                Save Task
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

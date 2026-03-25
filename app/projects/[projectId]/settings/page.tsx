'use client'

import React, { useState } from 'react';
import { 
    Settings, 
    Users, 
    Trash2, 
    Archive, 
    ArrowLeft,
    Share2,
    Calendar,
    ChevronRight,
    Trophy,
    Layout
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '../../../../context/AppContext';
import Link from 'next/link';

type ProjectTabType = 'general' | 'members' | 'workflow' | 'advanced';

export default function ProjectSettings() {
    const params = useParams();
    const router = useRouter();
    const projectId = Number(params.projectId);
    const { projects, updateProject, deleteProject, archiveProject, showToast, users } = useApp();
    const [activeTab, setActiveTab] = useState<ProjectTabType>('general');

    const project = projects.find(p => p.p_id === projectId && !p.is_deleted);

    if (!project) return <div className="p-8 text-center text-gray-400">Project not found</div>;

    const handleUpdateProject = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const deadline = formData.get("deadline") as string;

        updateProject({ ...project, name, description, deadline });
        showToast("Project updated successfully");
    };

    const handleDeleteProject = () => {
        deleteProject(projectId);
        router.push('/dashboard');
        showToast(`Project "${project.name}" deleted`, "error");
    };

    const tabs = [
        { id: 'general', label: 'General', icon: <Settings size={18} /> },
        { id: 'members', label: 'Members', icon: <Users size={18} /> },
        { id: 'workflow', label: 'Workflow', icon: <Layout size={18} /> },
        { id: 'advanced', label: 'Advanced', icon: <Share2 size={18} /> },
    ];

    const SettingSection = ({ title, children, description }: { title: string, children: React.ReactNode, description?: string }) => (
        <section className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                {description && <p className="text-sm text-gray-500 dark:text-slate-400">{description}</p>}
            </div>
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                {children}
            </div>
        </section>
    );

    const SettingItem = ({ icon, label, children, description }: { icon?: React.ReactNode, label: string, children: React.ReactNode, description?: string }) => (
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
            <div className="flex items-center gap-3 mb-3 md:mb-0">
                {icon && <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-600 dark:text-slate-400">{icon}</div>}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{label}</h4>
                    {description && <p className="text-xs text-gray-500 dark:text-slate-400">{description}</p>}
                </div>
            </div>
            <div className="md:w-1/2 flex justify-end">
                {children}
            </div>
        </div>
    );

    return (
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-200">
            <div className="max-w-4xl mx-auto">
                <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                    <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                    <ChevronRight size={12} />
                    <Link href={`/projects/${projectId}`} className="hover:text-blue-600 transition-colors">{project.name}</Link>
                    <ChevronRight size={12} />
                    <span className="text-gray-900 dark:text-white">Settings</span>
                </nav>

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                            Project Settings
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400 mt-1">Configure workspace preferences for {project.name}.</p>
                    </div>
                    <Link 
                        href={`/projects/${projectId}`}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                    >
                        <ArrowLeft size={16} /> Back to Project
                    </Link>
                </header>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Tabs */}
                    <aside className="md:w-56 shrink-0 flex md:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as ProjectTabType)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                                    ${activeTab === tab.id 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                        : 'text-gray-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm'}`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </aside>

                    {/* Content */}
                    <div className="flex-1">
                        {activeTab === 'general' && (
                            <form onSubmit={handleUpdateProject}>
                                <SettingSection title="Project Details" description="Update your project identity and deadline.">
                                    <SettingItem label="Project Name" description="The title of your workspace.">
                                        <input name="name" defaultValue={project.name} required className="w-full max-w-xs border rounded-lg p-2.5 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </SettingItem>

                                    <SettingItem label="Description" description="Summarize the goal of this project.">
                                        <textarea name="description" defaultValue={project.description} rows={3} className="w-full max-w-xs border rounded-lg p-2.5 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </SettingItem>

                                    <SettingItem label="Project Deadline" icon={<Calendar size={18} />} description="Target date for project completion.">
                                        <input 
                                            name="deadline" 
                                            type="date" 
                                            defaultValue={project.deadline ? project.deadline.split('T')[0] : ''} 
                                            className="w-full max-w-xs border rounded-lg p-2.5 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                                        />
                                    </SettingItem>
                                </SettingSection>

                                <div className="flex justify-end gap-3">
                                    <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">Save Changes</button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'members' && (
                            <SettingSection title="Members & Roles" description="Manage who has access to this project.">
                                <div className="p-4 space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">D</div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Dikshita Kothari (You)</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">Owner</p>
                                        </div>
                                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded">OWNER</span>
                                    </div>

                                    {users.filter(u => u.id !== project.u_id).map(u => (
                                        <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border-t border-gray-100 dark:border-slate-800">
                                            <div className={`w-10 h-10 rounded-full ${u.avatar_color || 'bg-gray-500'} flex items-center justify-center text-white font-bold`}>
                                                {u.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{u.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-slate-400">Member</p>
                                            </div>
                                            <button className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-3 py-1.5 rounded-lg transition-colors">Remove</button>
                                        </div>
                                    ))}

                                    <button className="w-full p-2.5 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-lg text-sm font-bold text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all">
                                        + Invite New Member
                                    </button>
                                </div>
                            </SettingSection>
                        )}

                        {activeTab === 'workflow' && (
                            <SettingSection title="Workflow Customization" description="Adjust project stages and priorities.">
                                <SettingItem label="Custom Statuses" description="Project currently uses TODO, IN PROGRESS, DONE.">
                                    <button className="text-blue-600 text-xs font-bold hover:underline">Configure Stages</button>
                                </SettingItem>
                                <SettingItem label="Default Priority" description="New tasks will start with this priority.">
                                    <select defaultValue="Medium" className="bg-gray-100 dark:bg-slate-800 rounded-lg p-2 text-xs font-bold outline-none border-0">
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </SettingItem>
                            </SettingSection>
                        )}

                        {activeTab === 'advanced' && (
                            <>
                                <SettingSection title="Project Management" description="Utilities for project maintenance.">
                                    <SettingItem icon={<Archive size={18} />} label={project.is_archived ? "Restore Project" : "Archive Project"} description={project.is_archived ? "Bring this project back to your active list." : "Hide this project from the active list. It can be restored later."}>
                                        <button 
                                            className="text-blue-600 text-xs font-black uppercase tracking-wider hover:underline" 
                                            onClick={() => {
                                                archiveProject(projectId, !project.is_archived);
                                                if (!project.is_archived) router.push('/dashboard');
                                            }}
                                        >
                                            {project.is_archived ? "Restore" : "Archive"}
                                        </button>
                                    </SettingItem>
                                    <SettingItem icon={<Trophy size={18} />} label="Mark as Completed" description="Set all tasks to done and celebrate!">
                                        <button className="text-blue-600 text-xs font-black uppercase tracking-wider hover:underline">Complete</button>
                                    </SettingItem>
                                </SettingSection>

                                <SettingSection title="Danger Zone" description="Irreversible actions. Be careful.">
                                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg text-red-600 dark:text-red-400">
                                                <Trash2 size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-red-700 dark:text-red-400">Delete Project</h4>
                                                <p className="text-xs text-red-600/70 dark:text-red-400/60">This will delete all tasks and history.</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleDeleteProject}
                                            className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all hover:shadow-lg hover:shadow-red-600/20"
                                        >
                                            Delete Project
                                        </button>
                                    </div>
                                </SettingSection>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client'

import {
    FolderKanban,
    LayoutDashboard,
    Moon,
    Plus,
    Settings,
    Sun
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useApp } from '../../context/AppContext';

function NavItem({ icon, label, active, onClick, href }: {
    icon: React.ReactNode,
    label: string,
    active?: boolean,
    onClick?: () => void,
    href?: string
}) {
    const content = (
        <div
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors
            ${active
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
        >
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </div>
    );

    if (href) {
        return <Link href={href} className="block no-underline">{content}</Link>;
    }
    return content;
}

export default function Sidebar({ onOpenProjectModal, onOpenProfileModal }: { onOpenProjectModal: () => void, onOpenProfileModal: () => void }) {
    const { projects, currentUser, darkMode, setDarkMode } = useApp();
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col hidden md:flex h-full">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                    J
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Juggler</span>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                <NavItem
                    icon={<LayoutDashboard size={20} />}
                    label="Dashboard"
                    active={pathname === '/'}
                    href="/"
                />

                <div className="pt-4 pb-2 flex justify-between items-center px-3">
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Projects</p>
                    <button
                        onClick={onOpenProjectModal}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                {projects.filter(p => !p.is_deleted).map(p => (
                    <NavItem
                        key={p.p_id}
                        icon={<FolderKanban size={20} />}
                        label={p.name}
                        active={pathname === `/projects/${p.p_id}`}
                        href={`/projects/${p.p_id}`}
                    />
                ))}

                <div className="pt-4 pb-2">
                    <p className="px-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Settings</p>
                </div>
                <NavItem icon={<Settings size={20} />} label="Preferences" onClick={() => { }} />
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-slate-800">
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="flex items-center justify-center w-full gap-2 p-2 rounded-md bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors mb-3 text-sm font-medium"
                >
                    {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                    {darkMode ? "Light Mode" : "Dark Mode"}
                </button>

                <div
                    onClick={onOpenProfileModal}
                    className="flex items-center gap-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 rounded p-1 transition-colors"
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${currentUser.avatar_color}`}>
                        {currentUser.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-900 dark:text-white">{currentUser.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">@{currentUser.username}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

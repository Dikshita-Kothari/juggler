'use client'

import React, { useState } from 'react';
import { 
    User, 
    Bell, 
    Monitor, 
    Database, 
    Trash2, 
    Shield, 
    Globe, 
    Mail,
    Moon,
    Sun,
    Monitor as SystemIcon,
    ArrowRight,
    LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useRouter } from 'next/navigation';

type TabType = 'profile' | 'appearance' | 'notifications' | 'data' | 'security';

export default function SettingsPage() {
    const { currentUser, updateUser, showToast, darkMode, setDarkMode } = useApp();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('profile');

    if (!currentUser) return <div className="flex-1 flex items-center justify-center p-8 text-gray-400">Please log in to access settings.</div>;

    const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const username = formData.get("username") as string;

        updateUser({ ...currentUser, name, email, username });
        showToast("Profile updated successfully");
    };

    const handleLogout = () => {
        router.push('/auth');
        showToast("Logged out successfully", "info");
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <User size={18} /> },
        { id: 'appearance', label: 'Appearance', icon: <Monitor size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
        { id: 'data', label: 'Data Management', icon: <Database size={18} /> },
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
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-950 p-4 md:p-8 lg:p-12 transition-colors duration-200">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        Settings
                        <span className="text-xs font-bold px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">App-wide</span>
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-2">Manage your account settings and preferences.</p>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <aside className="lg:w-64 space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                                    ${activeTab === tab.id 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-1' 
                                        : 'text-gray-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm dark:hover:border-slate-800'}`}
                            >
                                {tab.icon}
                                {tab.label}
                                {activeTab === tab.id && <ArrowRight size={14} className="ml-auto animate-in slide-in-from-left-2" />}
                            </button>
                        ))}

                        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-slate-800 px-2 leading-relaxed">
                            <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-600 tracking-widest mb-4">Account</p>
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1">
                        {activeTab === 'profile' && (
                            <form onSubmit={handleUpdateProfile}>
                                <SettingSection title="Public Profile" description="This information will be visible to other members in your projects.">
                                    <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center gap-6">
                                        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-white text-4xl font-black ${currentUser.avatar_color || 'bg-blue-600'} shadow-xl shadow-blue-600/10 shrink-0`}>
                                            {currentUser.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Profile Theme</h4>
                                            <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Choose your avatar and theme color.</p>
                                            <div className="flex gap-2">
                                                {['bg-blue-600', 'bg-purple-600', 'bg-pink-600', 'bg-orange-600', 'bg-emerald-600', 'bg-slate-700'].map(color => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => updateUser({ ...currentUser, avatar_color: color })}
                                                        className={`w-6 h-6 rounded-full ${color} border-2 ${currentUser.avatar_color === color ? 'border-white ring-2 ring-blue-500' : 'border-transparent hover:scale-110 transition-transform'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <SettingItem label="Display Name" description="Your name as it appears on tasks and comments.">
                                        <input name="name" defaultValue={currentUser.name || ''} required className="w-full max-w-xs border rounded-lg p-2.5 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </SettingItem>

                                    <SettingItem label="Username" description="Your unique handle for mentions.">
                                        <div className="w-full max-w-xs relative">
                                            <span className="absolute left-3 top-2.5 text-gray-400 font-bold">@</span>
                                            <input name="username" defaultValue={currentUser.username || ''} required className="w-full border rounded-lg p-2.5 pl-8 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                        </div>
                                    </SettingItem>

                                    <SettingItem label="Email Address" description="Used for project notifications and password recovery.">
                                        <div className="w-full max-w-xs relative">
                                            <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                                            <input name="email" type="email" defaultValue={currentUser.email || ''} required className="w-full border rounded-lg p-2.5 pl-10 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                        </div>
                                    </SettingItem>
                                </SettingSection>

                                <div className="flex justify-end gap-3">
                                    <button type="button" className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all">Discard Changes</button>
                                    <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Save Changes</button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'appearance' && (
                            <>
                                <SettingSection title="Theme & Visuals" description="Customize how Juggler looks on your device.">
                                    <SettingItem icon={<Monitor size={18} />} label="Interface Theme" description="Select your preferred color scheme.">
                                        <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl gap-1">
                                            <button 
                                                onClick={() => setDarkMode(false)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!darkMode ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 hover:dark:text-slate-200'}`}
                                            >
                                                <Sun size={14} /> Light
                                            </button>
                                            <button 
                                                onClick={() => setDarkMode(true)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${darkMode ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 hover:dark:text-slate-200'}`}
                                            >
                                                <Moon size={14} /> Dark
                                            </button>
                                            <button 
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 cursor-not-allowed opacity-50"
                                            >
                                                <SystemIcon size={14} /> Auto
                                            </button>
                                        </div>
                                    </SettingItem>

                                    <SettingItem icon={<Globe size={18} />} label="Language" description="Choose your interface language.">
                                        <select className="bg-gray-100 dark:bg-slate-800 border-0 rounded-lg p-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                                            <option>English (US)</option>
                                            <option>Spanish</option>
                                            <option>French</option>
                                            <option>German</option>
                                        </select>
                                    </SettingItem>
                                </SettingSection>
                            </>
                        )}

                        {activeTab === 'notifications' && (
                            <SettingSection title="Notifications" description="Stay updated on what matters most.">
                                <SettingItem label="Email Notifications" description="Receive task summaries and deadline alerts via email.">
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </div>
                                </SettingItem>
                                
                                <SettingItem label="Desktop Push Notifications" description="Get real-time alerts on your computer.">
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </div>
                                </SettingItem>

                                <SettingItem label="Task Deadlines" description="Notify me 24 hours before a task is due.">
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </div>
                                </SettingItem>
                            </SettingSection>
                        )}

                        {activeTab === 'security' && (
                            <SettingSection title="Security" description="Manage your password and session security.">
                                <SettingItem label="Two-Factor Authentication" description="Add an extra layer of security to your account.">
                                    <button className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">Enable 2FA</button>
                                </SettingItem>
                                <SettingItem label="Change Password" description="Last changed 3 months ago.">
                                    <button className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">Update Password</button>
                                </SettingItem>
                            </SettingSection>
                        )}

                        {activeTab === 'data' && (
                            <>
                                <SettingSection title="Import / Export" description="Manage your data storage and portability.">
                                    <SettingItem icon={<Database size={18} />} label="Export Workspace" description="Download all your projects and tasks in JSON format.">
                                        <button 
                                            onClick={() => showToast("Exporting workspace data...", "info")}
                                            className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider hover:underline"
                                        >
                                            Export Now
                                        </button>
                                    </SettingItem>
                                </SettingSection>

                                <SettingSection title="Danger Zone" description="Irreversible actions for your account.">
                                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg text-red-600 dark:text-red-400">
                                                <Trash2 size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-red-700 dark:text-red-400">Delete Account</h4>
                                                <p className="text-xs text-red-600/70 dark:text-red-400/60">Permanently remove all your data from Juggler.</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => showToast("This action is not available in the demo.", "error")}
                                            className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all hover:shadow-lg hover:shadow-red-600/20"
                                        >
                                            Delete Me
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

'use client'

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useApp } from '../context/AppContext';
import { signOut } from 'next-auth/react';

export default function ProfileModal({
    isOpen,
    onClose
}: {
    isOpen: boolean,
    onClose: () => void
}) {
    const { currentUser, updateUser, showToast } = useApp();
    const router = useRouter();

    if (!isOpen || !currentUser) return null;

    const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;

        updateUser({ ...currentUser, name, email });
        onClose();
        showToast("Profile updated successfully");
    };

    const handleLogout = async () => {
        onClose();
        await signOut({ callbackUrl: '/auth' });
        showToast("Logged out successfully", "info");
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Edit Profile</h2>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold ${currentUser.avatar_color || 'bg-blue-600'} shadow-lg shadow-blue-500/20`}>
                            {currentUser.name?.charAt(0) || 'U'}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-slate-300">Display Name</label>
                        <input name="name" defaultValue={currentUser.name || ''} required className="w-full border rounded-lg p-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-slate-300">Email</label>
                        <input name="email" type="email" defaultValue={currentUser.email || ''} required className="w-full border rounded-lg p-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}


'use client'

import React from 'react';
import { useApp } from '../context/AppContext';

export default function ProfileModal({
    isOpen,
    onClose
}: {
    isOpen: boolean,
    onClose: () => void
}) {
    const { currentUser, updateUser, showToast } = useApp();

    if (!isOpen) return null;

    const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;

        updateUser({ ...currentUser, name, email });
        onClose();
        showToast("Profile updated successfully");
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium block mb-1">Display Name</label>
                        <input name="name" defaultValue={currentUser.name} required className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                    <div>
                        <label className="text-sm font-medium block mb-1">Email</label>
                        <input name="email" type="email" defaultValue={currentUser.email} required className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

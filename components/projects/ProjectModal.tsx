'use client'

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Project } from '../../types';

export default function ProjectModal({
    projectToEdit,
    onClose,
    isOpen
}: {
    projectToEdit: Project | null,
    onClose: () => void,
    isOpen: boolean
}) {
    const { addProject, updateProject, currentUser, showToast, projects } = useApp();

    if (!isOpen) return null;

    const handleSaveProject = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const desc = formData.get("description") as string;
        const deadline = formData.get("deadline") as string;

        if (projectToEdit) {
            updateProject({ ...projectToEdit, name, description: desc, deadline });
            showToast("Project updated");
        } else {
            const newPid = Math.max(0, ...projects.map(p => p.p_id)) + 1;
            const newProject: Project = {
                p_id: newPid,
                u_id: currentUser.u_id,
                name,
                description: desc,
                deadline,
                created_at: new Date().toISOString(),
                is_deleted: false
            };
            addProject(newProject);
            showToast("Project created successfully");
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">{projectToEdit ? 'Edit Project' : 'New Project'}</h2>
                <form onSubmit={handleSaveProject} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium block mb-1">Project Name</label>
                        <input name="name" defaultValue={projectToEdit?.name} required className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="e.g. Website Redesign" />
                    </div>
                    <div>
                        <label className="text-sm font-medium block mb-1">Description</label>
                        <textarea name="description" defaultValue={projectToEdit?.description} className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white" rows={3} placeholder="Project goals..." />
                    </div>
                    <div>
                        <label className="text-sm font-medium block mb-1">Deadline</label>
                        <input type="date" name="deadline" defaultValue={projectToEdit?.deadline} className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Project</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

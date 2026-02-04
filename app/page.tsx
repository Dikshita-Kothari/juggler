'use client'

import {
  CheckSquare,
  Clock,
  FolderKanban,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import StatCard from '../components/dashboard/StatCard';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { currentUser, projects, tasks, setIsProjectModalOpen } = useApp();
  const router = useRouter();

  const navigateToProject = (pId: number) => {
    router.push(`/projects/${pId}`);
  };

  const activeProjects = projects.filter(p => !p.is_deleted);
  const pendingTasks = tasks.filter(t => t.status !== 'DONE' && !t.is_deleted);
  const dueSoonTasks = tasks.filter(t => !t.is_deleted && t.status !== 'DONE'); // Simple due soon logic for v1 match
  const completedTasks = tasks.filter(t => t.status === 'DONE' && !t.is_deleted);

  return (
    <div className="flex-1 overflow-auto p-8 bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Welcome back, {currentUser.name} 👋</h1>
        <p className="text-gray-500 dark:text-slate-400">Here's what's happening in your workspace today.</p>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Projects" value={activeProjects.length} icon={<FolderKanban className="text-blue-600" />} />
        <StatCard title="Pending Tasks" value={pendingTasks.length} icon={<CheckSquare className="text-orange-600" />} />
        <StatCard title="Due Soon" value={dueSoonTasks.length} icon={<Clock className="text-red-600" />} />
        <StatCard title="Completed" value={completedTasks.length} icon={<CheckSquare className="text-green-600" />} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <FolderKanban size={24} className="text-blue-600" />
          Your Projects
        </h2>
        <button
          onClick={() => setIsProjectModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeProjects.map(p => {
          const pTasks = tasks.filter(t => t.p_id === p.p_id && !t.is_deleted);
          const progress = pTasks.length ? Math.round((pTasks.filter(t => t.status === 'DONE').length / pTasks.length) * 100) : 0;

          return (
            <div
              key={p.p_id}
              onClick={() => navigateToProject(p.p_id)}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 hover:shadow-lg dark:hover:shadow-blue-900/10 transition-all cursor-pointer group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FolderKanban size={20} />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded text-gray-600 dark:text-slate-400">OWNER</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{p.name}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 line-clamp-2 h-10">{p.description}</p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-slate-400">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
          )
        })}

        <div
          className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors min-h-[220px]"
          onClick={() => setIsProjectModalOpen(true)}
        >
          <Plus size={32} className="mb-2" />
          <span className="font-medium">Create New Project</span>
        </div>
      </div>
    </div>
  );
}
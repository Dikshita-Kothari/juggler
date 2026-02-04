'use client'

import { Bell } from 'lucide-react';
import { Inter } from 'next/font/google';
import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import ProfileModal from '../components/ProfileModal';
import ProjectModal from '../components/projects/ProjectModal';
import { AppProvider, useApp } from '../context/AppContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Separate Layout to use Hooks from Context
function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const {
    toasts,
    isProjectModalOpen, setIsProjectModalOpen,
    isProfileModalOpen, setIsProfileModalOpen
  } = useApp();

  return (
    <div className={`flex h-screen w-full bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200`}>
      {/* TOASTS */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`bg-white dark:bg-slate-800 shadow-lg border-l-4 p-4 rounded-r-md animate-in slide-in-from-right-full fade-in flex items-center gap-3 min-w-[300px] pointer-events-auto
                ${t.type === 'success' ? 'border-green-500' : t.type === 'error' ? 'border-red-500' : 'border-blue-500'}`}>
            <Bell size={18} className={`${t.type === 'success' ? 'text-green-500' : t.type === 'error' ? 'text-red-500' : 'text-blue-500'}`} />
            <span className="text-sm font-medium">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Global Modals */}
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} projectToEdit={null} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

      <Sidebar onOpenProjectModal={() => setIsProjectModalOpen(true)} onOpenProfileModal={() => setIsProfileModalOpen(true)} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all">
        {children}
      </main>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <AppLayoutInner>
            {children}
          </AppLayoutInner>
        </AppProvider>
      </body>
    </html>
  )
}

'use client'

import { Bell, Menu } from 'lucide-react';
import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import ProfileModal from '../components/ProfileModal';
import ProjectModal from '../components/projects/ProjectModal';
import { AppProvider, useApp } from '../context/AppContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Separate Layout to use Hooks from Context
function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullPage = pathname === '/' || pathname === '/auth';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    toasts,
    isProjectModalOpen, setIsProjectModalOpen,
    isProfileModalOpen, setIsProfileModalOpen
  } = useApp();

  return (
    <div className={`flex w-full font-sans transition-colors duration-200 
      ${isFullPage ? 'bg-slate-950 min-h-screen' : 'bg-gray-50 dark:bg-slate-950 h-screen text-gray-900 dark:text-gray-100'}`}>

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

      {!isFullPage && (
        <>
          {/* Global Modals */}
          <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} projectToEdit={null} />
          <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

          <Sidebar 
            onOpenProjectModal={() => setIsProjectModalOpen(true)} 
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </>
      )}

      <main className={`flex-1 flex flex-col relative transition-all ${isFullPage ? '' : 'h-full overflow-hidden'}`}>
        {!isFullPage && (
          <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 z-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                J
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Juggler</span>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md"
            >
              <Menu size={24} />
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}



import { SessionProvider } from 'next-auth/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <AppProvider>
            <AppLayoutInner>
              {children}
            </AppLayoutInner>
          </AppProvider>
        </SessionProvider>
      </body>
    </html>
  )
}


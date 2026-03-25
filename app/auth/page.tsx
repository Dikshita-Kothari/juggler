'use client'

import { ArrowRight, Chrome, Github, Lock, Mail, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { signIn, useSession } from 'next-auth/react';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const { showToast } = useApp();
    const router = useRouter();
    const { status } = useSession();

    // Redirect if already logged in
    useEffect(() => {
        if (status === 'authenticated') {
            router.replace('/dashboard');
        }
    }, [status, router]);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLogin) {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false
            });

            if (result?.error) {
                showToast("Invalid email or password", "error");
            } else {
                showToast("Logged in successfully!", "success");
                router.push('/dashboard');
            }
        } else {
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (res.ok) {
                    showToast("Account created! Please sign in.", "success");
                    setIsLogin(true);
                } else {
                    const data = await res.json();
                    showToast(data.error || "Registration failed", "error");
                }
            } catch (error) {
                showToast("Something went wrong", "error");
            }
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 lg:p-8 relative overflow-hidden bg-slate-950">
            {/* Background elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full"></div>
            </div>

            <div className="w-full max-w-4xl min-h-[550px] lg:min-h-[600px] grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-white/10 transition-all duration-500">
                {/* Left Side - Form */}
                <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center bg-white dark:bg-slate-900">
                    <div className="mb-6 lg:mb-8 text-center lg:text-left">
                        <div className="lg:hidden flex justify-center mb-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                J
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                            {isLogin ? 'Enter your details to access your workspace' : 'Join Juggler and start managing your projects today'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                        {!isLogin && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm text-gray-900 dark:text-white"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm text-gray-900 dark:text-white"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-12 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm text-gray-900 dark:text-white"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword ? "HIDE" : "SHOW"}
                                </button>
                            </div>
                        </div>

                        {isLogin && (
                            <div className="flex justify-end">
                                <button type="button" className="text-xs text-blue-600 hover:underline">Forgot password?</button>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-2 group text-sm md:text-base"
                        >
                            {isLogin ? 'Sign In' : 'Create Account'}
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-6 md:mt-8 text-center">
                        <div className="relative mb-5 md:mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100 dark:border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px]">
                                <span className="px-4 bg-white dark:bg-slate-900 text-gray-400 uppercase tracking-widest font-bold">Or continue with</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => signIn('google')}
                            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-100 dark:border-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group"
                        >
                            <Chrome size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <span className="text-sm font-medium text-gray-600 dark:text-slate-300">Continue with Google</span>
                        </button>
                    </div>

                    <p className="mt-6 md:mt-8 text-center text-xs md:text-sm text-gray-500 dark:text-slate-500">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-1 text-blue-600 font-bold hover:underline"
                        >
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>

                {/* Right Side - Visuals */}
                <div className="hidden lg:block relative overflow-hidden bg-slate-900">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-black">
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_50%)]"></div>
                        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10"
                            style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-10 text-center text-white z-10">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl rotate-12 animate-pulse">
                            <span className="text-3xl font-black">J</span>
                        </div>
                        <h1 className="text-3xl font-black mb-3 tracking-tighter uppercase italic">Master Your Projects</h1>
                        <p className="text-sm text-blue-100/60 max-w-[280px] font-light leading-relaxed">
                            The all-in-one productivity tool for teams who want to build better, together.
                        </p>

                        <div className="mt-12 grid grid-cols-2 gap-8 w-full max-w-[240px] mx-auto relative">
                            <div className="text-center relative z-10">
                                <h4 className="text-3xl font-black text-white mb-1">99.9%</h4>
                                <p className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-black">Uptime</p>
                            </div>
                            <div className="text-center relative z-10">
                                <h4 className="text-3xl font-black text-white mb-1">24/7</h4>
                                <p className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-black">Support</p>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-10 bg-white/10"></div>
                        </div>

                        <div className="mt-auto pt-8">
                            <p className="text-[10px] text-white/20 font-medium tracking-widest uppercase">Trusted by 10,000+ Teams</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

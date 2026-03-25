'use client'

import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  Globe,
  Layers,
  Play,
  Shield,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function LandingPage() {
  const router = useRouter();
  const { status } = useSession();
  const [scrolled, setScrolled] = useState(false);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 selection:text-blue-200">
      {/* BACKGROUND ANIMATION */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              J
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">Juggler</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Workflow</a>
            <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Enterprise</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/auth')}
              className="text-sm font-semibold hover:text-blue-400 transition-colors hidden sm:block"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/auth')}
              className="bg-white text-slate-950 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-500 hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 animate-bounce">
            <Zap size={14} />
            Next-Gen Workspace v2.0 is live
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
            Manage Projects with <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">Zero Friction.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            The ultimate high-performance workspace designed for speed-obsessed teams.
            Orchestrate complex workflows with an interface that feels like the future.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/auth')}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 rounded-full font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 hover:scale-105 transition-all shadow-2xl shadow-blue-600/20 group"
            >
              Start for Free
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
              <Play size={18} fill="currentColor" />
              Watch Demo
            </button>
          </div>

          {/* HERO MOCKUP */}
          <div className="mt-20 relative px-4 lg:px-0">
            <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full w-2/3 mx-auto h-2/3"></div>
            <div className="relative bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl translate-y-0 group hover:-translate-y-2 transition-transform duration-700">
              <div className="bg-slate-800/50 p-3 flex gap-2 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
              <div className="p-4 md:p-8 aspect-video bg-slate-950 flex items-center justify-center relative overflow-hidden">
                <div className="grid grid-cols-3 gap-6 w-full opacity-40">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-4">
                      <div className="h-4 w-3/4 bg-slate-800 rounded"></div>
                      <div className="p-6 bg-slate-900 rounded-xl border border-white/5 space-y-3">
                        <div className="h-2 w-full bg-slate-800 rounded"></div>
                        <div className="h-2 w-2/3 bg-slate-800 rounded"></div>
                      </div>
                      <div className="p-6 bg-slate-900 rounded-xl border border-white/5 space-y-3">
                        <div className="h-2 w-full bg-slate-800 rounded"></div>
                        <div className="h-2 w-1/2 bg-slate-800 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="px-6 py-3 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full text-3xl font-black italic tracking-widest shadow-2xl">
                    COMING SOON
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGOS */}
      <section className="py-12 border-y border-white/5 bg-slate-950/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8">Powering the world's most innovative teams</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
            {['SpaceX', 'Dynamic', 'Aether', 'NeuralNet', 'Horizon'].map(name => (
              <span key={name} className="text-xl font-black italic tracking-tighter uppercase">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* BENTO FEATURES */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">Everything you need to <br /><span className="text-blue-500 italic">scale faster.</span></h2>
            <p className="text-slate-400 max-w-xl font-light">Powerhouse features packed into a minimalist interface.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* FEATURE 1 - Large */}
            <div className="md:col-span-2 p-8 md:p-12 rounded-3xl bg-slate-900 border border-white/10 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 mb-6 font-black group-hover:scale-110 transition-transform">
                    <Layers />
                  </div>
                  <h3 className="text-3xl font-black mb-4 tracking-tight">Multi-Layer Workflow</h3>
                  <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
                    Break down massive projects into infinitely nestable sub-tasks without losing sight of the big picture.
                  </p>
                </div>
                <div className="mt-auto">
                  <button className="flex items-center gap-2 text-sm font-bold text-blue-400 group-hover:gap-4 transition-all">
                    Learn how it works <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              {/* Decorative element */}
              <div className="absolute right-[-10%] bottom-[-10%] w-2/3 aspect-video bg-blue-600/10 rotate-12 blur-3xl group-hover:bg-blue-600/20 transition-colors"></div>
            </div>

            {/* FEATURE 2 */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-white/10 group hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-400 mb-6 font-black group-hover:scale-110 transition-transform">
                <Shield />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">Encrypted Storage</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 font-light">
                Military-grade protection for your most sensitive project data and internal communications.
              </p>
              <img src="https://img.icons8.com/isometric/100/null/lock.png" alt="Lock" className="w-24 mt-4 opacity-50 block mx-auto group-hover:rotate-12 transition-transform" />
            </div>

            {/* FEATURE 3 */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-white/10 group hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center text-emerald-400 mb-6 font-black group-hover:scale-110 transition-transform">
                <Globe />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">Global Sync</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 font-light">
                Real-time collaboration across continents with zero latency. Every keystroke synced instantly.
              </p>
              <div className="mt-8 flex justify-center">
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-emerald-500 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* FEATURE 4 - Large */}
            <div className="md:col-span-2 p-8 md:p-12 rounded-3xl bg-slate-900 border border-white/10 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
              <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 mb-6 font-black group-hover:scale-110 transition-transform">
                    <BarChart3 />
                  </div>
                  <h3 className="text-3xl font-black mb-4 tracking-tight">Advanced Analytics</h3>
                  <p className="text-slate-400 mb-8 leading-relaxed font-light">
                    Predict project bottlenecks before they happen with our AI-powered performance engine. Visualize everything.
                  </p>
                  <button className="flex items-center gap-2 text-sm font-bold text-indigo-400 group-hover:gap-4 transition-all">
                    Explore the engine <ChevronRight size={16} />
                  </button>
                </div>
                <div className="flex-1 w-full p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex justify-between items-end h-32 gap-1">
                    {[40, 70, 45, 90, 65, 80, 50, 95].map((h, i) => (
                      <div key={i} className="flex-1 bg-indigo-500/30 group-hover:bg-indigo-500 transition-all rounded-t" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="py-20 bg-blue-600 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
          <div className="text-center">
            <div className="text-5xl font-black mb-2 italic">10M+</div>
            <div className="text-blue-100/70 text-sm font-bold uppercase tracking-widest">Tasks Done</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black mb-2 italic">99.9%</div>
            <div className="text-blue-100/70 text-sm font-bold uppercase tracking-widest">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black mb-2 italic">250K+</div>
            <div className="text-blue-100/70 text-sm font-bold uppercase tracking-widest">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black mb-2 italic">150+</div>
            <div className="text-blue-100/70 text-sm font-bold uppercase tracking-widest">Countries</div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 px-6 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-[150px] rounded-full scale-150"></div>
          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-none">Ready to reclaim <br /> your <span className="text-blue-500 italic uppercase">Time</span>?</h2>
            <p className="text-xl text-slate-400 mb-12 font-light">Join the future of project management today. No credit card required.</p>
            <button
              onClick={() => router.push('/auth')}
              className="inline-flex items-center gap-4 px-10 py-5 bg-white text-slate-950 rounded-full font-black text-xl hover:bg-blue-500 hover:text-white transition-all hover:scale-105 shadow-2xl group"
            >
              Build Your Workspace
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg">
                J
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic">Juggler</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 font-light">
              Crafting the future of human productivity through elegant software and AI orchestration.
            </p>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"></div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-white mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Overview</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Features</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Solutions</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Tutorials</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li className="hover:text-blue-400 cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Careers</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Privacy</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Terms</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-white mb-6">Newsletter</h4>
            <p className="text-slate-500 text-sm mb-6 font-light">Get high-performance productivity tips delivered weekly.</p>
            <div className="flex p-1 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
              <input type="text" placeholder="Email" className="flex-1 bg-transparent px-4 py-2 outline-none text-sm" />
              <button className="bg-white text-slate-950 px-4 rounded-full font-black text-xs hover:bg-blue-500 hover:text-white transition-colors">JOIN</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-xs text-slate-600 font-medium tracking-[0.2em] uppercase">
          © 2026 Juggler Technologies Inc. All rights reserved. Built for the era of intelligence.
        </div>
      </footer>
    </div>
  );
}
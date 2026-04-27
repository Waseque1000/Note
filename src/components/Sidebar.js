'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  StickyNote, 
  Calendar, 
  Settings, 
  Plus
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'My Journal', icon: StickyNote, path: '/notes' },
  { name: 'Planner', icon: Calendar, path: '/calendar' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-80 h-screen bg-[#FCFAF7] dark:bg-[#141413] flex flex-col shrink-0 transition-colors p-12 select-none">
      {/* Mac Style Dots */}
      <div className="mac-dots mb-16">
        <div className="mac-dot mac-dot-red shadow-sm" />
        <div className="mac-dot mac-dot-yellow shadow-sm" />
        <div className="mac-dot mac-dot-green shadow-sm" />
      </div>

      <div className="mb-16 px-2">
        <div className="flex items-center gap-3.5 mb-1.5">
          <div className="w-10 h-10 rounded-[14px] bg-[#D98B5F] flex items-center justify-center text-white font-black text-xl shadow-xl shadow-[#D98B5F]/20 transition-transform hover:rotate-6">
            N
          </div>
          <span className="font-black text-2xl tracking-tighter text-[#1E293B] dark:text-white uppercase leading-none">Notepad</span>
        </div>
        <p className="text-[10px] font-black text-[#D98B5F]/70 uppercase tracking-[0.3em] ml-1.5">Studio Workspace</p>
      </div>

      <div className="space-y-1.5 flex-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 ml-6 opacity-60">General</p>
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-5 px-6 py-4.5 rounded-[20px] transition-all duration-500 group relative ${
                  isActive 
                    ? 'bg-white dark:bg-[#1C1C1A] text-[#D98B5F] shadow-premium border border-slate-100/50 dark:border-white/5' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-[#D98B5F] hover:bg-white/40 dark:hover:bg-white/5'
                }`}
              >
                <item.icon size={19} className={isActive ? 'text-[#D98B5F]' : 'text-slate-400 group-hover:text-[#D98B5F]'} strokeWidth={isActive ? 3 : 2} />
                <span className={`text-[14px] tracking-tight ${isActive ? 'font-black' : 'font-bold'}`}>{item.name}</span>
                {isActive && <div className="absolute right-5 w-2 h-2 rounded-full bg-[#D98B5F] shadow-[0_0_10px_rgba(217,139,95,0.4)]" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto pt-10">
        <button className="w-full h-16 bg-[#1E293B] dark:bg-[#D98B5F] hover:bg-[#0F172A] hover:scale-[1.02] active:scale-[0.98] text-white font-black rounded-[20px] flex items-center justify-center gap-4 transition-all duration-500 shadow-2xl shadow-slate-200 dark:shadow-none mb-10 uppercase tracking-[0.25em] text-[10px]">
          <Plus size={20} />
          Create
        </button>

        <Link href="/settings" className="flex items-center gap-4 px-6 py-2 text-slate-400 hover:text-[#D98B5F] transition-all font-black text-[10px] uppercase tracking-[0.3em]">
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </aside>
  );
}

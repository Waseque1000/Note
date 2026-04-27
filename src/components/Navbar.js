'use client';

import { Search, Bell, Plus, LayoutDashboard, StickyNote, Calendar } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Notes', path: '/notes', icon: StickyNote },
    { name: 'Planner', path: '/calendar', icon: Calendar },
  ];

  return (
    <nav className="h-20 bg-white border-b border-gray-100 flex items-center sticky top-0 z-50">
      <div className="max-w-7xl mx-auto w-full px-8 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D98B5F] flex items-center justify-center text-white font-bold text-lg">
              N
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">Notepad</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive ? 'bg-gray-50 text-[#D98B5F]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group hidden lg:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-64 h-10 bg-gray-50 border-transparent focus:bg-white focus:border-[#D98B5F]/20 rounded-xl pl-10 pr-4 text-sm font-medium outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-900 transition-colors">
              <Bell size={20} />
            </button>
            <Link href="/notes" className="px-5 py-2.5 bg-[#D98B5F] text-white text-sm font-bold rounded-xl hover:bg-[#C47A50] transition-all flex items-center gap-2 shadow-sm">
              <Plus size={18} />
              Create
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

'use client';

import { useState } from 'react';
import { Search, Plus, BarChart2, CheckCircle2, Menu, X, StickyNote, Calendar, LayoutGrid } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart2 },
    { name: 'Planner', path: '/planner', icon: LayoutGrid },
    { name: 'Notes', path: '/notes', icon: StickyNote },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
  ];

  return (
    <nav className="h-20 bg-[#FCFAF7] flex items-center sticky top-0 z-50 px-4 md:px-8 border-b border-gray-100/50">
      <div className="w-full flex items-center justify-between max-w-[1600px] mx-auto">
        
        {/* Left Side: Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 md:hidden text-gray-500 hover:text-black"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <Link href="/planner" className="flex items-center gap-2.5 group">
            <div className="text-[#D98B5F] bg-[#D98B5F]/10 rounded-full p-1 group-hover:scale-105 transition-transform">
               <CheckCircle2 size={24} strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-lg md:text-xl tracking-tight text-gray-900 hidden sm:block">
              Daily Planner
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden lg:flex items-center gap-2">
           {navItems.map((item) => {
             const isActive = pathname === item.path;
             return (
               <Link 
                 key={item.path} 
                 href={item.path}
                 className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                   isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                 }`}
               >
                 <item.icon size={16} className={isActive ? "text-[#D98B5F]" : "text-gray-400"} />
                 {item.name}
               </Link>
             )
           })}
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <button className="h-10 px-4 md:px-5 flex items-center gap-2 bg-white border border-gray-200/60 hover:bg-gray-50 hover:border-gray-300 rounded-full transition-all text-gray-600 shadow-sm">
            <Search size={16} className="text-gray-400" />
            <span className="text-sm font-semibold hidden md:block">Search</span>
          </button>

          <button className="h-10 px-4 md:px-5 flex items-center gap-2 bg-[#D98B5F] hover:bg-[#C47A50] text-white rounded-full transition-all shadow-sm hover:shadow-md">
            <Plus size={18} strokeWidth={2.5} />
            <span className="text-sm font-bold hidden xs:block">New Task</span>
          </button>

          <div className="ml-2 pl-2 md:pl-4 border-l border-gray-200">
             <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden cursor-pointer border-2 border-white shadow-sm flex-shrink-0">
                <img 
                  src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0" 
                  alt="Profile Avatar" 
                  className="w-full h-full object-cover"
                />
             </div>
          </div>
        </div>

      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl lg:hidden animate-fade-in">
          <div className="p-4 flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    isActive ? 'bg-[#D98B5F]/10 text-[#D98B5F]' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

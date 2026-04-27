'use client';

import { useState } from 'react';
import { Search, Bell, Plus, LayoutDashboard, StickyNote, Calendar, Menu, X } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Notes', path: '/notes', icon: StickyNote },
    { name: 'Planner', path: '/calendar', icon: Calendar },
  ];

  return (
    <nav className="h-20 bg-white border-b border-gray-100 flex items-center sticky top-0 z-50">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-12">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 md:hidden text-gray-500 hover:text-black"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D98B5F] flex items-center justify-center text-white font-bold text-lg">
              N
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">Notepad</span>
          </Link>

          {/* Desktop Nav */}
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

        <div className="flex items-center gap-3 md:gap-6">
          <div className="relative group hidden lg:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-48 xl:w-64 h-10 bg-gray-50 border-transparent focus:bg-white focus:border-[#D98B5F]/20 rounded-xl pl-10 pr-4 text-sm font-medium outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button className="w-10 h-10 hidden sm:flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-900 transition-colors">
              <Bell size={20} />
            </button>
            <Link href="/notes" className="px-4 md:px-5 py-2.5 bg-[#D98B5F] text-white text-xs md:text-sm font-bold rounded-xl hover:bg-[#C47A50] transition-all flex items-center gap-2 shadow-sm">
              <Plus size={18} />
              <span className="hidden xs:block">Create</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl md:hidden animate-fade-in">
          <div className="p-4 flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold transition-all ${
                    isActive ? 'bg-[#D98B5F]/5 text-[#D98B5F]' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              );
            })}
            <div className="h-px bg-gray-50 my-2" />
            <div className="relative p-2">
              <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search archives..." 
                className="w-full h-12 bg-gray-50 rounded-xl pl-12 pr-4 text-sm font-medium outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

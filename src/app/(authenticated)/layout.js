'use client';

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';
import { usePathname } from 'next/navigation';

export default function AuthenticatedLayout({ children }) {
  const pathname = usePathname();
  
  return (
    <div className="flex h-screen bg-[#FAF8F5] transition-colors">
      <Toaster position="bottom-right" />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:px-8 md:py-2 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

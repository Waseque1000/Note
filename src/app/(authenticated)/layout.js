import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';

export default function AuthenticatedLayout({ children }) {
  return (
    <div className="flex h-screen bg-white transition-colors">
      <Toaster position="bottom-right" />
      {/* Sidebar removed as per user request */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

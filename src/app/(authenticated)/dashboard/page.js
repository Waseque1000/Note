'use client';

import { useState, useEffect } from 'react';
import { 
  StickyNote, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Plus,
  Loader2
} from "lucide-react";
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data } = await axios.get('/api/notes');
      setNotes(data);
    } catch (error) {
      console.error("Failed to fetch notes");
    } finally {
      setIsLoading(false);
    }
  };

  const pinnedCount = notes.filter(n => n.isPinned).length;
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt || b.date) - new Date(a.updatedAt || a.date))
    .slice(0, 3);

  const stats = [
    { title: "Total Notes", value: notes.length, icon: StickyNote, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Pinned Items", value: pinnedCount, icon: Sparkles, color: "text-amber-500", bg: "bg-amber-50" },
    { title: "Last Update", value: notes.length > 0 ? format(new Date(recentNotes[0]?.updatedAt || recentNotes[0]?.date), 'MMM dd') : 'None', icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor your journal activity and recent entries.</p>
        </div>
        <Link href="/notes" className="px-6 py-3 bg-[#D98B5F] text-white font-bold rounded-xl hover:bg-[#C47A50] transition-all flex items-center gap-2 shadow-sm">
          <Plus size={20} />
          New Entry
        </Link>
      </header>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 text-gray-300">
          <Loader2 className="animate-spin text-[#D98B5F]" size={40} />
          <p className="text-sm font-bold uppercase tracking-widest">Syncing Data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={stat.color} size={28} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Recently Updated</h2>
              <Link href="/notes" className="text-sm font-semibold text-[#D98B5F] hover:underline flex items-center gap-1">
                View all
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentNotes.length > 0 ? (
                recentNotes.map((note) => (
                  <Link key={note._id} href="/notes" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#D98B5F] transition-colors">
                         <Clock size={20} />
                      </div>
                      {note.isPinned && <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" />}
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-[#D98B5F] transition-colors mb-2 line-clamp-1">{note.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed mb-4">{note.content}</p>
                    <div className="flex flex-wrap gap-2">
                      {note.tags?.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-gray-400 px-2 py-1 bg-gray-50 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
                  <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No entries yet</p>
                  <Link href="/notes" className="mt-4 inline-block text-[#D98B5F] font-bold text-sm hover:underline">
                    Create your first note
                  </Link>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

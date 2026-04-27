'use client';

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, ArrowRight, Plus, StickyNote } from "lucide-react";
import { format, isSameDay } from 'date-fns';
import axios from 'axios';
import Link from 'next/link';

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await axios.get('/api/notes');
      setNotes(data);
    } catch (error) {
      console.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedNotes = notes.filter(note => note.date && isSameDay(new Date(note.date), date));

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayNotes = notes.filter(n => n.date && isSameDay(new Date(n.date), date));
      
      if (dayNotes.length > 0) {
        return (
          <div className="flex justify-center mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#D98B5F]" />
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col animate-fade-in max-w-7xl mx-auto overflow-hidden">
      {/* Header Removed as per user request */}

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <Loader2 className="animate-spin text-[#D98B5F]" size={48} />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Indexing Archive...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1 min-h-0">
          {/* Studio Calendar Section */}
          <div className="lg:col-span-5 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 p-8 flex flex-col">
            <div className="mb-6 flex items-center justify-between">
               <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Select Date</h3>
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(date, 'MMMM yyyy')}</div>
            </div>
            <div className="flex-1">
              <Calendar
                onChange={setDate}
                value={date}
                tileContent={tileContent}
                prevLabel={<ChevronLeft size={18} className="mx-auto" />}
                nextLabel={<ChevronRight size={18} className="mx-auto" />}
                formatShortWeekday={(locale, date) => format(date, 'EE')}
              />
            </div>
            <div className="mt-8 pt-6 border-t border-gray-50 flex gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D98B5F]" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Recorded</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Empty</span>
               </div>
            </div>
          </div>

          {/* Agenda Feed */}
          <div className="lg:col-span-7 flex flex-col min-h-0">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-8 border-b border-gray-50 bg-[#FCFAF7]/30 flex justify-between items-center shrink-0">
                <div className="space-y-1">
                   <span className="text-[#D98B5F] font-black text-[9px] uppercase tracking-[0.2em] block">{format(date, 'EEEE')}</span>
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight">{format(date, 'MMMM dd, yyyy')}</h2>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex flex-col items-center justify-center shadow-lg">
                  <span className="text-[9px] font-bold uppercase opacity-60 leading-none mb-1">{format(date, 'MMM')}</span>
                  <span className="text-xl font-black leading-none">{format(date, 'dd')}</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {selectedNotes.length > 0 ? (
                  <div className="grid gap-4">
                    {selectedNotes.map(note => (
                      <Link key={note._id} href="/notes" className="group flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-50 hover:border-[#D98B5F]/20 transition-all shadow-sm hover:shadow-lg">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#D98B5F] transition-colors shrink-0">
                           <StickyNote size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center mb-1">
                              <h4 className="font-bold text-gray-900 group-hover:text-[#D98B5F] transition-colors truncate text-base tracking-tight">{note.title}</h4>
                              <ArrowRight size={14} className="text-gray-300 group-hover:text-[#D98B5F] group-hover:translate-x-1 transition-all" />
                           </div>
                           <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{note.content}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200 mb-4 border border-dashed border-gray-200">
                       <CalendarIcon size={24} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 tracking-tight uppercase">No recorded entries</h3>
                    <Link href="/notes" className="mt-4 px-6 py-2.5 bg-gray-900 text-white font-bold text-[9px] uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-lg">
                      Add Entry
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

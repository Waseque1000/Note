'use client';

import { Pin, Trash2, Edit3, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function NoteCard({ note, onEdit, onDelete, onTogglePin }) {
  const { title, content, tags, color, isPinned, date } = note;
  
  const MAX_SIZE = 1000;
  const contentSize = content?.length || 0;
  const progress = Math.min((contentSize / MAX_SIZE) * 100, 100);
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full overflow-hidden">
      {/* Top Accent Strip */}
      <div 
        className="h-1.5 w-full" 
        style={{ backgroundColor: color || '#D98B5F' }} 
      />

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 line-clamp-1 leading-tight group-hover:text-[#D98B5F] transition-colors">{title}</h3>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-1">
              {date ? format(new Date(date), 'MMM dd, yyyy') : 'Recently'}
            </p>
          </div>
          <button 
            onClick={() => onTogglePin(note)}
            className={`p-1.5 rounded-lg transition-all ${isPinned ? "text-[#D98B5F] bg-[#D98B5F]/5" : "text-gray-300 hover:text-[#D98B5F]"}`}
          >
            <Pin size={16} fill={isPinned ? "currentColor" : "none"} />
          </button>
        </div>
        
        <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-4 flex-1">
          {content}
        </p>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
            <span>Entry Size</span>
            <span>{contentSize} / {MAX_SIZE}</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {tags?.map((tag, index) => (
            <span key={index} className="text-[10px] font-bold text-gray-500 px-2 py-1 bg-gray-50 rounded-md">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex gap-2">
        <button 
          onClick={() => onEdit(note)}
          className="flex-1 h-9 bg-white border border-gray-200 text-gray-700 text-[11px] font-bold rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5"
        >
          <Edit3 size={14} />
          Edit
        </button>
        <button 
          onClick={() => onDelete(note._id)}
          className="flex-1 h-9 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );
}

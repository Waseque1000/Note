'use client';
import { Pin, Trash2, Edit3 } from "lucide-react";
import { format } from "date-fns";

export default function NoteCard({ note, onEdit, onDelete, onTogglePin }) {
  const { title, content, tags, color, isPinned, date } = note;
  
  const MAX_SIZE = 1000;
  const contentSize = content?.length || 0;
  const progress = Math.min((contentSize / MAX_SIZE) * 100, 100);
  
  // Custom transparent colors based on note color for a soft pastel look
  const accentColor = color || '#D98B5F';
  const softBg = `${accentColor}08`; // ~3% opacity
  const softBorder = `${accentColor}25`; // ~14% opacity
  const tagBg = `${accentColor}12`; // ~7% opacity
  
  const handleCardClick = (e) => {
    // Prevent triggering edit if clicking on action buttons
    if (e.target.closest('button')) return;
    onEdit(note);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-gray-100 hover:border-gray-200/80 shadow-sm hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer"
      style={{ 
        backgroundColor: softBg,
        borderColor: softBorder
      }}
    >
      {/* Top Accent Strip */}
      <div 
        className="h-1.5 w-full shrink-0" 
        style={{ backgroundColor: accentColor }} 
      />

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Title and Pin Button */}
          <div className="flex justify-between items-start mb-3 gap-2">
            <h3 className="font-bold text-base md:text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1 leading-tight">
              {title}
            </h3>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note);
              }}
              className={`p-1.5 rounded-lg transition-all shrink-0 hover:bg-white/80 active:scale-95 ${
                isPinned 
                  ? "text-amber-500 bg-amber-500/10 shadow-sm" 
                  : "text-gray-300 hover:text-amber-500"
              }`}
            >
              <Pin size={15} fill={isPinned ? "currentColor" : "none"} />
            </button>
          </div>
          
          {/* Note Content */}
          <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-5 line-clamp-4 font-medium whitespace-pre-wrap">
            {content}
          </p>
        </div>

        {/* Footer Area with Progress, Tags & Actions */}
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              <span>Size Indicator</span>
              <span>{contentSize} / {MAX_SIZE}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100/80 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500" 
                style={{ 
                  width: `${progress}%`, 
                  backgroundColor: accentColor 
                }} 
              />
            </div>
          </div>
          
          {/* Tags list & Actions Row */}
          <div className="flex justify-between items-center pt-1 gap-2">
            {/* Tags */}
            <div className="flex flex-wrap gap-1 max-w-[70%]">
              {tags?.slice(0, 3).map((tag, index) => (
                <span 
                  key={index} 
                  className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                  style={{
                    backgroundColor: tagBg,
                    color: accentColor
                  }}
                >
                  {tag}
                </span>
              ))}
              {tags?.length > 3 && (
                <span className="text-[9px] font-bold text-gray-400 px-1 py-0.5">
                  +{tags.length - 3}
                </span>
              )}
            </div>

            {/* Hover Actions (highly stylized) */}
            <div className="flex items-center gap-1 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(note);
                }}
                className="p-2 bg-white/90 hover:bg-white border border-gray-100 text-gray-600 hover:text-primary rounded-lg transition-all active:scale-95 shadow-sm"
                title="Edit Note"
              >
                <Edit3 size={13} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note._id);
                }}
                className="p-2 bg-white/90 hover:bg-red-50 border border-gray-100 hover:border-red-100 text-gray-400 hover:text-red-500 rounded-lg transition-all active:scale-95 shadow-sm"
                title="Delete Note"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


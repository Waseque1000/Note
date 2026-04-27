'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      <div className="bg-white dark:bg-[#1c1c1a] w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden border border-slate-100 dark:border-[#2e2e2b] transition-colors flex flex-col max-h-[90vh]">
        <div className="px-10 pt-10 pb-4 flex justify-between items-center">
          <h2 className="text-2xl font-black text-[#1e293b] dark:text-white tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#fcfaf7] dark:hover:bg-[#141413] text-slate-400 hover:text-[#d98b5f] transition-all"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="px-10 pb-6 flex-1 overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="px-10 pt-4 pb-10 flex gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

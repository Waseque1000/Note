'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, StickyNote, Loader2, Filter, X, Save, Pin, Palette, Tag } from "lucide-react";
import NoteCard from "@/components/NoteCard";
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [currentNote, setCurrentNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    color: '#D98B5F',
    isPinned: false
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    const filtered = notes.filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredNotes(filtered);
  }, [searchQuery, notes]);

  const fetchNotes = async () => {
    try {
      const { data } = await axios.get('/api/notes');
      setNotes(data);
      setFilteredNotes(data);
    } catch (error) {
      toast.error("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditor = (note = null) => {
    if (note) {
      setCurrentNote(note);
      setFormData({
        title: note.title,
        content: note.content,
        tags: note.tags?.join(', ') || '',
        color: note.color || '#D98B5F',
        isPinned: note.isPinned
      });
    } else {
      setCurrentNote(null);
      setFormData({
        title: '',
        content: '',
        tags: '',
        color: '#D98B5F',
        isPinned: false
      });
    }
    setIsEditorOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    document.body.style.overflow = 'unset';
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      };

      if (currentNote) {
        await axios.put(`/api/notes/${currentNote._id}`, payload);
      } else {
        await axios.post('/api/notes', payload);
      }
      fetchNotes();
      handleCloseEditor();
      toast.success("Archive synchronized");
    } catch (error) {
      toast.error("Cloud sync failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Permanently remove this entry?")) {
      try {
        await axios.delete(`/api/notes/${id}`);
        fetchNotes();
        toast.success("Entry removed");
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  const handleTogglePin = async (note) => {
    try {
      await axios.put(`/api/notes/${note._id}`, { isPinned: !note.isPinned });
      fetchNotes();
    } catch (error) {
      toast.error("Pin failed");
    }
  };

  return (
    <div className="space-y-8 md:space-y-10 animate-fade-in pb-20 px-1 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-gray-50 pb-8 md:pb-10">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase">Vault.</h1>
          <p className="text-gray-400 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.3em] mt-1">Stored inspirations & archives</p>
        </div>
        <button 
          onClick={() => handleOpenEditor()}
          className="w-full md:w-auto h-12 md:h-14 px-8 bg-black text-white font-bold rounded-xl md:rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
        >
          <Plus size={20} strokeWidth={3} />
          New Entry
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-3 md:p-4 rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100 items-center max-w-4xl mx-auto">
        <div className="flex-1 relative w-full group">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" />
          <input
            type="text"
            placeholder="Search archives..."
            className="w-full h-10 md:h-12 bg-gray-50 border-transparent focus:bg-white focus:border-gray-100 rounded-xl pl-12 md:pl-14 pr-4 outline-none transition-all font-bold text-xs md:text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="hidden sm:flex h-12 px-6 items-center gap-2 font-bold text-xs text-gray-400 bg-gray-50 rounded-xl hover:text-black transition-colors">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {isLoading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4 text-gray-200">
          <Loader2 className="animate-spin" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredNotes.map((note) => (
            <NoteCard 
              key={note._id} 
              note={note} 
              onEdit={handleOpenEditor} 
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
            />
          ))}
        </div>
      )}

      {/* Responsive Immersive Studio Editor Overlay */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-fade-in overflow-hidden">
          {/* Editor Header */}
          <header className="h-16 md:h-24 border-b border-gray-50 flex items-center px-4 md:px-16 justify-between shrink-0">
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={handleCloseEditor}
                className="p-2 md:p-3 rounded-lg md:rounded-xl hover:bg-gray-50 text-gray-400 hover:text-black transition-all"
              >
                <X size={24} />
              </button>
              <div className="h-6 md:h-8 w-px bg-gray-100 hidden xs:block" />
              <div className="hidden xs:block">
                <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{currentNote ? 'Editing' : 'New'}</p>
                <p className="text-[10px] md:text-xs font-bold text-gray-900 truncate max-w-[100px] sm:max-w-[200px]">{formData.title || 'Untitled Archive'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => setFormData({...formData, isPinned: !formData.isPinned})}
                className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all ${formData.isPinned ? 'bg-amber-50 text-amber-500 shadow-inner' : 'bg-gray-50 text-gray-400'}`}
              >
                <Pin size={20} fill={formData.isPinned ? "currentColor" : "none"} />
              </button>
              
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-10 md:h-12 px-4 md:px-8 bg-black text-white font-bold rounded-lg md:rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 md:gap-3 uppercase tracking-widest text-[9px] md:text-[10px]"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span className="hidden sm:block">Sync</span>
                <span className="sm:hidden">Save</span>
              </button>
            </div>
          </header>

          {/* Editor Workspace */}
          <div className="flex-1 overflow-y-auto flex justify-center py-8 md:py-20 px-6 md:px-8">
            <div className="w-full max-w-4xl space-y-6 md:space-y-12">
              <input
                type="text"
                placeholder="Entry Headline"
                className="w-full text-4xl sm:text-5xl md:text-7xl font-black text-black border-none outline-none placeholder:text-gray-200 tracking-tighter"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                autoFocus
              />

              <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12 pb-6 md:pb-8 border-b border-gray-100">
                <div className="flex items-center gap-3 text-gray-500">
                  <Tag size={16} />
                  <input
                    type="text"
                    placeholder="add, tags..."
                    className="bg-transparent border-none outline-none text-[11px] font-bold uppercase tracking-widest w-full sm:w-64 placeholder:text-gray-300"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  />
                </div>
                
                <div className="flex items-center gap-3 text-gray-500">
                  <Palette size={16} />
                  <div className="flex items-center gap-2">
                    {['#D98B5F', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'].map(c => (
                      <button
                        key={c}
                        onClick={() => setFormData({...formData, color: c})}
                        className={`w-5 h-5 rounded-full transition-transform ${formData.color === c ? 'scale-125 border-2 border-white ring-1 ring-gray-200 shadow-sm' : 'hover:scale-110'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <textarea
                placeholder="Elaborate on your inspirations here..."
                className="w-full h-[400px] md:h-[600px] text-lg md:text-xl font-medium text-gray-900 border-none outline-none resize-none placeholder:text-gray-200 leading-relaxed pb-32"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

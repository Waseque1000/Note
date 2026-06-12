'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  StickyNote, 
  Loader2, 
  X, 
  Save, 
  Pin, 
  Tag, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Check, 
  RotateCcw
} from "lucide-react";
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
  
  // Advanced filter & sorting states
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [pinnedFilter, setPinnedFilter] = useState('all'); // 'all' | 'pinned' | 'unpinned'
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'size-desc' | 'size-asc'
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [currentNote, setCurrentNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
    color: '#D98B5F',
    isPinned: false
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  // Sync and apply search, filters, and sorting
  useEffect(() => {
    let result = [...notes];

    // Search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(note => 
        note.title?.toLowerCase().includes(query) || 
        note.content?.toLowerCase().includes(query) ||
        note.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (selectedTag !== 'All') {
      result = result.filter(note => note.tags?.includes(selectedTag));
    }

    // Color filter
    if (selectedColor !== 'All') {
      result = result.filter(note => note.color === selectedColor);
    }

    // Pinned status filter
    if (pinnedFilter === 'pinned') {
      result = result.filter(note => note.isPinned);
    } else if (pinnedFilter === 'unpinned') {
      result = result.filter(note => !note.isPinned);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.updatedAt || b.date || 0) - new Date(a.updatedAt || a.date || 0);
      }
      if (sortBy === 'date-asc') {
        return new Date(a.updatedAt || a.date || 0) - new Date(b.updatedAt || b.date || 0);
      }
      if (sortBy === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'title-desc') {
        return (b.title || '').localeCompare(a.title || '');
      }
      if (sortBy === 'size-desc') {
        return (b.content?.length || 0) - (a.content?.length || 0);
      }
      if (sortBy === 'size-asc') {
        return (a.content?.length || 0) - (b.content?.length || 0);
      }
      return 0;
    });

    setFilteredNotes(result);
  }, [searchQuery, selectedTag, selectedColor, pinnedFilter, sortBy, notes]);

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

  // Extract all unique tags across all notes
  const uniqueTags = Array.from(
    new Set(notes.flatMap(note => note.tags || []).filter(Boolean))
  );

  const handleOpenEditor = (note = null) => {
    if (note) {
      setCurrentNote(note);
      setFormData({
        title: note.title || '',
        content: note.content || '',
        tags: note.tags || [],
        color: note.color || '#D98B5F',
        isPinned: note.isPinned || false
      });
    } else {
      setCurrentNote(null);
      setFormData({
        title: '',
        content: '',
        tags: [],
        color: '#D98B5F',
        isPinned: false
      });
    }
    setTagInput('');
    setIsEditorOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    document.body.style.overflow = 'unset';
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/,/g, '');
      if (cleanTag && !formData.tags.includes(cleanTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, cleanTag]
        });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tagToRemove)
    });
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
        tags: formData.tags.map(tag => tag.trim()).filter(tag => tag !== '')
      };

      if (currentNote) {
        await axios.put(`/api/notes/${currentNote._id}`, payload);
      } else {
        await axios.post('/api/notes', payload);
      }
      fetchNotes();
      handleCloseEditor();
      toast.success(currentNote ? "Entry synchronized" : "New entry saved");
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
      toast.success(note.isPinned ? "Note unpinned" : "Note pinned");
    } catch (error) {
      toast.error("Pin failed");
    }
  };

  const resetFilters = () => {
    setSelectedTag('All');
    setSelectedColor('All');
    setPinnedFilter('all');
    setSortBy('date-desc');
    setSearchQuery('');
    toast.success("Filters reset");
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20 px-1 md:px-0">
      {/* Header section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            Vault
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
              {notes.length} {notes.length === 1 ? 'entry' : 'entries'}
            </span>
          </h1>
          <p className="text-gray-400 font-bold text-[9px] uppercase tracking-[0.25em] mt-1">Stored inspirations & archives</p>
        </div>
        <button 
          onClick={() => handleOpenEditor()}
          className="w-full sm:w-auto h-11 px-6 bg-black hover:bg-gray-800 text-white font-bold rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[9px]"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Entry
        </button>
      </header>

      {/* Search Bar & Primary Actions */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1 relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" />
            <input
              type="text"
              placeholder="Search archives by title, text, or tags..."
              className="w-full h-11 bg-white border border-gray-100 focus:border-gray-200 rounded-xl pl-11 pr-4 outline-none transition-all shadow-sm font-semibold text-xs md:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg"
              >
                <X size={14} />
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`flex-1 sm:flex-initial h-11 px-4 flex items-center justify-center gap-2 font-bold text-xs border rounded-xl shadow-sm transition-all active:scale-95 ${
                isFilterPanelOpen || selectedColor !== 'All' || pinnedFilter !== 'all' || sortBy !== 'date-desc'
                  ? 'bg-slate-900 border-slate-900 text-white' 
                  : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal size={15} />
              <span>Filters</span>
            </button>
            
            {(selectedTag !== 'All' || selectedColor !== 'All' || pinnedFilter !== 'all' || sortBy !== 'date-desc' || searchQuery !== '') && (
              <button 
                onClick={resetFilters}
                className="h-11 px-3 flex items-center justify-center border border-dashed border-gray-200 text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 rounded-xl transition-all"
                title="Reset Filters"
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Expandable Advanced Filter Drawer */}
        {isFilterPanelOpen && (
          <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sort Options */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowUpDown size={12} />
                  Sort Archives
                </label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-9 bg-gray-50 border border-transparent rounded-lg px-3 text-xs font-bold text-gray-700 outline-none focus:bg-white focus:border-gray-200 transition-all"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="title-asc">Title (A - Z)</option>
                  <option value="title-desc">Title (Z - A)</option>
                  <option value="size-desc">Size (Large - Small)</option>
                  <option value="size-asc">Size (Small - Large)</option>
                </select>
              </div>

              {/* Color Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Filter by Accent Color
                </label>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <button 
                    onClick={() => setSelectedColor('All')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                      selectedColor === 'All'
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All
                  </button>
                  {['#D98B5F', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'].map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`w-6 h-6 rounded-full transition-all relative ${
                        selectedColor === c 
                          ? 'scale-110 ring-2 ring-slate-950 ring-offset-1 shadow-sm' 
                          : 'opacity-85 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    >
                      {selectedColor === c && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-[8px] font-black">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pinned Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Pinned Status
                </label>
                <div className="flex bg-gray-50 p-1 rounded-lg border border-transparent gap-1">
                  {['all', 'pinned', 'unpinned'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setPinnedFilter(status)}
                      className={`flex-1 py-1 text-[10px] font-bold rounded-md capitalize transition-all ${
                        pinnedFilter === status
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-gray-500 hover:text-slate-900'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Horizontal Quick Tags Scroll Bar */}
        {uniqueTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none shrink-0 border-b border-gray-50/50 pb-2">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest shrink-0">Tags:</span>
            <button
              onClick={() => setSelectedTag('All')}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg shrink-0 transition-all ${
                selectedTag === 'All'
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            {uniqueTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? 'All' : tag)}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg shrink-0 transition-all flex items-center gap-1.5 ${
                  selectedTag === tag
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 hover:border-gray-200'
                }`}
              >
                <span>{tag}</span>
                {selectedTag === tag && <Check size={10} strokeWidth={3} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid or Empty State */}
      {isLoading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-3 text-gray-300">
          <Loader2 className="animate-spin text-[#D98B5F]" size={40} />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading vault...</p>
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
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
      ) : (
        /* Empty State */
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto p-6 md:p-12">
          <div className="w-14 h-14 rounded-2xl bg-[#D98B5F]/5 flex items-center justify-center text-[#D98B5F] mb-4">
            <StickyNote size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {notes.length === 0 ? "Your vault is empty" : "No matching entries found"}
          </h3>
          <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-sm">
            {notes.length === 0 
              ? "Begin by storing your inspirations, tasks, or daily journal logs inside your secure note archives."
              : "We couldn't find any notes matching your current filters or search terms. Try clearing some constraints."
            }
          </p>
          
          {notes.length === 0 ? (
            <button
              onClick={() => handleOpenEditor()}
              className="mt-6 h-10 px-5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all text-xs"
            >
              Create First Entry
            </button>
          ) : (
            <button
              onClick={resetFilters}
              className="mt-5 text-xs font-bold text-[#D98B5F] hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Clean Center-Glassmorphic Modal Editor Overlay */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center md:items-center p-0 md:p-6 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          {/* Backdrop Overlay Click to Close */}
          <div className="absolute inset-0" onClick={handleCloseEditor} />
          
          {/* Modal Container */}
          <div className="bg-white w-full h-[90vh] md:h-auto md:max-h-[85vh] md:max-w-2xl rounded-t-[2rem] md:rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-gray-100 flex flex-col transition-all duration-300 animate-slide-up">
            {/* Top Color Border */}
            <div className="h-2 w-full shrink-0" style={{ backgroundColor: formData.color }} />
            
            {/* Modal Header */}
            <header className="h-16 md:h-20 border-b border-gray-100 flex items-center px-6 justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCloseEditor}
                  className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-all active:scale-95"
                  title="Close editor"
                >
                  <X size={20} />
                </button>
                <div className="h-6 w-px bg-gray-200" />
                <div className="max-w-[200px] sm:max-w-[300px]">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{currentNote ? 'Editing' : 'New Entry'}</p>
                  <p className="text-xs font-bold text-gray-900 truncate">{formData.title || 'Untitled entry'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setFormData({...formData, isPinned: !formData.isPinned})}
                  className={`p-2.5 rounded-xl transition-all active:scale-95 border ${
                    formData.isPinned 
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-inner' 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 border-transparent'
                  }`}
                  title="Pin entry"
                >
                  <Pin size={15} fill={formData.isPinned ? "currentColor" : "none"} />
                </button>
                
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="h-10 px-5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest text-[9px]"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Sync</span>
                </button>
              </div>
            </header>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-white custom-scrollbar">
              {/* Color Picker / Accent */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-50">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Select Accent</span>
                <div className="flex items-center gap-2">
                  {['#D98B5F', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'].map(c => (
                    <button
                      key={c}
                      onClick={() => setFormData({...formData, color: c})}
                      className={`w-6 h-6 rounded-full transition-all relative ${
                        formData.color === c 
                          ? 'scale-110 ring-2 ring-slate-900 ring-offset-2 shadow-sm' 
                          : 'opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {formData.color === c && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-[9px] font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title field */}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Headline..."
                  className="w-full text-2xl md:text-3xl font-black text-black border-none outline-none placeholder:text-gray-200 tracking-tight"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  autoFocus
                />
              </div>

              {/* Tag Input pill manager */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Tag size={12} />
                  Assigned Tags
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 border border-gray-100 rounded-xl items-center focus-within:bg-white focus-within:border-gray-200 transition-all min-h-[44px]">
                  {formData.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="text-[9px] font-bold text-gray-700 bg-white border border-gray-200 pl-2.5 pr-1.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm shrink-0"
                    >
                      {tag}
                      <button 
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="p-0.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-100 transition-all"
                      >
                        <X size={10} strokeWidth={3} />
                      </button>
                    </span>
                  ))}
                  
                  <input
                    type="text"
                    placeholder={formData.tags.length === 0 ? "add tags (separated by comma)..." : "Add tag..."}
                    className="flex-1 min-w-[150px] bg-transparent border-none outline-none text-xs font-bold text-gray-700 placeholder:text-gray-400 px-1 py-0.5"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => {
                      const cleanTag = tagInput.trim().replace(/,/g, '');
                      if (cleanTag && !formData.tags.includes(cleanTag)) {
                        setFormData({
                          ...formData,
                          tags: [...formData.tags, cleanTag]
                        });
                      }
                      setTagInput('');
                    }}
                  />
                </div>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Press Enter or comma to insert tag</p>
              </div>

              {/* Content area */}
              <div className="space-y-1">
                <textarea
                  placeholder="Elaborate on your inspirations here..."
                  className="w-full min-h-[280px] md:min-h-[360px] text-sm md:text-base font-medium text-gray-700 border-none outline-none resize-none placeholder:text-gray-200 leading-relaxed custom-scrollbar"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


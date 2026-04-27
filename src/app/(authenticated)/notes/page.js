'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, StickyNote, Loader2, Filter } from "lucide-react";
import NoteCard from "@/components/NoteCard";
import Modal from "@/components/Modal";
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleOpenModal = (note = null) => {
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
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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
      setIsModalOpen(false);
      toast.success("Saved successfully");
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this entry?")) {
      try {
        await axios.delete(`/api/notes/${id}`);
        fetchNotes();
        toast.success("Deleted");
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleTogglePin = async (note) => {
    try {
      await axios.put(`/api/notes/${note._id}`, { isPinned: !note.isPinned });
      fetchNotes();
    } catch (error) {
      toast.error("Failed to pin");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Journal</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and search your personal entries.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-[#D98B5F] text-white font-bold rounded-xl hover:bg-[#C47A50] transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} />
          Add Entry
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm items-center">
        <div className="flex-1 relative w-full group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D98B5F] transition-colors" />
          <input
            type="text"
            placeholder="Search by keywords, tags or content..."
            className="w-full h-12 bg-gray-50 border-transparent focus:bg-white focus:border-[#D98B5F]/20 rounded-xl pl-12 pr-4 outline-none transition-all font-semibold text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="h-12 px-6 flex items-center gap-2 font-bold text-sm text-gray-500 bg-gray-50 rounded-xl hover:text-[#D98B5F] transition-colors">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {isLoading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4 text-gray-300">
          <Loader2 className="animate-spin text-[#D98B5F]" size={48} />
          <p className="text-sm font-bold uppercase tracking-widest">Loading entries...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <NoteCard 
                key={note._id} 
                note={note} 
                onEdit={handleOpenModal} 
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
              />
            ))
          ) : (
            <div className="col-span-full py-40 text-center bg-white rounded-3xl border border-gray-100 border-dashed">
              <StickyNote size={64} className="mx-auto text-gray-100 mb-6" />
              <h3 className="text-xl font-bold text-gray-900">No entries found</h3>
              <p className="text-gray-500 text-sm mt-2 mb-8">Start your journey by adding your first note today.</p>
              <button onClick={() => handleOpenModal()} className="px-8 py-3 bg-[#D98B5F] text-white font-bold rounded-xl hover:bg-[#C47A50] transition-all">
                Create First Entry
              </button>
            </div>
          )}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={currentNote ? 'Edit Entry' : 'New Entry'}
        footer={(
          <div className="flex gap-3 w-full">
            <button onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">Discard</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 h-12 bg-[#D98B5F] text-white font-bold rounded-xl shadow-sm hover:bg-[#C47A50] transition-all flex items-center justify-center gap-2">
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        )}
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Title</label>
            <input
              type="text"
              placeholder="Entry Headline..."
              className="w-full h-12 bg-gray-50 border-transparent focus:bg-white focus:border-[#D98B5F]/20 rounded-xl px-4 outline-none transition-all font-bold text-gray-900"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Content</label>
            <textarea
              placeholder="Write your thoughts here..."
              className="w-full h-80 bg-gray-50 border-transparent focus:bg-white focus:border-[#D98B5F]/20 rounded-xl p-4 outline-none transition-all resize-none font-medium text-gray-700 leading-relaxed"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

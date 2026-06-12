'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Sunrise,
  LayoutGrid,
  CheckCircle2,
  Clock,
  Activity,
  X,
  Trash2,
  Loader2
} from "lucide-react";
import KanbanBoard from '@/components/KanbanBoard';
import toast from 'react-hot-toast';

export default function PlannerPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentTask, setCurrentTask] = useState({ title: '', description: '', status: 'todo' });
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateFilter, setDateFilter] = useState('today'); // 'today', 'tomorrow', 'all', 'specific'

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskMove = async (taskId, newStatus) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => ( (t._id || t.id) === taskId ? { ...t, status: newStatus } : t)));
    
    // API update
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      toast.success('Task moved!');
    } catch (error) {
      toast.error('Failed to move task');
      console.error("Failed to move task:", error);
      fetchTasks(); // revert on fail
    }
  };

  const openAddModal = (status = 'todo') => {
    setModalMode('add');
    let d = new Date(selectedDate);
    if(dateFilter === 'tomorrow') {
      d = new Date();
      d.setDate(d.getDate() + 1);
    } else if (dateFilter === 'today') {
      d = new Date();
    }
    setCurrentTask({ title: '', description: '', status, dueDate: d });
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setModalMode('edit');
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async () => {
    if(!currentTask.title) {
      toast.error('Title is required');
      return;
    }
    try {
      if (modalMode === 'add') {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentTask)
        });
        const newTask = await res.json();
        setTasks(prev => [newTask, ...prev]);
        toast.success('Task created successfully!');
      } else {
        const res = await fetch(`/api/tasks/${currentTask._id || currentTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentTask)
        });
        const updatedTask = await res.json();
        setTasks(prev => prev.map(t => (t._id || t.id) === updatedTask._id ? updatedTask : t));
        toast.success('Task updated successfully!');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save task');
      console.error("Failed to save task:", error);
    }
  };

  const handleDeleteTask = async () => {
    if(!currentTask._id && !currentTask.id) return;
    try {
      await fetch(`/api/tasks/${currentTask._id || currentTask.id}`, {
        method: 'DELETE'
      });
      setTasks(prev => prev.filter(t => (t._id || t.id) !== (currentTask._id || currentTask.id)));
      toast.success('Task deleted!');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete task');
      console.error("Failed to delete task:", error);
    }
  };
  
  const handleDateChange = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    setDateFilter('specific');
  };

  // Date Filtering Logic
  const filteredTasks = tasks.filter(task => {
    if(dateFilter === 'all') return true;
    
    let targetDate = new Date();
    if(dateFilter === 'tomorrow') {
      targetDate.setDate(targetDate.getDate() + 1);
    } else if (dateFilter === 'specific') {
      targetDate = selectedDate;
    }
    
    if(!task.dueDate && dateFilter === 'today') return true;
    if(!task.dueDate) return false;

    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === targetDate.toDateString();
  });

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-fade-in pb-20 p-4 md:p-8">
      
      {/* Date Navigation Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-2 border-b border-gray-100/50 pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleDateChange(-1)}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors bg-white"
          >
            <ChevronLeft size={16} />
          </button>
          
          <button 
            onClick={() => setDateFilter('specific')}
            className={`h-10 px-4 rounded-xl border border-gray-200 flex items-center gap-2 transition-colors bg-white font-bold text-sm ${dateFilter === 'specific' ? 'text-[#D98B5F] border-[#D98B5F]/30 bg-[#D98B5F]/5' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            <CalendarDays size={16} className={dateFilter === 'specific' ? 'text-[#D98B5F]' : 'text-gray-400'} />
            <span>{selectedDate.toLocaleDateString('en-GB')}</span>
          </button>
          
          <button 
            onClick={() => handleDateChange(1)}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors bg-white"
          >
            <ChevronRight size={16} />
          </button>

          <div className="h-6 w-px bg-gray-200 mx-2" />
          
          <button 
            onClick={() => setDateFilter('tomorrow')}
            className={`flex items-center gap-2 transition-colors px-3 py-1.5 rounded-full ${dateFilter === 'tomorrow' ? 'bg-[#D98B5F]/10 text-[#D98B5F]' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <Sunrise size={16} className={dateFilter === 'tomorrow' ? 'text-[#D98B5F]' : 'text-gray-400'} />
            <span className="text-xs font-bold">Tomorrow</span>
          </button>
        </div>

        <button 
          onClick={() => { setDateFilter('today'); setSelectedDate(new Date()); }}
          className={`text-sm font-bold transition-colors ${dateFilter === 'today' ? 'text-[#D98B5F]' : 'text-gray-900 hover:text-[#D98B5F]'}`}
        >
          Today
        </button>
      </div>

      {/* Reminder Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D98B5F]/20 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md"
           style={{ background: 'linear-gradient(135deg, #F0F4EE 0%, #FCFAF7 50%, #FAF0E6 100%)' }}>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-[#D98B5F]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/60 backdrop-blur-sm border border-white flex items-center justify-center text-[#7C9A86] shrink-0 shadow-sm">
             <Sunrise size={28} strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[#D98B5F] mb-1.5">
              <Bell size={14} className="animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Action Needed</span>
            </div>
            <h3 className="text-gray-900 font-bold text-lg leading-snug">Nothing planned for {dateFilter === 'specific' ? selectedDate.toLocaleDateString() : dateFilter} yet.</h3>
            <p className="text-gray-500 text-sm font-medium mt-1">Add tasks now so future-you doesn't forget.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button onClick={() => openAddModal()} className="h-11 px-6 rounded-full bg-white hover:bg-gray-50 text-gray-800 text-sm font-bold transition-all flex items-center gap-2 shadow-sm border border-gray-200 hover:scale-105 active:scale-95">
            <Plus size={16} />
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="h-[600px] mt-8 pt-4">
        {loading ? (
           <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-[#D98B5F]" />
           </div>
        ) : (
          <KanbanBoard 
            tasks={filteredTasks} 
            onTaskMove={handleTaskMove} 
            onAddTask={openAddModal} 
            onEditTask={openEditModal}
          />
        )}
      </div>

      {/* Bottom Floating Banner */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="h-10 px-4 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 hover:bg-black/80 transition-colors shadow-xl border border-white/10">
          <div className="w-4 h-4 rounded-sm bg-white/20 grid grid-cols-2 gap-[1px] p-[2px]">
             <div className="bg-white rounded-[1px]" />
             <div className="bg-white rounded-[1px]" />
             <div className="bg-white rounded-[1px]" />
             <div className="bg-white rounded-[1px]" />
          </div>
          Build yours free 
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {modalMode === 'add' ? 'New Task' : 'Edit Task'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <X size={16} strokeWidth={3} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-2 ml-1">Title</label>
                <input 
                  type="text" 
                  value={currentTask.title}
                  onChange={(e) => setCurrentTask({...currentTask, title: e.target.value})}
                  className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#D98B5F]/30 focus:ring-4 focus:ring-[#D98B5F]/10 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                  placeholder="What needs to be done?"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-2 ml-1">Description <span className="opacity-50">(Optional)</span></label>
                <textarea 
                  value={currentTask.description || ''}
                  onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                  className="w-full h-28 p-5 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#D98B5F]/30 focus:ring-4 focus:ring-[#D98B5F]/10 outline-none transition-all resize-none text-gray-900 font-medium placeholder:text-gray-400 custom-scrollbar"
                  placeholder="Add any extra details..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-2 ml-1">Status</label>
                <select 
                  value={currentTask.status}
                  onChange={(e) => setCurrentTask({...currentTask, status: e.target.value})}
                  className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#D98B5F]/30 focus:ring-4 focus:ring-[#D98B5F]/10 outline-none transition-all text-gray-900 font-medium appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 pt-6">
                {modalMode === 'edit' && (
                  <button 
                    onClick={handleDeleteTask}
                    className="h-14 px-5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold transition-colors flex items-center justify-center shrink-0"
                    title="Delete Task"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="h-14 flex-1 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveTask}
                  className="h-14 flex-[1.5] rounded-2xl bg-[#D98B5F] hover:bg-[#C47A50] text-white font-bold transition-all shadow-lg shadow-[#D98B5F]/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  {modalMode === 'add' ? 'Create Task' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

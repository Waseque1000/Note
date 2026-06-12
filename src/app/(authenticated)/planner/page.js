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
    } else if (dateFilter === 'specific' || dateFilter === 'today') {
      targetDate = selectedDate;
    }
    
    if(!task.dueDate) return false;

    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === targetDate.toDateString();
  });

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-[1200px] mx-auto animate-fade-in pb-2 pt-2">
      
      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between w-full mb-4 md:mb-6 shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={() => handleDateChange(-1)}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 bg-transparent hover:bg-gray-50 transition-colors shrink-0"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2 bg-transparent">
              <CalendarDays size={14} className="text-gray-400 hidden xs:block" />
              <span className="font-extrabold text-sm md:text-[15px] text-gray-800 whitespace-nowrap">
                {dateFilter === 'specific' || dateFilter === 'today' || dateFilter === 'tomorrow' 
                  ? selectedDate.toLocaleDateString('en-GB') 
                  : 'All Tasks'}
              </span>
            </div>
          </div>

          <button 
            onClick={() => handleDateChange(1)}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 bg-transparent hover:bg-gray-50 transition-colors shrink-0"
          >
            <ChevronRight size={16} />
          </button>
          
          <div className="w-px h-4 bg-gray-300 mx-1 md:mx-2 hidden sm:block" />
          
          <button 
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setSelectedDate(tomorrow);
              setDateFilter('tomorrow');
            }}
            className={`hidden xs:flex items-center gap-1.5 text-xs font-bold transition-colors ${dateFilter === 'tomorrow' ? 'text-[#D98B5F]' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <Sunrise size={16} className={dateFilter === 'tomorrow' ? 'text-[#D98B5F]' : 'text-gray-400'} />
            Tomorrow
          </button>
        </div>

        <button 
          onClick={() => { 
            setDateFilter('today'); 
            setSelectedDate(new Date()); 
          }}
          className={`text-sm font-bold transition-colors shrink-0 ml-2 ${dateFilter === 'today' ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Today
        </button>
      </div>

      {/* Reminder Banner */}
      <div className="shrink-0 mb-4 md:mb-6 rounded-2xl border border-gray-200/60 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
           style={{ background: 'linear-gradient(90deg, #F2F5EA 0%, #FAEBE1 100%)' }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[14px] bg-[#DFECD3] flex items-center justify-center text-[#6A8F6A] shrink-0 opacity-90">
             <Sunrise size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
              <Bell size={12} strokeWidth={2} /> REMINDER · TOMORROW
            </div>
            <h3 className="text-gray-900 font-bold text-[15px]">Nothing planned for {dateFilter === 'specific' ? selectedDate.toLocaleDateString() : dateFilter} yet — add it now so future-you doesn't forget.</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => { 
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setSelectedDate(tomorrow);
            setDateFilter('tomorrow'); 
            openAddModal(); 
          }} className="h-9 px-4 rounded-full border border-gray-200/80 bg-transparent hover:bg-white text-gray-700 text-xs font-bold transition-colors flex items-center gap-1.5">
            <Plus size={14} strokeWidth={2.5} />
            Add
          </button>
          <button onClick={() => setDateFilter('tomorrow')} className="h-9 px-4 rounded-full bg-[#D98B5F] hover:bg-[#C47A50] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm">
            View
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Tasks */}
        <div className="bg-transparent border border-gray-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#FFF3EC] text-[#D98B5F] flex items-center justify-center shrink-0">
            <LayoutGrid size={20} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Total Tasks</p>
            <h2 className="text-2xl font-black text-gray-900 leading-none">{filteredTasks.length}</h2>
          </div>
        </div>

        {/* Completed Today */}
        <div className="bg-transparent border border-gray-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#EDF4F0] text-[#6A8F6A] flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Completed Today</p>
            <div className="flex items-end gap-1.5">
              <h2 className="text-2xl font-black text-gray-900 leading-none">{filteredTasks.filter(t => t.status==='done').length}</h2>
              <span className="text-[10px] font-bold text-gray-400 mb-0.5">(0%)</span>
            </div>
          </div>
        </div>

        {/* Due Today */}
        <div className="bg-transparent border border-gray-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#FEF6E5] text-[#DCA54A] flex items-center justify-center shrink-0">
            <Clock size={20} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Due Today</p>
            <h2 className="text-2xl font-black text-gray-900 leading-none">{filteredTasks.filter(t => t.status!=='done').length}</h2>
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-transparent border border-gray-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#FDEFEF] text-[#D86868] flex items-center justify-center shrink-0">
            <Activity size={20} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Overdue</p>
            <h2 className="text-2xl font-black text-gray-900 leading-none">0</h2>
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 min-h-0 relative">
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
        
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 border border-white/50">
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

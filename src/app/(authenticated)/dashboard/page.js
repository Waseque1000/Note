'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ListTodo, 
  TrendingUp, 
  Flame,
  Loader2
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D98B5F]" />
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const avgCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Placeholder data for charts
  const trendData = [
    { name: 'Mon', completion: 45 },
    { name: 'Tue', completion: 52 },
    { name: 'Wed', completion: 38 },
    { name: 'Thu', completion: 65 },
    { name: 'Fri', completion: 48 },
    { name: 'Sat', completion: 80 },
    { name: 'Sun', completion: avgCompletion },
  ];

  const statusData = [
    { name: 'To Do', count: tasks.filter(t => t.status === 'todo').length, fill: '#E2E8F0' },
    { name: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length, fill: '#FDE68A' },
    { name: 'Done', count: completedTasks, fill: '#D1FAE5' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
      
      {/* Productivity Overview Header */}
      <div className="bg-gradient-to-r from-[#FDFBF7] to-[#F3EBE4] border border-[#EBE4DC] rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">Your productivity overview</p>
          <div className="flex items-baseline gap-2">
             <h1 className="text-4xl font-extrabold text-gray-900">{completedTasks} tasks done</h1>
             <span className="text-2xl font-semibold text-gray-400">/ {totalTasks} planned</span>
          </div>
        </div>
        <div className="flex bg-white rounded-full p-1 border border-gray-200/60 shadow-sm">
           {['7d', '14d', '30d', '90d'].map((range, i) => (
             <button 
               key={range}
               className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                 i === 1 ? 'bg-[#D98B5F] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
               }`}
             >
               {range}
             </button>
           ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
         <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="bg-[#FFF5F0] p-3 rounded-xl">
               <ListTodo className="text-[#D98B5F] w-6 h-6" />
            </div>
            <div>
               <p className="text-sm font-semibold text-gray-500 mb-1">Total Tasks</p>
               <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
            </div>
         </div>
         
         <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="bg-green-50 p-3 rounded-xl">
               <CheckCircle2 className="text-green-600 w-6 h-6" />
            </div>
            <div>
               <p className="text-sm font-semibold text-gray-500 mb-1">Completed</p>
               <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
            </div>
         </div>

         <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="bg-blue-50 p-3 rounded-xl">
               <TrendingUp className="text-blue-600 w-6 h-6" />
            </div>
            <div>
               <p className="text-sm font-semibold text-gray-500 mb-1">Avg Completion</p>
               <p className="text-2xl font-bold text-gray-900">{avgCompletion}%</p>
            </div>
         </div>

         <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="bg-amber-50 p-3 rounded-xl">
               <Flame className="text-amber-500 w-6 h-6" />
            </div>
            <div>
               <p className="text-sm font-semibold text-gray-500 mb-1">Current Streak</p>
               <p className="text-2xl font-bold text-gray-900">3 days</p>
            </div>
         </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Completion Trend */}
         <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="mb-6">
               <h3 className="text-lg font-bold text-gray-900">Completion Trend</h3>
               <p className="text-sm text-gray-500">Daily completion rate across the selected range</p>
            </div>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#D98B5F" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#D98B5F" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(val) => `${val}%`} />
                   <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     formatter={(value) => [`${value}%`, 'Completion']}
                   />
                   <Area type="monotone" dataKey="completion" stroke="#D98B5F" strokeWidth={3} fillOpacity={1} fill="url(#colorCompletion)" />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Status Breakdown */}
         <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="mb-6">
               <h3 className="text-lg font-bold text-gray-900">Status Breakdown</h3>
               <p className="text-sm text-gray-500">Tasks by current status</p>
            </div>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={statusData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 13, fontWeight: 600}} width={90} />
                   <Tooltip 
                     cursor={{fill: '#f9fafb'}}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   />
                   <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

    </div>
  );
}

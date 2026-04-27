'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreVertical, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

// --- Task Card Component ---
const TaskCard = ({ task, isOverlay }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { task }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const priorityColors = {
    high: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800",
    medium: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    low: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none mb-4">
      <div className={`bg-white dark:bg-zinc-900 p-5 rounded-[1.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${isOverlay ? 'shadow-2xl border-indigo-500/50 rotate-2' : ''}`}>
        <div className="flex justify-between items-start mb-3">
          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400">
            <MoreVertical size={14} />
          </button>
        </div>
        
        <h4 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">{task.title}</h4>
        
        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">{task.description}</p>
        )}
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50 dark:border-zinc-800/50">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {task.dueDate ? format(new Date(task.dueDate), 'MMM dd') : 'No date'}
            </span>
          </div>
          <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-black text-indigo-600">
            {task.title.charAt(0)}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Column Component ---
const Column = ({ id, title, tasks, onAddTask }) => {
  const { setNodeRef } = useSortable({ id });

  return (
    <div className="flex flex-col w-[340px] shrink-0 bg-slate-50/50 dark:bg-zinc-900/30 rounded-[2rem] p-5 border border-slate-200/50 dark:border-zinc-800/50 h-full max-h-full">
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-3">
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">{title}</h3>
          <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 text-[10px] font-black text-slate-500 shadow-sm">
            {tasks.length}
          </span>
        </div>
        <button 
          onClick={() => onAddTask(id)}
          className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30 shadow-sm transition-all active:scale-90"
        >
          <Plus size={18} />
        </button>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-32 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[1.5rem] flex items-center justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Kanban Board ---
export default function KanbanBoard({ tasks, onTaskMove, onAddTask }) {
  const [activeTask, setActiveTask] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = {
    'todo': tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    'done': tasks.filter(t => t.status === 'done'),
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Check if we dropped over a column or a task
    let newStatus = overId;
    if (!['todo', 'in-progress', 'done'].includes(overId)) {
      const overTask = tasks.find(t => t._id === overId);
      newStatus = overTask.status;
    }

    if (activeTask.status !== newStatus) {
      onTaskMove(activeId, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-row gap-8 overflow-x-auto pb-6 h-full items-start px-2 custom-scrollbar">
        <Column id="todo" title="To Do" tasks={columns['todo']} onAddTask={onAddTask} />
        <Column id="in-progress" title="In Progress" tasks={columns['in-progress']} onAddTask={onAddTask} />
        <Column id="done" title="Completed" tasks={columns['done']} onAddTask={onAddTask} />
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

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
import { Plus, Inbox, MoreHorizontal } from 'lucide-react';

// --- Task Card Component ---
const TaskCard = ({ task, isOverlay, onEditTask }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id || task.id,
    data: { task }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none mb-3 outline-none relative group">
      <div className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow transition-all cursor-grab active:cursor-grabbing pr-10 ${isOverlay ? 'shadow-xl rotate-2' : ''}`}>
        <h4 className="font-bold text-gray-800 text-sm truncate">{task.title}</h4>
        {task.description && <p className="text-xs text-gray-500 mt-1 truncate">{task.description}</p>}
      </div>
      
      {!isOverlay && onEditTask && (
        <button 
          onPointerDown={(e) => {
            e.stopPropagation(); // prevent drag start
          }}
          onClick={(e) => {
            e.stopPropagation();
            onEditTask(task);
          }}
          className="absolute right-3 top-4 text-gray-300 hover:text-gray-600 transition-colors p-1 opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal size={16} />
        </button>
      )}
    </div>
  );
};

// --- Column Component ---
const Column = ({ id, title, tasks, onAddTask, onEditTask, dotColor }) => {
  const { setNodeRef } = useSortable({ id });

  return (
    <div className="flex flex-col w-[320px] md:w-[350px] shrink-0 bg-[#FCFAF7] rounded-[2rem] p-5 border border-gray-100 shadow-sm h-full max-h-full">
      <div className="flex justify-between items-center mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }}></div>
          <h3 className="font-bold text-gray-900 text-base">{title}</h3>
          <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-400">
            {tasks.length}
          </span>
        </div>
        <button 
          onClick={() => onAddTask && onAddTask(id)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <SortableContext items={tasks.map(t => t._id || t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id || task.id} task={task} onEditTask={onEditTask} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-40 border border-dashed border-gray-200 bg-gray-50/50 rounded-2xl flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 mb-3 shadow-sm">
              <Inbox size={20} />
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">Nothing here yet</p>
            <p className="text-xs text-gray-400">Drag tasks here or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Kanban Board ---
export default function KanbanBoard({ tasks = [], onTaskMove, onAddTask, onEditTask }) {
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
    const task = tasks.find(t => (t._id || t.id) === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    let newStatus = overId;
    if (!['todo', 'in-progress', 'done'].includes(overId)) {
      const overTask = tasks.find(t => (t._id || t.id) === overId);
      if(overTask) newStatus = overTask.status;
    }

    if (activeTask && activeTask.status !== newStatus && onTaskMove) {
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
      <div className="flex flex-row gap-6 overflow-x-auto pb-4 h-full items-start w-full custom-scrollbar">
        <Column id="todo" title="To Do" tasks={columns['todo']} onAddTask={onAddTask} onEditTask={onEditTask} dotColor="#3B82F6" />
        <Column id="in-progress" title="In Progress" tasks={columns['in-progress']} onAddTask={onAddTask} onEditTask={onEditTask} dotColor="#F59E0B" />
        <Column id="done" title="Completed" tasks={columns['done']} onAddTask={onAddTask} onEditTask={onEditTask} dotColor="#10B981" />
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

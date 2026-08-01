import { useDroppable } from '@dnd-kit/core';
import type { Task, TaskStatus } from '../../types';
import TaskCard from './TaskCard';
import { statusLabels } from '../../utils/badges';
import { MoreHorizontal, Plus } from 'lucide-react';

interface Props {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function Column({ status, tasks, onTaskClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between px-2.5 py-2 bg-[#171819]">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[13px] font-semibold text-[#c5c7ca] uppercase">
            {statusLabels[status]}
          </h3>
          <span className="px-1 py-0 flex items-center justify-center bg-[#303236] text-[#d0d2d5] text-[11px] font-medium min-w-[18px]">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button className="p-0.5 hover:bg-[#252629] rounded text-[#96999e]">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Column Body */}
      <div
        ref={setNodeRef}
        className={`flex-1 px-1.5 py-1.5 min-h-[400px] transition-colors bg-[#171819] ${
          isOver ? 'bg-[#202b3c]' : ''
        }`}
      >
        <div className="space-y-1.5">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </div>

        {/* Add Task Button */}
        <button className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-[#96999e] hover:bg-[#252629] mt-1 w-full transition-colors">
          <Plus size={14} />
          <span>Create issue</span>
        </button>
      </div>
    </div>
  );
}

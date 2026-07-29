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
      <div className="flex items-center justify-between px-3 py-2.5 bg-white">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[#172b4d]">
            {statusLabels[status]}
          </h3>
          <span className="w-5 h-5 flex items-center justify-center bg-[#ebecf0] text-[#172b4d] text-xs font-medium rounded">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-[#ebecf0] rounded text-[#6b7780]">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Column Body */}
      <div
        ref={setNodeRef}
        className={`flex-1 px-3 py-2 min-h-[200px] transition-colors ${
          isOver ? 'bg-blue-50' : ''
        }`}
      >
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </div>

        {/* Add Task Button */}
        <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#6b7780] hover:bg-[#ebecf0] rounded mt-2 w-full transition-colors">
          <Plus size={16} />
          <span>Create issue</span>
        </button>
      </div>
    </div>
  );
}

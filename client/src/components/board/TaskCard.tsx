import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
import PriorityIcon from './PriorityIcon';
import { Paperclip, Clock } from 'lucide-react';

interface Props {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  // Generate task key from project name
  const taskKey = `KAN-${task._id.slice(-4)}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className="bg-white p-3 shadow-sm border border-[#dfe1e6] cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      {/* Task Header with Icon and Priority */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <PriorityIcon priority={task.priority} size={16} />
        </div>
      </div>

      {/* Task Title */}
      <p className="text-sm text-[#172b4d] font-normal mb-2 line-clamp-3">{task.title}</p>

      {/* Task Key */}
      <p className="text-xs text-[#6b7780] mb-2">{taskKey}</p>

      {/* Task Footer */}
      <div className="flex items-center justify-between gap-2">
        {/* Left side icons */}
        <div className="flex items-center gap-3 text-[#6b7780]">
          {/* Attachments indicator */}
          <div className="flex items-center gap-1">
            <Paperclip size={12} />
            <span className="text-xs">1</span>
          </div>

          {/* Due date */}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span className="text-xs">
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        {/* Right side - Assignee */}
        <div className="flex items-center gap-1">
          {task.assignee ? (
            <div
              className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs flex items-center justify-center font-medium"
              title={task.assignee.name}
            >
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-dashed border-[#dfe1e6]"></div>
          )}
        </div>
      </div>
    </div>
  );
}

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

  const taskKey = task.ticketKey ?? 'Issue';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className="bg-[#242528] p-2 border border-[#303236] cursor-grab active:cursor-grabbing hover:border-[#55575c] transition-colors rounded-sm"
    >
      {/* Task Header with Icon and Priority */}
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-1.5">
          <PriorityIcon priority={task.priority} size={14} />
        </div>
      </div>

      {/* Task Title */}
      <p className="text-[13px] leading-5 text-[#d0d2d5] font-medium mb-2 line-clamp-3">{task.title}</p>

      {/* Task Key */}
      <p className="text-[11px] text-[#96999e] mb-1.5">{taskKey}</p>

      {/* Task Footer */}
      <div className="flex items-center justify-between gap-1.5">
        {/* Left side icons */}
        <div className="flex items-center gap-2 text-[#96999e]">
          {/* Attachments indicator */}
          <div className="flex items-center gap-0.5">
            <Paperclip size={11} />
            {task.attachments && task.attachments.length > 0 && <span className="text-[11px]">{task.attachments.length}</span>}
          </div>

          {/* Due date */}
          {task.dueDate && (
            <div className="flex items-center gap-0.5">
              <Clock size={11} />
              <span className="text-[11px]">
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        {/* Right side - Assignee */}
        <div className="flex items-center gap-0.5">
          {task.assignee ? (
            <div
              className="w-5 h-5 rounded-full bg-[#5a50b5] text-white text-[10px] flex items-center justify-center font-medium"
              title={task.assignee.name}
            >
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border border-dashed border-[#626469]"></div>
          )}
        </div>
      </div>
    </div>
  );
}

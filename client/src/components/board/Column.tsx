import { useDroppable } from '@dnd-kit/core';
import type { Task, TaskStatus } from '../../types';
import TaskCard from './TaskCard';
import { statusLabels } from '../../utils/badges';

interface Props {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function Column({ status, tasks, onTaskClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className={`bg-gray-50 rounded-xl p-3 w-full min-h-[400px] transition ${ isOver ? 'ring-2 ring-indigo-400' : '' }`}>
      <h3 className="font-semibold text-sm text-gray-600 mb-3 flex items-center justify-between">{statusLabels[status]}
        <span className="text-xs bg-gray-200 rounded-full px-2">{tasks.length}</span>
      </h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
        ))}
      </div>
    </div>
  )
}
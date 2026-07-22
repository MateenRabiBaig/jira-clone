import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types';
import { priorityColors } from '../../utils/badges';

interface Props {
    task: Task;
    onClick: () => void;
}

export default function TaskCard({ task, onClick }: Props) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task._id })

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1
    }

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} onClick={onClick} className="bg-white rounded-lg p-3 shadow-sm border cursor-grab active:cursor-grabbing hover:shadow-md transition">
            <p className="font-medium text-sm">{task.title}</p>
            <div className="flex items-center justify-between mt-2">
                <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>{task.priority}</span>
                {task.assignee && (
                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center" title={task.assignee.name}>
                        {task.assignee.name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            {task.dueDate && (
                <p className="text-xs text-gray-400 mt-1">Due {new Date(task.dueDate).toLocaleDateString()}</p>
            )}
        </div>
    )
}
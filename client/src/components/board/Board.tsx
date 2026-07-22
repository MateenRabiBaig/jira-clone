import { useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import Column from './Column';
import type { Task, TaskStatus } from '../../types';
import { taskApi } from '../../api/taskApi';

interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskClick: (task: Task) => void;
}

const STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];

export default function Board({ tasks, setTasks, onTaskClick }: Props) {
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)));

    try {
      await taskApi.updateStatus(taskId, newStatus);
    }
    catch {
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: task.status } : t)));
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
    </DndContext>
  )
}
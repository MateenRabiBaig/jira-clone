import type { TaskPriority, TaskStatus, TaskWorkType } from '../types';

export const statusLabels: Record<TaskStatus, string> = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    'in-review': 'In Review',
    done: 'Done',
};

export const workTypeLabels: Record<TaskWorkType, string> = {
    task: 'Task',
    story: 'Story',
    bug: 'Bug',
};

export const priorityLabels: Record<TaskPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
};

export const statusBadgeStyles: Record<TaskStatus, string> = {
    todo: 'bg-[#303134] text-[#A9ABAF]',
    'in-progress': 'bg-[#1c3764] text-[#75a4f7]',
    'in-review': 'bg-[#3a2c1f] text-[#EED12B]',
    done: 'bg-[#1f332b] text-[#4bce97]',
};

export const priorityBadgeStyles: Record<TaskPriority, string> = {
    high: 'bg-[#42221F] text-[#FD9891]',
    medium: 'bg-[#3A2C1F] text-[#EED12B]',
    low: 'bg-[#303134] text-[#A9ABAF]',
};

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Project {
    _id: string;
    name: string;
    description: string;
    owner: User | string;
    members: User[] | string[];
    createdAt: string;
    updatedAt: string; 
}

export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    project: string;
    assignee?: User | null;
    createdAt: string;
    updatedAt: string; 
}

export interface Comment {
    _id: string;
    textarea: string;
    author: string;
    task: string;
    createdAt: string;
}

export interface DashboardStats {
  projectsCount: number;
  tasksCount: number;
  completedCount: number;
  pendingCount: number;
}

export interface RecentTaskItem {
  _id: string;
  title: string;
  status: TaskStatus;
  project: { _id: string; name: string };
  assignee?: { name: string } | null;
}
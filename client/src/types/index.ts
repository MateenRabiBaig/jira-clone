export interface User {
    id: string;
    name: string;
    email: string;
}

export type ProjectMember = User | string;

export interface Project {
    _id: string;
    name: string;
    description: string;
    owner: User | string;
    members: ProjectMember[];
    createdAt: string;
    updatedAt: string; 
}

export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskWorkType = 'task' | 'story' | 'bug';

export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    workType?: TaskWorkType;
    reporter?: User | string | null;
    attachments?: string[];
    dueDate: string;
    project: string;
    assignee?: User | null;
    createdAt: string;
    updatedAt: string; 
    ticketKey?: string;
}

export interface Comment {
    _id: string;
    text: string;
    author: User;
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

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

export type TaskStatus = 'todo' | 'in-progress' | 'done';
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
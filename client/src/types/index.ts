export interface User {
    id: string;
    name: string;
    email: string;
    bio?: string;
    avatarUrl?: string;
    notificationPrefs?: NotificationPrefs;
    createdAt?: string;
    updatedAt?: string;
}

export interface NotificationPrefs {
    assignedTasks?: boolean;
    comments?: boolean;
    mentions?: boolean;
    statusChanges?: boolean;
    invitations?: boolean;
}

/** A user reference that may be populated or just an id. */
export type UserRef = User | string | null | undefined;

export interface Project {
    id: string;
    name: string;
    key?: string;
    description: string;
    owner: UserRef;
    members: UserRef[];
    team?: { id: string; name: string } | string | null;
    taskSeq?: number;
    createdAt: string;
    updatedAt: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskWorkType = 'task' | 'story' | 'bug';

export interface Attachment {
    fileId: string;
    filename: string;
    mimeType: string;
    size: number;
    uploadedBy?: UserRef;
    uploadedAt?: string;
}

export interface TaskActivity {
    user?: UserRef;
    action: string;
    field?: string;
    from?: string | number | null;
    to?: string | number | null;
    createdAt: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    workType?: TaskWorkType;
    labels?: string[];
    reporter?: UserRef;
    attachments?: Attachment[];
    dueDate: string | null;
    project: string | { id: string; name: string; key?: string };
    assignee?: UserRef;
    activity?: TaskActivity[];
    createdAt: string;
    updatedAt: string;
    ticketKey?: string;
}

export interface Comment {
    id: string;
    text: string;
    author: UserRef;
    task: string;
    createdAt: string;
}

export type TeamRole = 'owner' | 'admin' | 'member';

export interface TeamMember {
    user: UserRef;
    role: TeamRole;
}

export interface TeamInvite {
    id: string;
    user: UserRef;
    email: string;
    role: 'admin' | 'member';
    invitedBy?: UserRef;
    createdAt: string;
}

export interface Team {
    id: string;
    name: string;
    description: string;
    owner: string;
    members: TeamMember[];
    invites?: TeamInvite[];
    myRole?: TeamRole;
    projects?: Project[];
    createdAt?: string;
    updatedAt?: string;
}

export interface TeamInvitation {
    id: string;
    teamId: string;
    teamName: string;
    teamDescription: string;
    role: 'admin' | 'member';
    invitedBy?: UserRef;
    createdAt: string;
}

export type NotificationType =
    | 'task-assigned'
    | 'status-change'
    | 'comment'
    | 'mention'
    | 'team-invite'
    | 'added-to-project';

export interface AppNotification {
    id: string;
    type: NotificationType;
    message: string;
    read: boolean;
    actor?: UserRef;
    project?: string | null;
    task?: string | null;
    team?: string | null;
    createdAt: string;
}

export interface SearchResultItem {
    id: string;
    name?: string;
    key?: string;
    title?: string;
    ticketKey?: string;
    status?: TaskStatus;
    email?: string;
    avatarUrl?: string;
    project?: { id: string; name: string } | string | null;
}

export interface SearchResults {
    projects: SearchResultItem[];
    tasks: SearchResultItem[];
    users: SearchResultItem[];
}

export interface PaginatedTasks {
    tasks: Task[];
    total: number;
    page: number;
    pages: number;
}

export interface DashboardStats {
    projectsCount: number;
    tasksCount: number;
    completedCount: number;
    pendingCount: number;
}

export interface RecentTaskItem {
    id: string;
    title: string;
    status: TaskStatus;
    ticketKey?: string;
    project: { id: string; name: string; key?: string };
    assignee?: { id: string; name: string; avatarUrl?: string } | null;
}

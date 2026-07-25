import { Project, TaskPriority } from '../../types';

interface Props {
    search: string;
    onSearchChange: (v: string) => void;
    priority: TaskPriority | '';
    onPriorityChange: (v: TaskPriority | '') => void;
    assignee: string;
    onAssigneeChange: (v: string) => void;
    members: Project['members'];
}

export default function FilterBar ({ search, onSearchChange, priority, onPriorityChange, assignee, onAssigneeChange, members }: Props) {
    return (
        <div className="flex gap-3 mb-4 flex-wrap">
            <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tasks..."
                className="border rounded px-3 py-2 text-sm flex-1 min-w-[180px]"
            />

            <select
                value={priority}
                onChange={(e) => onPriorityChange(e.target.value as TaskPriority | '')}
                className="border rounded px-3 py-2 text-sm"
            >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select>

            <select
                value={assignee}
                onChange={(e) => onAssigneeChange(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
            >
                <option value="">All Assignees</option>
                {(members as any[]).map((m) => (
                    <option key={m._id ?? m} value={m._id ?? m}>{m.name ?? m}</option>
                ))}
            </select>
        </div>
    )
}
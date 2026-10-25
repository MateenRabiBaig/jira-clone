import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { taskApi } from '../../api/taskApi';
import { getErrorMessage } from '../../api/axios';
import type { PaginatedTasks, Task, TaskPriority, TaskStatus } from '../../types';
import { statusBadgeStyles, statusLabels, priorityBadgeStyles, priorityLabels, workTypeLabels } from '../../utils/badges';
import Avatar from '../../components/common/Avatar';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/States';

const SORT_OPTIONS = [
    { value: 'updated', label: 'Recently updated' },
    { value: 'created', label: 'Newest first' },
    { value: 'due', label: 'Due date' },
    { value: 'priority', label: 'Priority' },
];

export default function Tasks() {
    const [data, setData] = useState<PaginatedTasks | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<TaskStatus | ''>('');
    const [priority, setPriority] = useState<TaskPriority | ''>('');
    const [sort, setSort] = useState('updated');
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await taskApi.getMyTasks({
                q: search.trim() || undefined,
                status: status || undefined,
                priority: priority || undefined,
                sort,
                page,
                limit: 25,
            });
            setData(result);
            setError(null);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Could not load your tasks'));
        } finally {
            setLoading(false);
        }
    }, [search, status, priority, sort, page]);

    useEffect(() => {
        const timer = setTimeout(() => void load(), search ? 300 : 0);
        return () => clearTimeout(timer);
    }, [load, search]);

    const filterActive = Boolean(search || status || priority);

    const openTask = (task: Task) => {
        const projectId = typeof task.project === 'object' ? task.project.id : task.project;
        navigate(`/projects/${projectId}?task=${task.id}`);
    };

    const projectName = (task: Task) => (typeof task.project === 'object' ? task.project.name : '');

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h1 className="text-2xl font-bold text-[#e0e1e3]">My Tasks</h1>
                {data && (
                    <p className="text-xs text-[#96999e]">
                        {data.total} task{data.total === 1 ? '' : 's'} assigned to you
                    </p>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-jira-muted" />
                    <input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                        placeholder="Search tasks"
                        aria-label="Search my tasks"
                        className="bg-[#1c1d1f] border border-[#45464a] pl-9 pr-3 py-1.5 text-xs text-[#d0d2d5] w-[200px] focus:outline-none focus:border-[#75a4f7]"
                    />
                </div>
                <select
                    value={status}
                    onChange={(event) => {
                        setStatus(event.target.value as TaskStatus | '');
                        setPage(1);
                    }}
                    aria-label="Filter by status"
                    className="bg-[#1c1d1f] border border-[#45464a] px-3 py-1.5 text-xs text-[#d0d2d5]"
                >
                    <option value="">All statuses</option>
                    {(Object.keys(statusLabels) as TaskStatus[]).map((s) => (
                        <option key={s} value={s}>{statusLabels[s]}</option>
                    ))}
                </select>
                <select
                    value={priority}
                    onChange={(event) => {
                        setPriority(event.target.value as TaskPriority | '');
                        setPage(1);
                    }}
                    aria-label="Filter by priority"
                    className="bg-[#1c1d1f] border border-[#45464a] px-3 py-1.5 text-xs text-[#d0d2d5]"
                >
                    <option value="">All priorities</option>
                    {(Object.keys(priorityLabels) as TaskPriority[]).map((p) => (
                        <option key={p} value={p}>{priorityLabels[p]}</option>
                    ))}
                </select>
                <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    aria-label="Sort tasks"
                    className="bg-[#1c1d1f] border border-[#45464a] px-3 py-1.5 text-xs text-[#d0d2d5]"
                >
                    {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                {filterActive && (
                    <button
                        onClick={() => {
                            setSearch('');
                            setStatus('');
                            setPriority('');
                            setPage(1);
                        }}
                        className="text-xs text-[#75a4f7] hover:underline"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {loading && !data ? (
                <LoadingState label="Loading your tasks..." />
            ) : error ? (
                <ErrorState message={error} onRetry={() => void load()} />
            ) : data && data.tasks.length === 0 ? (
                <div className="bg-[#1f2022] border border-[#36373a]">
                    <EmptyState
                        icon={CalendarDays}
                        title={filterActive ? 'No tasks match your filters' : 'No tasks assigned to you'}
                        description={
                            filterActive
                                ? 'Try adjusting or clearing the filters.'
                                : 'When teammates assign work to you, it shows up here. You can also create tasks from any project board.'
                        }
                    />
                </div>
            ) : data ? (
                <div className="bg-jira-panel border border-jira-border rounded-md overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-jira-muted text-xs uppercase border-b border-jira-border">
                                <th className="px-4 py-2 font-medium">Key</th>
                                <th className="px-4 py-2 font-medium">Summary</th>
                                <th className="px-4 py-2 font-medium">Project</th>
                                <th className="px-4 py-2 font-medium">Status</th>
                                <th className="px-4 py-2 font-medium">Priority</th>
                                <th className="px-4 py-2 font-medium">Type</th>
                                <th className="px-4 py-2 font-medium">Due</th>
                                <th className="px-4 py-2 font-medium">Assignee</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.tasks.map((task) => (
                                <tr
                                    key={task.id}
                                    onClick={() => openTask(task)}
                                    className="border-b border-jira-border last:border-0 hover:bg-jira-card cursor-pointer"
                                >
                                    <td className="px-4 py-2.5 text-jira-muted whitespace-nowrap">{task.ticketKey ?? '—'}</td>
                                    <td className="px-4 py-2.5 text-jira-textBright">{task.title}</td>
                                    <td className="px-4 py-2.5 text-jira-muted whitespace-nowrap">{projectName(task)}</td>
                                    <td className="px-4 py-2.5">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${statusBadgeStyles[task.status]}`}>
                                            {statusLabels[task.status]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${priorityBadgeStyles[task.priority]}`}>
                                            {priorityLabels[task.priority]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-jira-muted whitespace-nowrap">
                                        {task.workType ? workTypeLabels[task.workType] : 'Task'}
                                    </td>
                                    <td className={`px-4 py-2.5 text-xs whitespace-nowrap ${isOverdue(task.dueDate, task.status) ? 'text-[#f15b50]' : 'text-jira-muted'}`}>
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <Avatar name={assigneeName(task)} src={assigneeAvatar(task)} size={20} />
                                            <span className="text-jira-muted text-xs whitespace-nowrap">{assigneeName(task)}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}

            {data && data.pages > 1 && (
                <div className="flex items-center justify-end gap-3 mt-4 text-xs text-[#96999e]">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        aria-label="Previous page"
                        className="p-1.5 border border-[#45464a] disabled:opacity-40 hover:bg-[#2c2d30]"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <span>Page {data.page} of {data.pages}</span>
                    <button
                        onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                        disabled={page >= data.pages}
                        aria-label="Next page"
                        className="p-1.5 border border-[#45464a] disabled:opacity-40 hover:bg-[#2c2d30]"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}

const assigneeName = (task: Task): string => {
    const assignee = task.assignee;
    return typeof assignee === 'object' && assignee ? assignee.name : 'You';
};

const assigneeAvatar = (task: Task): string | null => {
    const assignee = task.assignee;
    return typeof assignee === 'object' && assignee ? assignee.avatarUrl ?? null : null;
};

const isOverdue = (dueDate: string | null, status: TaskStatus): boolean =>
    Boolean(dueDate && status !== 'done' && new Date(dueDate).getTime() < Date.now());

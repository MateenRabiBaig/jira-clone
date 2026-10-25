import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Ticket, Copy } from 'lucide-react';
import { toast } from 'react-toastify';
import { searchApi } from '../../api/searchApi';
import { getErrorMessage } from '../../api/axios';
import type { SearchResults } from '../../types';
import Avatar from '../common/Avatar';
import { statusLabels } from '../../utils/badges';

interface Props {
    query: string;
    onClose: () => void;
}

const EMPTY: SearchResults = { projects: [], tasks: [], users: [] };

/**
 * Global search results dropdown covering projects, tasks and users.
 * The input itself lives in the TopBar; this component debounces the
 * query and renders grouped, navigable results.
 */
export default function GlobalSearch({ query, onClose }: Props) {
    const [results, setResults] = useState<SearchResults>(EMPTY);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const trimmed = query.trim();

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (trimmed.length < 2) {
                setResults(EMPTY);
                setLoading(false);
                setError(null);
                return;
            }
            setLoading(true);
            try {
                setResults(await searchApi.global(trimmed));
                setError(null);
            } catch (err: unknown) {
                setError(getErrorMessage(err, 'Search failed'));
            } finally {
                setLoading(false);
            }
        }, trimmed.length < 2 ? 0 : 300);
        return () => clearTimeout(timer);
    }, [trimmed]);

    const goToProject = (id: string) => {
        onClose();
        navigate(`/projects/${id}`);
    };

    const goToTask = (projectId: string, taskId: string) => {
        onClose();
        navigate(`/projects/${projectId}?task=${taskId}`);
    };

    const copyEmail = async (email: string) => {
        try {
            await navigator.clipboard.writeText(email);
            toast.success(`Copied ${email}`);
        } catch {
            toast.error('Could not copy email');
        }
    };

    const hasResults = results.projects.length + results.tasks.length + results.users.length > 0;

    return (
        <div className="absolute left-0 right-0 top-full mt-2 z-50">
            <div className="bg-[#242528] border border-[#45464a] rounded-lg shadow-2xl overflow-hidden">
                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {error && <p className="text-[#f15b50] text-xs px-3 py-3">{error}</p>}

                    {!error && trimmed.length < 2 && (
                        <p className="text-[#85878a] text-xs px-3 py-3">Type at least 2 characters to search projects, tasks and people.</p>
                    )}

                    {!error && trimmed.length >= 2 && !loading && !hasResults && (
                        <p className="text-[#85878a] text-xs px-3 py-3">No results for “{trimmed}”.</p>
                    )}

                    {results.projects.length > 0 && (
                        <Section title="Projects">
                            {results.projects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => goToProject(project.id)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded hover:bg-[#2c2d30] text-left"
                                >
                                    <FolderKanban size={15} className="text-[#75a4f7] shrink-0" />
                                    <span className="text-sm text-[#e0e1e3] truncate">{project.name}</span>
                                    {project.key && <span className="text-[11px] text-[#85878a]">{project.key}</span>}
                                </button>
                            ))}
                        </Section>
                    )}

                    {results.tasks.length > 0 && (
                        <Section title="Tasks">
                            {results.tasks.map((task) => {
                                const projectId = typeof task.project === 'object' && task.project ? task.project.id : null;
                                return (
                                    <button
                                        key={task.id}
                                        onClick={() => projectId && goToTask(projectId, task.id)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded hover:bg-[#2c2d30] text-left"
                                    >
                                        <Ticket size={15} className="text-[#4bce97] shrink-0" />
                                        <span className="text-sm text-[#e0e1e3] truncate flex-1">{task.title}</span>
                                        {task.ticketKey && <span className="text-[11px] text-[#85878a]">{task.ticketKey}</span>}
                                        {task.status && <span className="text-[10px] text-[#96999e]">{statusLabels[task.status]}</span>}
                                    </button>
                                );
                            })}
                        </Section>
                    )}

                    {results.users.length > 0 && (
                        <Section title="People">
                            {results.users.map((user) => (
                                <div key={user.id} className="w-full flex items-center gap-2.5 px-3 py-2 rounded hover:bg-[#2c2d30]">
                                    <Avatar name={user.name ?? '?'} src={user.avatarUrl} size={24} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-[#e0e1e3] truncate">{user.name}</p>
                                        {user.email && <p className="text-[11px] text-[#85878a] truncate">{user.email}</p>}
                                    </div>
                                    {user.email && (
                                        <button
                                            onClick={() => void copyEmail(user.email ?? '')}
                                            title={`Copy ${user.email}`}
                                            aria-label={`Copy email address of ${user.name}`}
                                            className="p-1.5 text-[#9b9da1] hover:text-white rounded"
                                        >
                                            <Copy size={13} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </Section>
                    )}
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-1">
            <p className="text-[10px] uppercase tracking-wider text-[#85878a] px-3 pt-2 pb-1">{title}</p>
            {children}
        </div>
    );
}

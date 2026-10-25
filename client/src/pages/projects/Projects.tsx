import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Plus, Users } from "lucide-react";
import { projectApi } from "../../api/projectApi";
import { getErrorMessage } from "../../api/axios";
import type { Project } from "../../types";
import { useAppSelector } from "../../hooks/reduxHooks";
import CreateProjectModal from "../../components/projects/CreateProjectModal";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import Avatar from "../../components/common/Avatar";

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const currentUser = useAppSelector((state) => state.auth.user);
    const navigate = useNavigate();

    // Never sets state synchronously, so it is safe to call from an effect.
    const fetchProjects = useCallback(async () => {
        try {
            setProjects(await projectApi.getAll());
            setError(null);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to load projects'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const data = await projectApi.getAll();
                if (cancelled) return;
                setProjects(data);
                setError(null);
            } catch (err: unknown) {
                if (!cancelled) setError(getErrorMessage(err, 'Failed to load projects'));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6 gap-3">
                <h1 className="text-2xl font-bold text-[#e0e1e3]">Projects</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#6f9deb] text-[#101214] px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-1.5 hover:bg-[#87adf0]"
                >
                    <Plus size={15} /> New Project
                </button>
            </div>

            {loading ? (
                <LoadingState label="Loading projects..." />
            ) : error ? (
                <ErrorState message={error} onRetry={() => {
                    setLoading(true);
                    void fetchProjects();
                }} />
            ) : projects.length === 0 ? (
                <div className="bg-[#1f2022] border border-[#36373a]">
                    <EmptyState
                        icon={FolderKanban}
                        title="No projects yet"
                        description="Projects hold your boards and tasks. Create your first one, then add teammates from its board."
                        action={
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-[#6f9deb] text-[#101214] text-sm font-semibold px-4 py-2 rounded-md hover:bg-[#87adf0]"
                            >
                                Create your first project
                            </button>
                        }
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {projects.map((project) => {
                        const owner = typeof project.owner === 'object' ? project.owner : null;
                        const isOwner = owner?.id === currentUser?.id;
                        return (
                            <button
                                key={project.id}
                                onClick={() => navigate(`/projects/${project.id}`)}
                                className="text-left bg-[#242528] border border-[#36373a] p-5 hover:border-[#6f9deb] transition"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {project.key && (
                                            <span className="text-[10px] font-bold text-[#75a4f7] bg-[#1c3764] px-1.5 py-0.5 rounded shrink-0">
                                                {project.key}
                                            </span>
                                        )}
                                        <h3 className="font-semibold text-lg text-[#e0e1e3] truncate">{project.name}</h3>
                                    </div>
                                    {isOwner && (
                                        <span className="text-[9px] uppercase tracking-wide text-[#ddb30e] bg-[#3a2c1f] px-1.5 py-0.5 rounded-full shrink-0">
                                            Owner
                                        </span>
                                    )}
                                </div>
                                <p className="text-[#96999e] text-sm mt-1.5 line-clamp-2 min-h-[2.5rem]">{project.description || 'No description'}</p>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-[#85878a] text-xs flex items-center gap-1.5">
                                        <Users size={12} /> {project.members.length} member{project.members.length === 1 ? '' : 's'}
                                    </span>
                                    {project.team && typeof project.team === 'object' && (
                                        <span className="text-[#75a4f7] text-[11px]">{project.team.name}</span>
                                    )}
                                </div>
                                <div className="flex -space-x-1.5 mt-3">
                                    {project.members.slice(0, 6).map((member) =>
                                        typeof member === 'object' && member ? (
                                            <Avatar key={member.id} name={member.name} src={member.avatarUrl} size={22} />
                                        ) : null,
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <CreateProjectModal
                    onClose={() => setShowModal(false)}
                    onCreated={(project) => navigate(`/projects/${project.id}`)}
                />
            )}
        </div>
    );
}

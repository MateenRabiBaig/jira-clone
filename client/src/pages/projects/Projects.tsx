import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { projectApi } from "../../api/projectApi";
import type { Project } from "../../types";
import CreateProjectModal from "../../components/projects/CreateProjectModal";
import axios from 'axios';

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    const fetchProjects = async() => {
        try {
            setLoading(true);
            const data = await projectApi.getAll();
            setProjects(data)
            setError(null)
        }
        catch(err: unknown) {
            setError(axios.isAxiosError<{ message?: string }>(err) ? err.response?.data?.message ?? 'Failed to load projects' : 'Failed to load projects');
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Fetch the current server state when this page mounts.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProjects();
    },[]);

    if(loading) return <div className="p-8 text-[#96999e]">Loading projects...</div>
    if(error) return <div className="p-8 text-red-400">{error}</div>

    return (
        <div className="min-h-[calc(100vh-68px)] bg-[#1f2022] p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-[#e0e1e3]">Projects</h1>
                <button onClick={()=>setShowModal(true)} className="bg-[#6f9deb] text-[#101214] px-4 py-2 font-semibold flex items-center gap-2">New Project</button>
            </div>

        {projects.length === 0 ? (
            <div className="text-center text-[#96999e] py-20 bg-[#171819] border border-[#36373a]">No projects yet — create your first one</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {projects.map((p) => (
                    <Link key={p._id} to={`/projects/${p._id}`} className="bg-[#242528] border border-[#36373a] p-5 hover:border-[#6f9deb] transition">
                        <h3 className="font-semibold text-lg text-[#e0e1e3]">{p.name}</h3>
                        <p className="text-[#96999e] text-sm mt-1 line-clamp-2">{p.description}</p>
                        <p className="text-[#85878a] text-xs mt-3">{p.members.length} members</p>
                    </Link>
                ))}
            </div>
        )}

        {showModal && (
            <CreateProjectModal onClose={() => setShowModal(false)} onCreated={fetchProjects} />
        )}
    </div>
    )
}

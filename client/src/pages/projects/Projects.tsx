import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { projectApi } from "../../api/projectApi";
import type { Project } from "../../types";
import CreateProjectModal from "../../components/projects/CreateProjectModal";

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
        catch(err: any) {
            setError(err.response?.data?.message ?? 'Failed to load projects');
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProjects();
    },[]);

    if(loading) return <div className="p-6">Loading projects...</div>
    if(error) return <div className="p-6 text-red-500">{error}</div>

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Projects</h1>
                <button onClick={()=>setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2">New Project</button>
            </div>

        {projects.length === 0 ? (
            <div className="text-center text-gray-500 py-20 bg-white rounded-xl">No projects yet — create your first one</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {projects.map((p) => (
                    <Link key={p._id} to={`/projects/${p._id}`} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition">
                        <h3 className="font-semibold text-lg">{p.name}</h3>
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{p.description}</p>
                        <p className="text-gray-400 text-xs mt-3">{(p.members as any[]).length} members</p>
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
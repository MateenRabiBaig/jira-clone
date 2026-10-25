import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { projectApi } from "../../api/projectApi";
import type { Project } from "../../types";

export default function RecentProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        projectApi
            .getAll()
            .then((data) => {
                if (!cancelled) setProjects(data.slice(0, 3));
            })
            .catch(() => undefined)
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="bg-[#242528] border border-[#36373a] p-3">
            <h2 className="text-base font-bold text-[#e0e1e3]">Recent Projects</h2>
            <p className="text-[#96999e] text-xs mb-2">Projects you recently worked on</p>
            {loading && <p className="text-[#85878a] text-xs">Loading...</p>}
            {!loading && projects.length === 0 && <p className="text-[#85878a] text-xs">No projects yet</p>}
            {projects.map((project) => (
                <div key={project.id} className="flex justify-between items-center py-1.5 border-b last:border-0">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-[#d0d2d5] truncate">{project.name}</p>
                    </div>
                    <Link to={`/projects/${project.id}`} className="border border-[#55575c] text-[#d0d2d5] px-2 py-1 text-xs hover:bg-[#303236] shrink-0">
                        Open
                    </Link>
                </div>
            ))}
        </div>
    )
}

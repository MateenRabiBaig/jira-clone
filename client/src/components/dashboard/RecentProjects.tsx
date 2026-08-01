import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { projectApi } from "../../api/projectApi";
import type { Project } from "../../types";

export default function RecentProjects() {
    const [projects, setPrpjects] = useState<Project[]>([]);

    useEffect(() => {
        projectApi.getAll().then((data) => setPrpjects(data.slice(0,3)))
    },[]);

    return (
        <div className="bg-white rounded-lg p-3 shadow-sm">
            <h2 className="text-base font-bold">Recent Projects</h2>
            <p className="text-gray-500 text-xs mb-2">Projects you recently worked on</p>
            {projects.length === 0 && <p className="text-gray-400 text-xs">No projects yet</p>}
            {projects.map((p) => (
                <div key={p._id} className="flex justify-between items-center py-1.5 border-b last:border-0">
                    <div>
                        <p className="text-sm font-medium">{p.name}</p>
                    </div>
                    <Link to={`/projects/${p._id}`} className="border rounded px-2 py-1 text-xs">Open</Link>
                </div>
            ))}
        </div>
    )
}

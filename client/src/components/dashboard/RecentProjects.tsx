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
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold">Recent Projects</h2>
            <p className="text-gray-500 text-sm mb-4">Projects you recently worked on</p>
            {projects.length === 0 && <p className="text-gray-400 text-sm">No projects yet</p>}
            {projects.map((p) => (
                <div key={p._id} className="flex justify-between items-center py-3 border-b last:border-0">
                    <div>
                        <p className="font-medium">{p.name}</p>
                    </div>
                    <Link to={`/projects/${p._id}`} className="border rounded px-3 py-1 text-sm">Open</Link>
                </div>
            ))}
        </div>
    )
}
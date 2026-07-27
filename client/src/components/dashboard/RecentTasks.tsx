import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi } from "../../api/dashboardApi";
import type { RecentTaskItem } from "../../types";

const statusStyles: Record<string, string> = {
    done: "bg-green-100 text-green-700",
    "in-progress": "bg-blue-100 text-blue-700",
    todo: "bg-amber-100 text-amber-700",
};

const statusLabels: Record<string, string> = {
    done: "Completed",
    "in-progress": "In Progress",
    todo: "Pending",
};

function RecentTasks() {
    const [tasks, setTasks] = useState<RecentTaskItem[]>([]);

    useEffect(() => {
        dashboardApi.getRecentTasks().then(setTasks);
    }, []);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Recent Tasks</h2>
            <p className="text-sm text-slate-500 mb-4">Latest task updates</p>

            {tasks.length === 0 && <p className="text-sm text-slate-400">No tasks yet.</p>}

            {tasks.map((task) => (
                <Link
                    key={task._id}
                    to={`/projects/${task.project._id}`}
                    className="flex items-center justify-between py-3 border-b last:border-0 hover:bg-slate-50 -mx-2 px-2 rounded transition"
                >
                    <div>
                        <p className="text-sm font-medium text-slate-800">{task.title}</p>
                        <p className="text-xs text-slate-400">{task.project.name}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[task.status]}`}>
                        {statusLabels[task.status]}
                    </span>
                </Link>
            ))}
        </div>
    );
}

export default RecentTasks;
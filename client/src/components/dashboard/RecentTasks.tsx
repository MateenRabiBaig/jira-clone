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
        <div className="border border-[#36373a] bg-[#242528] p-3">
            <h2 className="text-sm font-semibold text-[#e0e1e3]">Recent Tasks</h2>
            <p className="text-xs text-[#96999e] mb-2">Latest task updates</p>

            {tasks.length === 0 && <p className="text-xs text-[#85878a]">No tasks yet.</p>}

            {tasks.map((task) => (
                <Link
                    key={task._id}
                    to={`/projects/${task.project._id}`}
                    className="flex items-center justify-between py-2 border-b border-[#36373a] last:border-0 hover:bg-[#303236] -mx-2 px-2 transition"
                >
                    <div>
                        <p className="text-xs font-medium text-[#d0d2d5]">{task.title}</p>
                        <p className="text-[11px] text-[#85878a]">{task.project.name}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusStyles[task.status]}`}>
                        {statusLabels[task.status]}
                    </span>
                </Link>
            ))}
        </div>
    );
}

export default RecentTasks;

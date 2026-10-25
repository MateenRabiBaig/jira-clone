import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi } from "../../api/dashboardApi";
import type { RecentTaskItem, TaskStatus } from "../../types";
import { statusLabels } from "../../utils/badges";

const statusStyles: Record<TaskStatus, string> = {
    done: "bg-[#1f332b] text-[#4bce97]",
    "in-progress": "bg-[#1c3764] text-[#75a4f7]",
    "in-review": "bg-[#3a2c1f] text-[#EED12B]",
    todo: "bg-[#303134] text-[#A9ABAF]",
};

function RecentTasks() {
    const [tasks, setTasks] = useState<RecentTaskItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        dashboardApi
            .getRecentTasks()
            .then(setTasks)
            .catch(() => undefined)
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="border border-[#36373a] bg-[#242528] p-3">
            <h2 className="text-sm font-semibold text-[#e0e1e3]">Recent Tasks</h2>
            <p className="text-xs text-[#96999e] mb-2">Latest task updates</p>

            {loading && <p className="text-xs text-[#85878a]">Loading...</p>}
            {!loading && tasks.length === 0 && <p className="text-xs text-[#85878a]">No tasks yet.</p>}

            {tasks.map((task) => (
                <Link
                    key={task.id}
                    to={`/projects/${task.project.id}`}
                    className="flex items-center justify-between py-2 border-b border-[#36373a] last:border-0 hover:bg-[#303236] -mx-2 px-2 transition"
                >
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-[#d0d2d5] truncate">{task.title}</p>
                        <p className="text-[11px] text-[#85878a] truncate">
                            {task.ticketKey ? `${task.ticketKey} · ` : ''}{task.project.name}
                        </p>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${statusStyles[task.status]}`}>
                        {statusLabels[task.status]}
                    </span>
                </Link>
            ))}
        </div>
    );
}

export default RecentTasks;

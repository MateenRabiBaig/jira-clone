import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, FolderKanban, ListTodo } from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";
import WelcomeBanner from "../../components/dashboard/WelcomeBanner";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentProjects from "../../components/dashboard/RecentProjects";
import RecentTasks from "../../components/dashboard/RecentTasks";
import { dashboardApi } from "../../api/dashboardApi";
import type { DashboardStats } from "../../types";

function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        dashboardApi.getStats().then(setStats).catch(() => setStats(null));
    }, []);

    return (
        <div className="space-y-4 p-4">
            <WelcomeBanner />

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Projects"
                    value={stats ? String(stats.projectsCount) : "—"}
                    icon={FolderKanban}
                    color="bg-indigo-600"
                />

                <StatCard
                    title="Tasks"
                    value={stats ? String(stats.tasksCount) : "—"}
                    icon={ListTodo}
                    color="bg-blue-600"
                />

                <StatCard
                    title="Completed"
                    value={stats ? String(stats.completedCount) : "—"}
                    icon={CheckCircle2}
                    color="bg-green-600"
                />

                <StatCard
                    title="Pending"
                    value={stats ? String(stats.pendingCount) : "—"}
                    icon={Clock3}
                    color="bg-amber-500"
                />
            </section>

            <section>
                <QuickActions />
            </section>

            <section className="grid gap-3 lg:grid-cols-2">
                <RecentProjects />
                <RecentTasks />
            </section>
        </div>
    );
}

export default Dashboard;

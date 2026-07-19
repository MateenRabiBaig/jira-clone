import { CheckCircle2, Clock3, FolderKanban, ListTodo } from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";
import WelcomeBanner from "../../components/dashboard/WelcomeBanner";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentProjects from "../../components/dashboard/RecentProjects";
import RecentTasks from "../../components/dashboard/RecentTasks";

function Dashboard() {
    return (
        <div className="space-y-8 p-8">
            <WelcomeBanner />

            <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Projects"
                    value="12"
                    icon={FolderKanban}
                    color="bg-indigo-600"
                />

                <StatCard
                    title="Tasks"
                    value="145"
                    icon={ListTodo}
                    color="bg-blue-600"
                />

                <StatCard
                    title="Completed"
                    value="92"
                    icon={CheckCircle2}
                    color="bg-green-600"
                />

                <StatCard
                    title="Pending"
                    value="53"
                    icon={Clock3}
                    color="bg-amber-500"
                />
            </section>

            <section>
                <QuickActions />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <RecentProjects />
                <RecentTasks />
            </section>
        </div>
    );
}

export default Dashboard;
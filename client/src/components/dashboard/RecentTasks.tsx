import SectionHeader from "./SectionHeader";

const tasks = [
    { id: 1, title: "Build Login UI", status: "In Progress", }, { id: 2, title: "MonogoDB", status: "Pending", }, { id: 3, title: "Create Dashboard", status: "Completed", }
];

function badge(status: string) {
    switch(status) {
        case "Completed": return "bg-green-100 text-green-700";

        case "In Progress": return "bg-blue-100 text-blue-700";

        default: return "bg-amber-100 text-amber-700";
    }
}

function RecentTasks() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
                title="Recent Tasks"
                subtitle="Latest task updates"
            />

            <div className="space-y-4">
                {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between">
                        <p className="font-medium text-slate-800">{task.title}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge(task.status)}`}>{task.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RecentTasks;
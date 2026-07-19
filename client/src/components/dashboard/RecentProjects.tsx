import SectionHeader from "./SectionHeader";

const projects = [
    { id: 1, name: "Jira", tasks: 24, }, { id: 2, name: "School ERP", tasks: 15, }, { id: 3, name: "Cold Storage", tasks: 9, }
];

function RecentProjects() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader title="Recent Projects" subtitle="Projects you recently worked on" />
                <div className="space-y-4">
                    {projects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-4 hover:bg-slate-50">
                            <div>
                                <h3 className="font-medium text-slate-900">{project.name}</h3>

                                <p className="text-sm text-slate-500">{project.tasks} Tasks</p>
                            </div>

                            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100">Open</button>
                        </div>
                    ))}
                </div>
        </div>
    );
}

export default RecentProjects;
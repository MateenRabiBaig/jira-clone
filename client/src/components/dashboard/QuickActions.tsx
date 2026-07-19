import { Plus } from "lucide-react";

function QuickActions() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h3>

            <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition">
                    <Plus size={18} />New Project
                </button>

                <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 transition">New Task</button>
            </div>
        </div>
    );
}

export default QuickActions;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import CreateProjectModal from "../projects/CreateProjectModal";
import QuickCreateTaskModal from "../tasks/QuickCreateTaskModal";

function QuickActions() {
    const [showNewProject, setShowNewProject] = useState(false);
    const [showNewTask, setShowNewTask] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Quick Actions</h3>

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setShowNewProject(true)}
                    className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition"
                >
                    <Plus size={14} />New Project
                </button>

                <button
                    onClick={() => setShowNewTask(true)}
                    className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-100 transition"
                >
                    New Task
                </button>
            </div>

            {showNewProject && (
                <CreateProjectModal
                    onClose={() => setShowNewProject(false)}
                    onCreated={(project) => navigate(`/projects/${project._id}`)}
                />
            )}

            {showNewTask && (
                <QuickCreateTaskModal
                    onClose={() => setShowNewTask(false)}
                    onCreated={(projectId) => navigate(`/projects/${projectId}`)}
                />
            )}
        </div>
    );
}

export default QuickActions;

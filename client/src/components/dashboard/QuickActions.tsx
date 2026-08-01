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
        <div className="border border-[#36373a] bg-[#242528] p-3">
            <h3 className="mb-2 text-sm font-semibold text-[#e0e1e3]">Quick Actions</h3>

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setShowNewProject(true)}
                    className="flex items-center gap-1.5 bg-[#6f9deb] px-2.5 py-1.5 text-xs font-medium text-[#101214] hover:bg-[#87adf0] transition"
                >
                    <Plus size={14} />New Project
                </button>

                <button
                    onClick={() => setShowNewTask(true)}
                    className="border border-[#55575c] px-2.5 py-1.5 text-xs font-medium text-[#d0d2d5] hover:bg-[#303236] transition"
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

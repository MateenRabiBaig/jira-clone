import { useState } from "react";
import { toast } from "react-toastify";
import { projectApi } from "../../api/projectApi";
import { getErrorMessage } from "../../api/axios";
import type { Project } from '../../types';

interface Props {
    project: Project;
    onClose: () => void;
    onSaved: (project: Project) => void;
}

/** Project settings: rename and edit the description (owner only). */
export default function EditProjectModal({ project, onClose, onSaved }: Props) {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        if (!name.trim()) {
            setError('Project name is required');
            return;
        }
        setSaving(true);
        try {
            const updated = await projectApi.update(project.id, { name: name.trim(), description });
            toast.success('Project updated');
            onSaved(updated);
            onClose();
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Could not update project'));
        } finally {
            setSaving(false);
        }
    };

    const fieldClass = "w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] px-3 py-2 text-sm focus:border-[#75a4f7] focus:outline-none";
    const labelClass = "block text-xs font-semibold text-[#b7b9bc] mb-1";

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Project settings"
                className="bg-[#242528] border border-[#55575c] p-5 w-full max-w-md shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <h2 className="text-lg font-semibold mb-4 text-[#e0e1e3]">Project settings</h2>
                <form onSubmit={submit} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="edit-project-name" className={labelClass}>Name</label>
                        <input id="edit-project-name" value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} />
                    </div>
                    {project.key && (
                        <div>
                            <span className={labelClass}>Key</span>
                            <p className="text-sm text-[#96999e] border border-[#36373a] bg-[#1c1d1f] px-3 py-2">
                                {project.key} <span className="text-[11px]">(used in ticket IDs like {project.key}-1, fixed at creation)</span>
                            </p>
                        </div>
                    )}
                    <div>
                        <label htmlFor="edit-project-description" className={labelClass}>Description</label>
                        <textarea
                            id="edit-project-description"
                            rows={3}
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            className={fieldClass}
                        />
                    </div>
                    {error && <p className="text-[#f15b50] text-sm" role="alert">{error}</p>}
                    <div className="flex justify-end gap-2 border-t border-[#36373a] pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-[#55575c] text-[#b7b9bc] text-sm hover:bg-[#2c2d30]">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !name.trim()}
                            className="px-4 py-2 bg-[#6f9deb] text-[#101214] font-semibold text-sm hover:bg-[#87adf0] disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

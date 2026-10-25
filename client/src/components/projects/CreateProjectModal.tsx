import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { projectApi } from "../../api/projectApi";
import { teamApi } from "../../api/teamApi";
import { getErrorMessage } from "../../api/axios";
import type { Project, Team } from '../../types';

interface Props {
    onClose: () => void;
    onCreated: (project: Project) => void;
    /** Optional team to preselect (e.g. when creating from a team page). */
    defaultTeamId?: string;
}

interface FormData {
    name: string;
    description?: string;
    team: string;
}

export default function CreateProjectModal({ onClose, onCreated, defaultTeamId }: Props) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        defaultValues: { team: defaultTeamId ?? '' },
    });
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        teamApi.getAll().then(setTeams).catch(() => undefined);
    }, []);

    const onSubmit = async (data: FormData) => {
        try {
            const created = await projectApi.create({
                name: data.name.trim(),
                description: data.description,
                team: data.team || null,
            });
            onCreated(created);
            onClose();
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Could not create project'));
        }
    };

    const fieldClass = "w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] placeholder:text-[#85878a] px-3 py-2 text-sm focus:border-[#75a4f7] focus:outline-none";
    const labelClass = "block text-xs font-semibold text-[#b7b9bc] mb-1";

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Create project"
                className="bg-[#242528] border border-[#55575c] p-5 w-full max-w-md shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4 text-[#e0e1e3]">New Project</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="project-name" className={labelClass}>Name <span className="text-[#f15b50]">*</span></label>
                        <input
                            id="project-name"
                            {...register('name', { required: 'Project name is required', maxLength: { value: 80, message: 'Name is too long' } })}
                            placeholder="e.g. Mobile App"
                            className={fieldClass}
                        />
                        {errors.name && <p className="text-[#f15b50] text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="project-description" className={labelClass}>Description</label>
                        <textarea
                            id="project-description"
                            {...register('description', { maxLength: { value: 600, message: 'Description is too long' } })}
                            placeholder="What is this project about?"
                            rows={3}
                            className={fieldClass}
                        />
                        {errors.description && <p className="text-[#f15b50] text-xs mt-1">{errors.description.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="project-team" className={labelClass}>Team</label>
                        <select id="project-team" {...register('team')} className={fieldClass}>
                            <option value="">No team (only you can see it until you add members)</option>
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                        </select>
                        <p className="text-[11px] text-[#85878a] mt-1">Optional - team projects are easy to find for the whole team.</p>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-[#36373a] pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-[#55575c] text-[#b7b9bc] text-sm hover:bg-[#2c2d30]">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-[#6f9deb] text-[#101214] font-semibold text-sm hover:bg-[#87adf0] disabled:opacity-50"
                        >
                            {isSubmitting ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

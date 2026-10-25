import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Users, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { teamApi } from '../../api/teamApi';
import { getErrorMessage } from '../../api/axios';
import { useAppSelector } from '../../hooks/reduxHooks';
import type { Team, TeamInvitation } from '../../types';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/States';
import Avatar from '../../components/common/Avatar';
import { timeAgo } from '../../utils/date';

interface CreateTeamForm {
    name: string;
    description?: string;
}

export default function Teams() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createRequested, setCreateRequested] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentUser = useAppSelector((state) => state.auth.user);

    // Never sets state synchronously, so it is safe to call from an effect.
    const load = useCallback(async () => {
        try {
            const [teamList, invites] = await Promise.all([teamApi.getAll(), teamApi.getInvitations()]);
            setTeams(teamList);
            setInvitations(invites);
            setError(null);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Could not load teams'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const [teamList, invites] = await Promise.all([teamApi.getAll(), teamApi.getInvitations()]);
                if (cancelled) return;
                setTeams(teamList);
                setInvitations(invites);
                setError(null);
            } catch (err: unknown) {
                if (!cancelled) setError(getErrorMessage(err, 'Could not load teams'));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // The sidebar "New team" shortcut links to /teams?new=1; derive the modal
    // state from the URL instead of syncing it in an effect.
    const urlWantsCreate = searchParams.get('new') === '1';
    const showCreate = urlWantsCreate || createRequested;
    const closeCreate = () => {
        setCreateRequested(false);
        if (urlWantsCreate) setSearchParams({}, { replace: true });
    };

    const respond = async (invitation: TeamInvitation, action: 'accept' | 'decline') => {
        try {
            await teamApi.respondToInvite(invitation.teamId, invitation.id, action);
            toast.success(action === 'accept' ? `You joined ${invitation.teamName}` : 'Invitation declined');
            await load();
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Could not respond to invitation'));
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-2xl font-bold text-[#e0e1e3]">Teams</h1>
                <button
                    onClick={() => setCreateRequested(true)}
                    className="bg-[#6f9deb] text-[#101214] text-sm font-semibold px-4 py-2 rounded-md hover:bg-[#87adf0]"
                >
                    Create team
                </button>
            </div>

            {invitations.length > 0 && (
                <section className="mb-6 bg-[#242528] border border-[#45464a] p-4">
                    <h2 className="text-sm font-semibold text-[#e0e1e3] mb-3">
                        Invitations ({invitations.length})
                    </h2>
                    <div className="space-y-2">
                        {invitations.map((invitation) => (
                            <div
                                key={invitation.id}
                                className="flex flex-wrap items-center justify-between gap-3 bg-[#1c1d1f] border border-[#36373a] px-4 py-3"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm text-[#e0e1e3]">
                                        <span className="font-medium">{invitation.teamName}</span>
                                        <span className="text-[#96999e]"> · invited you as {invitation.role}</span>
                                    </p>
                                    <p className="text-[11px] text-[#85878a] mt-0.5">
                                        {typeof invitation.invitedBy === 'object' && invitation.invitedBy
                                            ? `${invitation.invitedBy.name} · `
                                            : ''}
                                        {timeAgo(invitation.createdAt)}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => void respond(invitation, 'accept')}
                                        className="flex items-center gap-1.5 bg-[#6f9deb] text-[#101214] text-xs font-semibold px-3 py-1.5 rounded hover:bg-[#87adf0]"
                                    >
                                        <Check size={13} /> Accept
                                    </button>
                                    <button
                                        onClick={() => void respond(invitation, 'decline')}
                                        className="flex items-center gap-1.5 border border-[#55575c] text-[#b7b9bc] text-xs px-3 py-1.5 rounded hover:bg-[#2c2d30]"
                                    >
                                        <X size={13} /> Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {loading ? (
                <LoadingState label="Loading teams..." />
            ) : error ? (
                <ErrorState message={error} onRetry={() => {
                    setLoading(true);
                    void load();
                }} />
            ) : teams.length === 0 ? (
                <div className="bg-[#1f2022] border border-[#36373a]">
                    <EmptyState
                        icon={Users}
                        title="No teams yet"
                        description="Teams group people and projects. Create one, then invite teammates by email."
                        action={
                            <button
                                onClick={() => setCreateRequested(true)}
                                className="bg-[#6f9deb] text-[#101214] text-sm font-semibold px-4 py-2 rounded-md hover:bg-[#87adf0]"
                            >
                                Create your first team
                            </button>
                        }
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teams.map((team) => {
                        const memberCount = team.members.length;
                        const isOwner = team.owner === currentUser?.id;
                        return (
                            <Link
                                key={team.id}
                                to={`/teams/${team.id}`}
                                className="block bg-[#242528] border border-[#36373a] p-5 hover:border-[#6f9deb] transition"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-semibold text-lg text-[#e0e1e3] truncate">{team.name}</h3>
                                    {isOwner && (
                                        <span className="text-[10px] uppercase tracking-wide text-[#ddb30e] bg-[#3a2c1f] px-2 py-0.5 rounded-full shrink-0">
                                            Owner
                                        </span>
                                    )}
                                </div>
                                {team.description && (
                                    <p className="text-[#96999e] text-sm mt-1 line-clamp-2">{team.description}</p>
                                )}
                                <div className="flex items-center mt-3">
                                    <div className="flex -space-x-1.5">
                                        {team.members.slice(0, 5).map((member) =>
                                            typeof member.user === 'object' && member.user ? (
                                                <Avatar key={member.user.id} name={member.user.name} src={member.user.avatarUrl} size={24} />
                                            ) : null,
                                        )}
                                    </div>
                                    <span className="text-[#85878a] text-xs ml-3">
                                        {memberCount} member{memberCount === 1 ? '' : 's'}
                                    </span>
                                    {team.myRole && (
                                        <span className="text-[10px] text-[#75a4f7] ml-auto capitalize">{team.myRole}</span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {showCreate && (
                <CreateTeamModal
                    onClose={closeCreate}
                    onCreated={async (team) => {
                        closeCreate();
                        toast.success(`Team "${team.name}" created`);
                        await load();
                    }}
                />
            )}
        </div>
    );
}

function CreateTeamModal({ onClose, onCreated }: { onClose: () => void; onCreated: (team: Team) => void | Promise<void> }) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateTeamForm>();

    const onSubmit = async (data: CreateTeamForm) => {
        try {
            const team = await teamApi.create({ name: data.name.trim(), description: data.description });
            await onCreated(team);
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Could not create team'));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Create team"
                className="bg-[#242528] border border-[#55575c] p-5 w-full max-w-md shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <h2 className="text-lg font-semibold mb-4 text-[#e0e1e3]">Create team</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="team-name" className="block text-xs font-semibold text-[#b7b9bc] mb-1">Team name</label>
                        <input
                            id="team-name"
                            {...register('name', { required: 'Team name is required', maxLength: { value: 80, message: 'Name is too long' } })}
                            placeholder="e.g. Platform Team"
                            className="w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] placeholder:text-[#85878a] px-3 py-2 text-sm focus:border-[#75a4f7] focus:outline-none"
                        />
                        {errors.name && <p className="text-[#f15b50] text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="team-description" className="block text-xs font-semibold text-[#b7b9bc] mb-1">Description</label>
                        <textarea
                            id="team-description"
                            rows={3}
                            {...register('description', { maxLength: { value: 400, message: 'Description is too long' } })}
                            placeholder="What does this team work on?"
                            className="w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] placeholder:text-[#85878a] px-3 py-2 text-sm focus:border-[#75a4f7] focus:outline-none"
                        />
                        {errors.description && <p className="text-[#f15b50] text-xs mt-1">{errors.description.message}</p>}
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
                            {isSubmitting ? 'Creating...' : 'Create team'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

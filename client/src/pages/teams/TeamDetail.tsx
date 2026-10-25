import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FolderKanban, Mail, MoreVertical, ShieldCheck, UserMinus, UserPlus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { teamApi } from '../../api/teamApi';
import { getErrorMessage } from '../../api/axios';
import { useAppSelector } from '../../hooks/reduxHooks';
import type { Team } from '../../types';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/States';
import Avatar from '../../components/common/Avatar';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function TeamDetail() {
    const { id } = useParams<{ id: string }>();
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showInvite, setShowInvite] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const currentUser = useAppSelector((state) => state.auth.user);
    const navigate = useNavigate();

    // Never sets state synchronously, so it is safe to call from an effect.
    const load = useCallback(async () => {
        if (!id) return;
        try {
            setTeam(await teamApi.getById(id));
            setError(null);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Could not load team'));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const data = await teamApi.getById(id ?? '');
                if (cancelled) return;
                setTeam(data);
                setError(null);
            } catch (err: unknown) {
                if (!cancelled) setError(getErrorMessage(err, 'Could not load team'));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) return <LoadingState label="Loading team..." />;
    if (error || !team) return <ErrorState message={error ?? 'Team not found'} onRetry={() => void load()} />;

    const myRole = team.myRole ?? 'member';
    const isAdmin = myRole === 'owner' || myRole === 'admin';

    const removeMember = async (userId: string, name: string) => {
        try {
            await teamApi.removeMember(team.id, userId);
            toast.success(`${name} removed from team`);
            await load();
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Could not remove member'));
        }
    };

    const changeRole = async (userId: string, role: 'admin' | 'member') => {
        try {
            await teamApi.updateMemberRole(team.id, userId, role);
            toast.success('Role updated');
            await load();
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Could not change role'));
        }
    };

    const leaveTeam = async () => {
        try {
            await teamApi.leave(team.id);
            toast.success(`You left ${team.name}`);
            navigate('/teams');
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Could not leave team'));
        }
    };

    const deleteTeam = async () => {
        setDeleting(true);
        try {
            await teamApi.delete(team.id);
            toast.success('Team deleted');
            navigate('/teams');
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Could not delete team'));
            setDeleting(false);
        }
    };

    const declineInvite = async (inviteId: string) => {
        try {
            await teamApi.respondToInvite(team.id, inviteId, 'decline');
            toast.success('Invitation declined');
            await load();
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Could not decline invitation'));
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <div>
                <Link to="/teams" className="inline-flex items-center gap-1.5 text-xs text-[#96999e] hover:text-white mb-2">
                    <ArrowLeft size={13} /> All teams
                </Link>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold text-[#e0e1e3]">{team.name}</h1>
                        {team.description && <p className="text-sm text-[#96999e] mt-1">{team.description}</p>}
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] uppercase tracking-wide bg-[#3a2c1f] text-[#EED12B] px-2 py-0.5 rounded-full">
                                You are {myRole}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isAdmin && (
                            <button
                                onClick={() => setShowInvite(true)}
                                className="flex items-center gap-1.5 bg-[#6f9deb] text-[#101214] text-sm font-semibold px-3.5 py-2 rounded hover:bg-[#87adf0]"
                            >
                                <UserPlus size={14} /> Invite member
                            </button>
                        )}
                        <div className="relative">
                            <TeamMoreMenu
                                isAdmin={isAdmin}
                                isOwner={myRole === 'owner'}
                                canLeave={myRole !== 'owner'}
                                onSettings={() => setShowSettings(true)}
                                onDelete={() => setConfirmDelete(true)}
                                onLeave={() => void leaveTeam()}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending invites (visible to admins, and pending invites for me) */}
            {team.invites && team.invites.length > 0 && (
                <section className="bg-[#242528] border border-[#36373a] p-4">
                    <h2 className="text-sm font-semibold text-[#e0e1e3] mb-3">Pending invitations</h2>
                    <div className="space-y-2">
                        {team.invites.map((invite) => {
                            const invitee = typeof invite.user === 'object' ? invite.user : null;
                            const mine = invitee?.id === currentUser?.id;
                            return (
                                <div key={invite.id} className="flex flex-wrap items-center justify-between gap-2 bg-[#1c1d1f] border border-[#36373a] px-3 py-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Avatar name={invitee?.name ?? invite.email} src={invitee?.avatarUrl} size={24} />
                                        <div className="min-w-0">
                                            <p className="text-xs text-[#d0d2d5] truncate">{invitee?.name ?? invite.email}</p>
                                            <p className="text-[10px] text-[#85878a]">
                                                {invite.role} · invited by{' '}
                                                {typeof invite.invitedBy === 'object' && invite.invitedBy ? invite.invitedBy.name : 'unknown'}
                                            </p>
                                        </div>
                                    </div>
                                    {mine ? (
                                        <button
                                            onClick={() => void declineInvite(invite.id)}
                                            className="flex items-center gap-1 text-[11px] text-[#f15b50] hover:underline"
                                        >
                                            <X size={12} /> Decline
                                        </button>
                                    ) : (
                                        <span className="text-[10px] text-[#ddb30e] uppercase tracking-wide">Pending</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Members */}
            <section className="bg-[#242528] border border-[#36373a] p-4">
                <h2 className="text-sm font-semibold text-[#e0e1e3] mb-3">Members ({team.members.length})</h2>
                <div className="space-y-2">
                    {team.members.map((member) => {
                        const user = typeof member.user === 'object' ? member.user : null;
                        if (!user) return null;
                        const isSelf = user.id === currentUser?.id;
                        const canAct = user.id !== team.owner && (myRole === 'owner' || (myRole === 'admin' && member.role !== 'admin'));
                        return (
                            <div key={user.id} className="flex flex-wrap items-center justify-between gap-2 bg-[#1c1d1f] border border-[#36373a] px-3 py-2.5">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Avatar name={user.name} src={user.avatarUrl} size={32} />
                                    <div className="min-w-0">
                                        <p className="text-sm text-[#e0e1e3] truncate">
                                            {user.name}
                                            {isSelf && <span className="text-[#85878a]"> (you)</span>}
                                        </p>
                                        <p className="text-[11px] text-[#85878a] truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {member.role === 'owner' ? (
                                        <span className="text-[10px] uppercase tracking-wide text-[#ddb30e] bg-[#3a2c1f] px-2 py-0.5 rounded-full">Owner</span>
                                    ) : member.role === 'admin' ? (
                                        <span className="text-[10px] uppercase tracking-wide text-[#75a4f7] bg-[#1c3764] px-2 py-0.5 rounded-full">Admin</span>
                                    ) : (
                                        <span className="text-[10px] uppercase tracking-wide text-[#a9abad] bg-[#303134] px-2 py-0.5 rounded-full">Member</span>
                                    )}
                                    {myRole === 'owner' && !isSelf && (
                                        <RoleSelect value={member.role as 'admin' | 'member'} onChange={(role) => void changeRole(user.id, role)} />
                                    )}
                                    {canAct && !isSelf && (
                                        <button
                                            onClick={() => void removeMember(user.id, user.name)}
                                            title={`Remove ${user.name}`}
                                            aria-label={`Remove ${user.name} from team`}
                                            className="p-1.5 text-[#96999e] hover:text-[#f15b50]"
                                        >
                                            <UserMinus size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <p className="text-[11px] text-[#85878a] mt-3 flex items-center gap-1.5">
                    <ShieldCheck size={12} />
                    Owners and admins can invite members and manage the team; members can work on team projects.
                </p>
            </section>

            {/* Team projects */}
            <section className="bg-[#242528] border border-[#36373a] p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-[#e0e1e3]">Team projects ({team.projects?.length ?? 0})</h2>
                    {isAdmin && (
                        <Link to="/projects" className="text-[11px] text-[#75a4f7] hover:underline">
                            Create project for this team →
                        </Link>
                    )}
                </div>
                {(team.projects?.length ?? 0) === 0 ? (
                    <EmptyState
                        icon={FolderKanban}
                        title="No projects in this team yet"
                        description="Create a project and pick this team so everyone here can find it."
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {team.projects?.map((project) => (
                            <Link
                                key={project.id}
                                to={`/projects/${project.id}`}
                                className="bg-[#1c1d1f] border border-[#36373a] p-3.5 hover:border-[#6f9deb] transition"
                            >
                                <div className="flex items-center gap-2">
                                    <FolderKanban size={14} className="text-[#75a4f7] shrink-0" />
                                    <p className="text-sm font-medium text-[#e0e1e3] truncate">{project.name}</p>
                                    {project.key && <span className="text-[10px] text-[#85878a] ml-auto">{project.key}</span>}
                                </div>
                                {project.description && (
                                    <p className="text-[11px] text-[#96999e] mt-1.5 line-clamp-2">{project.description}</p>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {showInvite && <InviteMemberModal team={team} onClose={() => setShowInvite(false)} onInvited={load} />}

            {showSettings && (
                <TeamSettingsModal
                    team={team}
                    onClose={() => setShowSettings(false)}
                    onSaved={async () => {
                        setShowSettings(false);
                        await load();
                    }}
                />
            )}

            {confirmDelete && (
                <ConfirmDialog
                    title={`Delete "${team.name}"?`}
                    message="Projects in this team stay, but they will no longer belong to any team. This cannot be undone."
                    confirmLabel="Delete team"
                    danger
                    busy={deleting}
                    onConfirm={() => void deleteTeam()}
                    onCancel={() => setConfirmDelete(false)}
                />
            )}
        </div>
    );
}

function TeamMoreMenu({
    isAdmin,
    isOwner,
    canLeave,
    onSettings,
    onDelete,
    onLeave,
}: {
    isAdmin: boolean;
    isOwner: boolean;
    canLeave: boolean;
    onSettings: () => void;
    onDelete: () => void;
    onLeave: () => void;
}) {
    const [open, setOpen] = useState(false);
    if (!isAdmin && !canLeave) return null;

    return (
        <>
            <button
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Team actions"
                className="p-2 border border-[#45464a] text-[#b7b9bc] hover:bg-[#292a2d] rounded"
            >
                <MoreVertical size={15} />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
                    <div role="menu" className="absolute right-0 top-full mt-1 w-44 bg-[#242528] border border-[#45464a] rounded-lg shadow-2xl z-50 py-1">
                        {isAdmin && (
                            <button
                                role="menuitem"
                                onClick={() => {
                                    setOpen(false);
                                    onSettings();
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-[#d0d2d5] hover:bg-[#2c2d30]"
                            >
                                Team settings
                            </button>
                        )}
                        {canLeave && (
                            <button
                                role="menuitem"
                                onClick={() => {
                                    setOpen(false);
                                    onLeave();
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-[#d0d2d5] hover:bg-[#2c2d30]"
                            >
                                Leave team
                            </button>
                        )}
                        {isOwner && (
                            <button
                                role="menuitem"
                                onClick={() => {
                                    setOpen(false);
                                    onDelete();
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-[#f15b50] hover:bg-[#2c2d30]"
                            >
                                Delete team
                            </button>
                        )}
                    </div>
                </>
            )}
        </>
    );
}

function RoleSelect({ value, onChange }: { value: 'admin' | 'member'; onChange: (role: 'admin' | 'member') => void }) {
    return (
        <select
            value={value}
            onChange={(event) => onChange(event.target.value as 'admin' | 'member')}
            aria-label="Change member role"
            className="bg-[#1c1d1f] border border-[#45464a] px-2 py-1 text-[11px] text-[#d0d2d5]"
        >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
        </select>
    );
}

function InviteMemberModal({ team, onClose, onInvited }: { team: Team; onClose: () => void; onInvited: () => Promise<void> }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'member'>('member');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            setError('Enter a valid email address');
            return;
        }
        setSending(true);
        try {
            const result = await teamApi.invite(team.id, email.trim(), role);
            toast.success(result.message);
            setEmail('');
            await onInvited();
            onClose();
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Could not send invitation'));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Invite member"
                className="bg-[#242528] border border-[#55575c] p-5 w-full max-w-sm shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold mb-1 text-[#e0e1e3]">Invite to {team.name}</h2>
                <p className="text-xs text-[#96999e] mb-4">
                    They need an account already. Invitees accept or decline from their Teams page or notifications.
                </p>
                <form onSubmit={submit} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="invite-email" className="block text-xs font-semibold text-[#b7b9bc] mb-1">Email</label>
                        <input
                            id="invite-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="teammate@example.com"
                            className="w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] placeholder:text-[#85878a] px-3 py-2 text-sm focus:border-[#75a4f7] focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="invite-role" className="block text-xs font-semibold text-[#b7b9bc] mb-1">Role</label>
                        <select
                            id="invite-role"
                            value={role}
                            onChange={(event) => setRole(event.target.value as 'admin' | 'member')}
                            className="w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] px-3 py-2 text-sm"
                        >
                            <option value="member">Member - can work on team projects</option>
                            <option value="admin">Admin - can invite and manage members</option>
                        </select>
                    </div>
                    {error && <p className="text-[#f15b50] text-sm" role="alert">{error}</p>}
                    <div className="flex justify-end gap-2 border-t border-[#36373a] pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-[#55575c] text-[#b7b9bc] text-sm hover:bg-[#2c2d30]">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={sending}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#6f9deb] text-[#101214] font-semibold text-sm hover:bg-[#87adf0] disabled:opacity-50"
                        >
                            <Mail size={14} /> {sending ? 'Sending...' : 'Send invite'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function TeamSettingsModal({ team, onClose, onSaved }: { team: Team; onClose: () => void; onSaved: () => Promise<void> }) {
    const [name, setName] = useState(team.name);
    const [description, setDescription] = useState(team.description);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setSaving(true);
        try {
            await teamApi.update(team.id, { name: name.trim(), description });
            toast.success('Team updated');
            await onSaved();
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Could not update team'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Team settings"
                className="bg-[#242528] border border-[#55575c] p-5 w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold mb-4 text-[#e0e1e3]">Team settings</h2>
                <form onSubmit={submit} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="settings-team-name" className="block text-xs font-semibold text-[#b7b9bc] mb-1">Name</label>
                        <input
                            id="settings-team-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] px-3 py-2 text-sm focus:border-[#75a4f7] focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="settings-team-description" className="block text-xs font-semibold text-[#b7b9bc] mb-1">Description</label>
                        <textarea
                            id="settings-team-description"
                            rows={3}
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            className="w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] px-3 py-2 text-sm focus:border-[#75a4f7] focus:outline-none"
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

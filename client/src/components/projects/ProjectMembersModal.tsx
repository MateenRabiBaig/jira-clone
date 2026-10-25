import { useState } from "react";
import { Search, UserMinus, UserPlus, X } from "lucide-react";
import { toast } from "react-toastify";
import { projectApi } from "../../api/projectApi";
import { userApi } from "../../api/userApi";
import { getErrorMessage } from "../../api/axios";
import type { Project, User, UserRef } from "../../types";
import Avatar from "../common/Avatar";
import ConfirmDialog from "../common/ConfirmDialog";

interface Props {
    project: Project;
    isOwner: boolean;
    currentUserId: string;
    onClose: () => void;
    onMembersChanged: (project: Project) => void;
}

const resolveUser = (ref: UserRef): User | null => (typeof ref === 'object' && ref ? ref : null);

/**
 * Project member management: search registered users by name or email,
 * add them (owner only), inspect the list and remove members.
 */
export default function ProjectMembersModal({ project, isOwner, currentUserId, onClose, onMembersChanged }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [removing, setRemoving] = useState<User | null>(null);
    const [removeBusy, setRemoveBusy] = useState(false);

    const memberIds = new Set(
        project.members.map((member) => (typeof member === 'object' && member ? member.id : member)),
    );

    const runSearch = async () => {
        const trimmed = query.trim();
        setSearched(true);
        if (trimmed.length < 2) {
            setResults([]);
            return;
        }
        setSearching(true);
        try {
            setResults(await userApi.searchUsers(trimmed));
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'User search failed'));
            setResults([]);
        } finally {
            setSearching(false);
        }
    };

    const addMember = async (user: User) => {
        setAddingId(user.id);
        try {
            const updated = await projectApi.addMember(project.id, user.id);
            onMembersChanged(updated);
            toast.success(`${user.name} added to ${project.name}`);
            setResults((prev) => prev.filter((candidate) => candidate.id !== user.id));
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Could not add member'));
        } finally {
            setAddingId(null);
        }
    };

    const confirmRemove = async () => {
        if (!removing) return;
        setRemoveBusy(true);
        try {
            const updated = await projectApi.removeMember(project.id, removing.id);
            onMembersChanged(updated);
            toast.success(`${removing.name} removed from the project`);
            setRemoving(null);
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Could not remove member'));
        } finally {
            setRemoveBusy(false);
        }
    };

    const owner = resolveUser(project.owner);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Project members"
                className="bg-[#242528] border border-[#55575c] w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-[#36373a] px-5 py-3.5">
                    <h2 className="text-base font-semibold text-[#e0e1e3]">Project members ({project.members.length})</h2>
                    <button onClick={onClose} aria-label="Close members" className="text-[#96999e] hover:text-white">
                        <X size={16} />
                    </button>
                </div>

                <div className="px-5 py-4">
                    {isOwner ? (
                        <div className="mb-4">
                            <label htmlFor="member-search" className="block text-xs font-semibold text-[#b7b9bc] mb-1.5">
                                Add people
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96999e]" />
                                    <input
                                        id="member-search"
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        onKeyDown={(event) => event.key === 'Enter' && void runSearch()}
                                        placeholder="Search by name or email"
                                        className="w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] placeholder:text-[#85878a] pl-9 pr-3 py-2 text-sm focus:border-[#75a4f7] focus:outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => void runSearch()}
                                    disabled={searching || query.trim().length < 2}
                                    className="border border-[#55575c] text-[#d0d2d5] px-3 py-2 text-sm disabled:opacity-50 hover:bg-[#2c2d30]"
                                >
                                    {searching ? '...' : 'Find'}
                                </button>
                            </div>
                            <p className="text-[11px] text-[#85878a] mt-1.5">
                                People must have an account already. Search matches the start of a name or email.
                            </p>

                            {searched && !searching && results.length === 0 && (
                                <p className="text-xs text-[#85878a] mt-3">
                                    {query.trim().length < 2
                                        ? 'Type at least 2 characters to search.'
                                        : 'No matching users found.'}
                                </p>
                            )}

                            <div className="mt-2 space-y-1.5">
                                {results.map((user) => {
                                    const alreadyMember = memberIds.has(user.id);
                                    return (
                                        <div key={user.id} className="flex items-center justify-between bg-[#1c1d1f] border border-[#36373a] p-2.5">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <Avatar name={user.name} src={user.avatarUrl} size={28} />
                                                <div className="min-w-0">
                                                    <p className="text-sm text-[#e0e1e3] truncate">{user.name}</p>
                                                    <p className="text-[11px] text-[#96999e] truncate">{user.email}</p>
                                                </div>
                                            </div>
                                            {alreadyMember ? (
                                                <span className="text-[11px] text-[#4bce97]">Already a member</span>
                                            ) : (
                                                <button
                                                    onClick={() => void addMember(user)}
                                                    disabled={addingId === user.id}
                                                    className="flex items-center gap-1 bg-[#6f9deb] text-[#101214] font-semibold text-xs px-3 py-1.5 rounded hover:bg-[#87adf0] disabled:opacity-50"
                                                >
                                                    <UserPlus size={12} />
                                                    {addingId === user.id ? 'Adding...' : 'Add'}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-[#96999e] mb-4">Only the project owner can add or remove members.</p>
                    )}

                    <h3 className="text-xs font-semibold text-[#b7b9bc] mb-2">Members</h3>
                    <div className="space-y-1.5">
                        {project.members.map((ref) => {
                            const user = resolveUser(ref);
                            if (!user) return null;
                            const isOwnerMember = owner?.id === user.id;
                            return (
                                <div key={user.id} className="flex items-center justify-between bg-[#1c1d1f] border border-[#36373a] p-2.5">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Avatar name={user.name} src={user.avatarUrl} size={28} />
                                        <div className="min-w-0">
                                            <p className="text-sm text-[#e0e1e3] truncate">
                                                {user.name}
                                                {user.id === currentUserId && <span className="text-[#85878a]"> (you)</span>}
                                            </p>
                                            <p className="text-[11px] text-[#96999e] truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${
                                                isOwnerMember ? 'text-[#ddb30e] bg-[#3a2c1f]' : 'text-[#a9abad] bg-[#303134]'
                                            }`}
                                        >
                                            {isOwnerMember ? 'Owner' : 'Member'}
                                        </span>
                                        {isOwner && !isOwnerMember && (
                                            <button
                                                onClick={() => setRemoving(user)}
                                                aria-label={`Remove ${user.name}`}
                                                title={`Remove ${user.name}`}
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
                </div>

                <div className="flex justify-end border-t border-[#36373a] px-5 py-3">
                    <button onClick={onClose} className="text-sm text-[#96999e] hover:text-white px-3 py-1.5">
                        Done
                    </button>
                </div>
            </div>

            {removing && (
                <ConfirmDialog
                    title={`Remove ${removing.name}?`}
                    message="They lose access to this project immediately. Tasks assigned to them become unassigned."
                    confirmLabel="Remove"
                    danger
                    busy={removeBusy}
                    onConfirm={() => void confirmRemove()}
                    onCancel={() => setRemoving(null)}
                />
            )}
        </div>
    );
}

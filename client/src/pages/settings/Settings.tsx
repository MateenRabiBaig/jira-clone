import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Monitor, BellRing, UserRound, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { logout, userUpdated } from '../../redux/slices/authSlice';
import { toggleSidebar } from '../../redux/slices/sidebarSlice';
import { authApi } from '../../api/authApi';
import { getErrorMessage } from '../../api/axios';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Avatar from '../../components/common/Avatar';
import type { NotificationPrefs } from '../../types';

const NOTIFICATION_OPTIONS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
    { key: 'assignedTasks', label: 'Task assignments', description: 'When someone assigns a task to you or makes you the reporter.' },
    { key: 'comments', label: 'Comments', description: 'When someone comments on a task you are assigned to or reported.' },
    { key: 'mentions', label: 'Mentions', description: 'When someone @mentions your name in a comment.' },
    { key: 'statusChanges', label: 'Status changes', description: 'When a task you work on moves to another status.' },
    { key: 'invitations', label: 'Invitations', description: 'Team invitations and project memberships.' },
];

export default function Settings() {
    const user = useAppSelector((state) => state.auth.user);
    const collapsed = useAppSelector((state) => state.sidebar.collapsed);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [confirmLogout, setConfirmLogout] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    if (!user) return null;

    const prefs: NotificationPrefs = {
        assignedTasks: true,
        comments: true,
        mentions: true,
        statusChanges: true,
        invitations: true,
        ...user.notificationPrefs,
    };

    const setPref = async (key: keyof NotificationPrefs, value: boolean) => {
        const next = { ...prefs, [key]: value };
        // Optimistic update; revert if the server rejects it.
        dispatch(userUpdated({ ...user, notificationPrefs: next }));
        try {
            await authApi.updateMe({ notificationPrefs: { [key]: value } });
        } catch (err: unknown) {
            dispatch(userUpdated({ ...user, notificationPrefs: prefs }));
            toast.error(getErrorMessage(err, 'Could not save preference'));
        }
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        setDeleteError(null);
        try {
            await authApi.deleteMe(deletePassword);
            dispatch(logout());
            toast.info('Your account has been deleted');
            navigate('/login');
        } catch (err: unknown) {
            setDeleteError(getErrorMessage(err, 'Could not delete account'));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
            <h1 className="text-2xl font-bold text-[#e0e1e3]">Settings</h1>

            {/* Appearance */}
            <section className="bg-[#242528] border border-[#36373a] p-5">
                <h2 className="flex items-center gap-2 text-base font-semibold text-[#e0e1e3] mb-4"><Monitor size={16} /> Appearance &amp; layout</h2>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-[#d0d2d5]">Collapse sidebar</p>
                        <p className="text-xs text-[#96999e] mt-0.5">
                            Keep the sidebar as a narrow icon rail. Your choice is remembered across sessions.
                        </p>
                    </div>
                    <button
                        role="switch"
                        aria-checked={collapsed}
                        aria-label="Collapse sidebar"
                        onClick={() => dispatch(toggleSidebar())}
                        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${collapsed ? 'bg-[#6f9deb]' : 'bg-[#45464a]'}`}
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${collapsed ? 'translate-x-5' : ''}`}
                        />
                    </button>
                </div>
                <p className="text-[11px] text-[#85878a] mt-3">The app uses the dark theme; the accent color follows your system settings.</p>
            </section>

            {/* Notifications */}
            <section className="bg-[#242528] border border-[#36373a] p-5">
                <h2 className="flex items-center gap-2 text-base font-semibold text-[#e0e1e3] mb-4"><BellRing size={16} /> Notifications</h2>
                <div className="space-y-4">
                    {NOTIFICATION_OPTIONS.map((option) => (
                        <div key={option.key} className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-[#d0d2d5]">{option.label}</p>
                                <p className="text-xs text-[#96999e] mt-0.5">{option.description}</p>
                            </div>
                            <button
                                role="switch"
                                aria-checked={prefs[option.key] !== false}
                                aria-label={option.label}
                                onClick={() => void setPref(option.key, prefs[option.key] === false)}
                                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${prefs[option.key] !== false ? 'bg-[#6f9deb]' : 'bg-[#45464a]'}`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${prefs[option.key] !== false ? 'translate-x-5' : ''}`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Account */}
            <section className="bg-[#242528] border border-[#36373a] p-5">
                <h2 className="flex items-center gap-2 text-base font-semibold text-[#e0e1e3] mb-4"><UserRound size={16} /> Account</h2>
                <div className="flex items-center gap-4 mb-4">
                    <Avatar name={user.name} src={user.avatarUrl} size={44} />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-[#e0e1e3] truncate">{user.name}</p>
                        <p className="text-xs text-[#96999e] truncate">{user.email}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link to="/profile" className="border border-[#55575c] px-3.5 py-2 text-sm text-[#d0d2d5] hover:bg-[#2c2d30]">
                        Edit profile
                    </Link>
                    <button
                        onClick={() => setConfirmLogout(true)}
                        className="flex items-center gap-1.5 border border-[#55575c] px-3.5 py-2 text-sm text-[#d0d2d5] hover:bg-[#2c2d30]"
                    >
                        <LogOut size={14} /> Log out
                    </button>
                </div>
            </section>

            {/* Danger zone */}
            <section className="bg-[#242528] border border-[#f15b50]/40 p-5">
                <h2 className="flex items-center gap-2 text-base font-semibold text-[#f15b50] mb-2"><ShieldAlert size={16} /> Danger zone</h2>
                <p className="text-xs text-[#96999e] leading-5 mb-4">
                    Permanently delete your account, along with projects and teams you own that have no other members.
                    You cannot delete your account while you still own shared projects or teams.
                </p>

                {confirmDelete ? (
                    <div className="border border-[#f15b50]/40 p-4">
                        <label htmlFor="delete-password" className="block text-xs font-semibold text-[#b7b9bc] mb-1">
                            Confirm your password to continue
                        </label>
                        <input
                            id="delete-password"
                            type="password"
                            autoComplete="current-password"
                            value={deletePassword}
                            onChange={(event) => setDeletePassword(event.target.value)}
                            className="w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] px-3 py-2 text-sm focus:border-[#f15b50] focus:outline-none"
                        />
                        {deleteError && <p className="text-[#f15b50] text-xs mt-2" role="alert">{deleteError}</p>}
                        <div className="flex justify-end gap-2 mt-3">
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="px-4 py-2 border border-[#55575c] text-[#b7b9bc] text-sm hover:bg-[#2c2d30]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => void handleDeleteAccount()}
                                disabled={deleting || !deletePassword}
                                className="px-4 py-2 bg-[#f15b50] text-white font-semibold text-sm hover:bg-[#f4736a] disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete forever'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="border border-[#f15b50]/60 text-[#f15b50] px-3.5 py-2 text-sm hover:bg-[#f15b50]/10"
                    >
                        Delete account
                    </button>
                )}
            </section>

            {confirmLogout && (
                <ConfirmDialog
                    title="Log out?"
                    message="You will need to sign in again to access your projects."
                    confirmLabel="Log out"
                    onConfirm={() => {
                        dispatch(logout());
                        navigate('/login');
                    }}
                    onCancel={() => setConfirmLogout(false)}
                />
            )}
        </div>
    );
}

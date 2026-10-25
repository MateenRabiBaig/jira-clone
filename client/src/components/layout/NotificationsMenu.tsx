import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { notificationApi } from '../../api/notificationApi';
import { getErrorMessage } from '../../api/axios';
import { useClickOutside, useEscapeKey } from '../../hooks/useClickOutside';
import { timeAgo } from '../../utils/date';
import type { AppNotification } from '../../types';

interface Props {
    open: boolean;
    onClose: () => void;
    unreadCount: number;
    onCountChange: (count: number) => void;
}

/** Notification panel: list, mark-read, mark-all-read, navigation to targets. */
export default function NotificationsMenu({ open, onClose, unreadCount, onCountChange }: Props) {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useClickOutside(panelRef, onClose, open);
    useEscapeKey(onClose, open);

    useEffect(() => {
        if (!open) return undefined;
        let cancelled = false;
        void (async () => {
            try {
                const data = await notificationApi.getAll({ limit: 30 });
                if (cancelled) return;
                setNotifications(data.notifications);
                onCountChange(data.unreadCount);
                setError(null);
            } catch (err: unknown) {
                if (!cancelled) setError(getErrorMessage(err, 'Could not load notifications'));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [open, onCountChange]);

    if (!open) return null;

    const markRead = async (notification: AppNotification) => {
        if (notification.read) return;
        try {
            await notificationApi.markRead(notification.id);
            setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
            onCountChange(Math.max(0, unreadCount - 1));
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Could not mark notification as read'));
        }
    };

    const openNotification = async (notification: AppNotification) => {
        await markRead(notification);
        onClose();
        if (notification.team) navigate(`/teams/${notification.team}`);
        else if (notification.project) navigate(`/projects/${notification.project}`);
    };

    const markAllRead = async () => {
        try {
            await notificationApi.markAllRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            onCountChange(0);
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Could not mark all as read'));
        }
    };

    return (
        <div
            ref={panelRef}
            role="dialog"
            aria-label="Notifications"
            className="absolute right-0 top-full mt-2 w-[min(380px,calc(100vw-2rem))] z-50"
        >
            <div className="bg-[#242528] border border-[#45464a] rounded-lg shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 h-11 border-b border-[#36373a]">
                    <span className="text-sm font-semibold text-[#e0e1e3]">Notifications</span>
                    <button
                        onClick={markAllRead}
                        disabled={unreadCount === 0}
                        className="flex items-center gap-1.5 text-[11px] text-[#75a4f7] disabled:text-[#55575c]"
                    >
                        <CheckCheck size={13} /> Mark all read
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {loading && <p className="text-xs text-[#96999e] px-4 py-4">Loading notifications...</p>}
                    {error && <p className="text-xs text-[#f15b50] px-4 py-4">{error}</p>}
                    {!loading && !error && notifications.length === 0 && (
                        <p className="text-xs text-[#85878a] px-4 py-6 text-center">
                            You're all caught up. Notifications about assignments, comments, mentions and invites appear here.
                        </p>
                    )}
                    {!loading &&
                        notifications.map((notification) => (
                            <button
                                key={notification.id}
                                onClick={() => void openNotification(notification)}
                                className={`w-full text-left px-4 py-3 border-b border-[#36373a] last:border-0 hover:bg-[#2c2d30] transition-colors ${
                                    notification.read ? '' : 'bg-[#1c3764]/20'
                                }`}
                            >
                                <div className="flex items-start gap-2">
                                    {!notification.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-[#75a4f7] shrink-0" aria-hidden />}
                                    <div className="min-w-0">
                                        <p className={`text-xs leading-5 ${notification.read ? 'text-[#a9abad]' : 'text-[#e0e1e3]'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-[#85878a] mt-1">{timeAgo(notification.createdAt)}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                </div>
            </div>
        </div>
    );
}

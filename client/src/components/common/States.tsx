import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
    return (
        <div className="flex items-center justify-center gap-2 py-16 text-[#96999e] text-sm" role="status">
            <Loader2 size={16} className="animate-spin" />
            {label}
        </div>
    );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center" role="alert">
            <p className="text-[#f15b50] text-sm">{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="border border-[#55575c] px-4 py-1.5 text-xs text-[#d0d2d5] hover:bg-[#2c2d30]">
                    Try again
                </button>
            )}
        </div>
    );
}

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Icon size={36} className="text-[#55575c]" />
            <p className="text-[#d0d2d5] text-sm font-medium">{title}</p>
            {description && <p className="text-[#96999e] text-xs max-w-xs">{description}</p>}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}

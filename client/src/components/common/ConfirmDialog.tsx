import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    busy?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

/** Modal confirmation for destructive or irreversible actions. */
export default function ConfirmDialog({
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
    busy = false,
    onConfirm,
    onCancel,
}: Props) {
    const confirmRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        confirmRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onCancel]);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[80] p-4" onClick={onCancel}>
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                className="bg-[#242528] border border-[#55575c] p-5 w-full max-w-sm shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start gap-3">
                    {danger && <AlertTriangle size={20} className="text-[#f15b50] shrink-0 mt-0.5" />}
                    <div>
                        <h2 id="confirm-title" className="text-base font-semibold text-[#e0e1e3]">{title}</h2>
                        <p className="text-sm text-[#96999e] mt-1.5 leading-5">{message}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-5">
                    <button type="button" onClick={onCancel} className="px-4 py-2 border border-[#55575c] text-[#b7b9bc] text-sm hover:bg-[#2c2d30]">
                        {cancelLabel}
                    </button>
                    <button
                        ref={confirmRef}
                        type="button"
                        onClick={onConfirm}
                        disabled={busy}
                        className={`px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
                            danger ? 'bg-[#f15b50] text-white hover:bg-[#f4736a]' : 'bg-[#6f9deb] text-[#101214] hover:bg-[#87adf0]'
                        }`}
                    >
                        {busy ? 'Working...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

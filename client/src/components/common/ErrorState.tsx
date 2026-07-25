interface Props {
    message: string;
    onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
    return (
        <div className="text-center py-10">
            <p className="text-red-500 mb-3">{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="text-sm border rounded px-3 py-1">Retry</button>
            )}
        </div>
    )
}
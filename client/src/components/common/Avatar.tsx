import { absoluteUrl } from '../../config/env';

interface Props {
    name: string;
    size?: number;
    src?: string | null;
    className?: string;
}

const PALETTE = ['#c97cf4', '#4bce97', '#fca700', '#6cc3e0', '#e774bb', '#ddb30e', '#75a4f7'];

const initialsOf = (name: string): string => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0];
    if (!first) return '?';
    if (parts.length === 1) return first.charAt(0).toUpperCase();
    const last = parts[parts.length - 1] ?? first;
    return (first.charAt(0) + last.charAt(0)).toUpperCase();
};

const colorOf = (name: string): string => {
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    return PALETTE[hash % PALETTE.length] ?? PALETTE[0]!;
};

/**
 * Renders the user's uploaded avatar when available, otherwise a local
 * initials avatar (no external service involved).
 */
export default function Avatar({ name, size = 24, src, className = '' }: Props) {
    const style = { width: size, height: size, fontSize: Math.max(10, size * 0.4) };

    if (src) {
        return (
            <img
                src={absoluteUrl(src)}
                alt={name}
                title={name}
                style={style}
                className={`rounded-full shrink-0 object-cover ${className}`}
            />
        );
    }

    return (
        <span
            role="img"
            aria-label={name}
            title={name}
            style={{ ...style, backgroundColor: colorOf(name) }}
            className={`rounded-full shrink-0 inline-flex items-center justify-center text-white font-semibold select-none ${className}`}
        >
            {initialsOf(name)}
        </span>
    );
}

interface SectionHeaderProps {
    title: string;
    subtitle?: string; 
}

function SectionHeader({
    title,
    subtitle,
}: SectionHeaderProps) {
    return (
        <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>

            {subtitle && (
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
        </div>
    );
}

export default SectionHeader;
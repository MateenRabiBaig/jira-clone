import type { LucideIcon } from "lucide-react"

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
    return (
        <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-200 transition hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-500">{title}</p>
                    <h2 className="mt-0.5 text-xl font-bold text-slate-800">{value}</h2>
                </div>

                <div className={`rounded-full p-2 ${color}`}>
                    <Icon
                        className="text-white"
                        size={18}
                    />
                </div>
            </div>
        </div>
    );
}

export default StatCard;

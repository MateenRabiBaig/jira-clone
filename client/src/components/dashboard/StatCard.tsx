import type { LucideIcon } from "lucide-react"

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
    return (
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 transition hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">{title}</p>
                    <h2 className="mt-2 text-3xl font-bold text-slate-800">{value}</h2>
                </div>

                <div className={`rounded-full p-3 ${color}`}>
                    <Icon
                        className="text-white"
                        size={22}
                    />
                </div>
            </div>
        </div>
    );
}

export default StatCard;
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
    return (
        <div className="bg-[#242528] p-3 border border-[#36373a] transition hover:border-[#55575c]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-[#96999e]">{title}</p>
                    <h2 className="mt-0.5 text-xl font-bold text-[#e0e1e3]">{value}</h2>
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

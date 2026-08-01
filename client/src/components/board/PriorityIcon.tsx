import { ChevronsUp, ChevronsDown, Equal } from "lucide-react";

interface PriorityIconProps {
  priority: string;
  size?: number;
}

export default function PriorityIcon({ priority, size = 14 }: PriorityIconProps) {
  if (priority === 'high') {
    return (
      <div className="flex items-center gap-0.5">
        <ChevronsUp size={size} className="text-red-600" />
        <span className="text-[11px] text-red-600 font-medium">High</span>
      </div>
    );
  }
  if (priority === 'medium') {
    return (
      <div className="flex items-center gap-0.5">
        <Equal size={size} className="text-yellow-600" />
        <span className="text-[11px] text-yellow-600 font-medium">Medium</span>
      </div>
    );
  }
  if (priority === 'low') {
    return (
      <div className="flex items-center gap-0.5">
        <ChevronsDown size={size} className="text-blue-500" />
        <span className="text-[11px] text-blue-500 font-medium">Low</span>
      </div>
    );
  }
  return null;
}
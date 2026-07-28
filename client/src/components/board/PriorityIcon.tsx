import { ChevronsUp, ChevronsDown, Equal } from "lucide-react";

export default function PriorityIcon({ priority }: { priority: string }) {
    if(priority === 'high') return <ChevronsUp size={14} className="text-jira-danger" />
    if(priority === 'low') return <ChevronsDown size={14} className="text-jira-muted" />
    return <Equal size={14} className="text-jira-muted" />
}
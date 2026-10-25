import { X } from 'lucide-react';

interface Props {
    onClose: () => void;
}

const SECTIONS = [
    {
        title: 'Projects & boards',
        items: [
            'Create a project from the Projects page or Quick actions on the dashboard.',
            'Open a project to see its board. Drag cards between columns to change status.',
            'Click any card to open the task detail view where you can edit every field.',
        ],
    },
    {
        title: 'Teams & members',
        items: [
            'Create a team from the Teams page, then invite people by email.',
            'Invitees accept or decline from the Teams page or their notifications.',
            'Owners and admins manage members and roles; members can view and work on team projects.',
            'To add someone to a single project, open the project and use "Add member" (project owner only).',
        ],
    },
    {
        title: 'Tasks',
        items: [
            'Create tasks from the board columns, the Create button, or Quick actions.',
            'Assign teammates, set priority, due dates, labels and work type (task/story/bug).',
            'All your assigned tasks are collected on the My Tasks page with filters and sorting.',
            'Comment on tasks and @mention teammates by name to notify them.',
        ],
    },
    {
        title: 'Account',
        items: [
            'Update your name, email, bio and avatar from the Profile page.',
            'Change notification preferences and manage your account from Settings.',
        ],
    },
];

export default function HelpModal({ onClose }: Props) {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Help"
                className="bg-[#242528] border border-[#55575c] w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-[#36373a] px-5 py-3.5">
                    <h2 className="text-base font-semibold text-[#e0e1e3]">Help &amp; getting started</h2>
                    <button onClick={onClose} aria-label="Close help" className="text-[#96999e] hover:text-white">
                        <X size={17} />
                    </button>
                </div>
                <div className="px-5 py-4 space-y-5">
                    {SECTIONS.map((section) => (
                        <section key={section.title}>
                            <h3 className="text-sm font-semibold text-[#d0d2d5] mb-2">{section.title}</h3>
                            <ul className="space-y-1.5">
                                {section.items.map((item) => (
                                    <li key={item} className="text-xs text-[#96999e] leading-5 flex gap-2">
                                        <span className="text-[#55575c] mt-px">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}

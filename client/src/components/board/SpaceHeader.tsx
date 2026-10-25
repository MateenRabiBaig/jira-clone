import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Share2, Settings, Trash2, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import type { Project } from '../../types';

interface Props {
  project: Project;
  canManage: boolean;
  onOpenMembers: () => void;
  onOpenSettings: () => void;
  onDelete: () => void;
}

export default function SpaceHeader({ project, canManage, onOpenMembers, onOpenSettings, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Board link copied to clipboard');
    } catch {
      toast.error('Could not copy the link');
    }
  };

  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-center gap-2 text-[#96999e] text-xs mb-1.5">
        <Link to="/projects" className="hover:text-[#c8c9cc]">Spaces</Link>
        <span>/</span>
        <span className="text-[#c8c9cc]">{project.name}</span>
        {project.team && typeof project.team === 'object' && (
          <>
            <span>/</span>
            <Link to={`/teams/${project.team.id}`} className="hover:text-[#c8c9cc]">{project.team.name}</Link>
          </>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-[#e0e1e3] text-[22px] font-bold tracking-tight truncate">{project.name} board</h1>
          {project.key && (
            <span className="text-[11px] font-medium text-[#85878a] border border-[#45464a] rounded px-1.5 py-0.5">{project.key}</span>
          )}
          <button
            onClick={onOpenMembers}
            title="View members"
            aria-label="View project members"
            className="p-1.5 border border-[#45464a] text-[#b7b9bc] hover:bg-[#292a2d]"
          >
            <Users size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void share()}
            title="Copy board link"
            aria-label="Copy board link"
            className="p-1.5 border border-[#45464a] text-[#b7b9bc] hover:bg-[#292a2d]"
          >
            <Share2 size={15} />
          </button>
          {canManage && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Project actions"
                className="p-1.5 text-[#96999e] hover:bg-[#292a2d]"
              >
                <MoreHorizontal size={18} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                  <div role="menu" className="absolute right-0 top-full mt-1 w-48 bg-[#242528] border border-[#45464a] rounded-lg shadow-2xl z-50 py-1">
                    <button
                      role="menuitem"
                      onClick={() => { setMenuOpen(false); onOpenSettings(); }}
                      className="w-full text-left px-4 py-2 text-sm text-[#d0d2d5] hover:bg-[#2c2d30] flex items-center gap-2.5"
                    >
                      <Settings size={14} /> Project settings
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => { setMenuOpen(false); onDelete(); }}
                      className="w-full text-left px-4 py-2 text-sm text-[#f15b50] hover:bg-[#2c2d30] flex items-center gap-2.5"
                    >
                      <Trash2 size={14} /> Delete project
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

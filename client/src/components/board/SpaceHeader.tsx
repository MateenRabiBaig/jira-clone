import { MoreHorizontal, Share2, Users } from 'lucide-react';

interface Props {
  name: string;
  onAddMember: () => void;
}

export default function SpaceHeader({ name, onAddMember }: Props) {
  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-center gap-2 text-[#96999e] text-xs mb-1.5"><span>Spaces</span><span>/</span><span className="text-[#c8c9cc]">{name}</span></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-[#e0e1e3] text-[22px] font-bold tracking-tight">{name} board</h1>
          <button className="p-1.5 border border-[#45464a] text-[#b7b9bc] hover:bg-[#292a2d]"><Users size={16} /></button>
          <button className="p-1.5 text-[#96999e] hover:bg-[#292a2d]"><MoreHorizontal size={18} /></button>
        </div>
        <div className="flex items-center gap-2"><button className="p-1.5 border border-[#45464a] text-[#b7b9bc]"><Share2 size={15} /></button><button onClick={onAddMember} className="text-[#b7b9bc] border border-[#45464a] px-2.5 py-1.5 text-xs hover:bg-[#292a2d]"><Users size={13} className="inline mr-1.5" />Add member</button></div>
      </div>
    </div>
  );
}

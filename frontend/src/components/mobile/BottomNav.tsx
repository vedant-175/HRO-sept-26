
import { ShieldCheck, Terminal, Database, PlaySquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] h-16 bg-[#010f1f]/90 backdrop-blur-md border-t border-slate-800/80 flex items-center justify-around z-50">
      <NavItem icon={<ShieldCheck size={20} />} label="Rules" active />
      <NavItem icon={<Terminal size={20} />} label="Schema" />
      <NavItem icon={<Database size={20} />} label="Datasets" />
      <button 
        onClick={() => navigate('/river')}
        className="flex flex-col items-center justify-center space-y-1 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <PlaySquare size={20} />
        <span className="text-[10px] font-medium">Agent</span>
      </button>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex flex-col items-center justify-center space-y-1 transition-colors ${active ? 'text-[#00d2ff]' : 'text-slate-500 hover:text-slate-300'}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

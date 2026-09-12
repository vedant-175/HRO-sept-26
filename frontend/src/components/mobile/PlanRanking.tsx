
import { Layers } from 'lucide-react';

export default function PlanRanking() {
  const ranks = [
    { num: 1, title: 'Desired Timeline Compliance', desc: 'Meets requested date if possible' },
    { num: 2, title: 'Minimal User Friction', desc: 'Zero spending modifications preferred' },
    { num: 3, title: 'Capital Preservation', desc: 'Minimize fees and interest' },
    { num: 4, title: 'Early Initiation', desc: 'Earliest settlement start date' },
    { num: 5, title: 'Simplicity Principle', desc: 'Fewer installment splits' },
    { num: 6, title: 'Deterministic Tie-Breaker', desc: 'Lowest payment_option_id' }
  ];

  return (
    <div className="bg-[#051424] border border-[#1e2d3d] rounded-2xl p-5 mt-6 relative z-10">
      <div className="flex items-center space-x-2 mb-2">
        <Layers className="text-[#00d2ff]" size={18} />
        <h2 className="text-sm font-bold text-white">Plan Ranking Protocol</h2>
      </div>
      <p className="text-xs text-slate-400 mb-6">Lexicographical cascade for tie-breakers.</p>

      <div className="space-y-3 relative">
        <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-800/80 -z-10"></div>
        {ranks.map((r, i) => (
          <div key={i} className="flex items-center bg-[#0a192f] border border-slate-800/80 p-3 rounded-xl shadow-lg">
            <div className="w-8 h-8 shrink-0 bg-[#020b14] border border-[#00d2ff]/30 text-[#00d2ff] rounded flex items-center justify-center font-mono font-bold shadow-[0_0_10px_rgba(0,210,255,0.15)] mr-4">
              {r.num}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">{r.title}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{r.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

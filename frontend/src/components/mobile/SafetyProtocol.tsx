
import { ShieldCheck } from 'lucide-react';

export default function SafetyProtocol() {
  return (
    <div className="bg-[#0a192f]/80 border border-[#1e2d3d] rounded-2xl p-5 relative overflow-hidden mt-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="text-cyan-400" size={20} />
          <h2 className="text-lg font-bold text-white">Deterministic Safety</h2>
        </div>
        <div className="bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-400">
          RULE V2.4
        </div>
      </div>

      {/* SVG Chart placeholder */}
      <div className="w-full h-32 bg-[#020b14] border border-slate-800 rounded-lg mb-6 relative p-2 flex flex-col justify-end">
        <div className="absolute top-2 left-2 text-[10px] text-slate-500 font-mono">Projected Liquidity Index (T+0 → T+90)</div>
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
          {/* Min Balance Line */}
          <line x1="0" y1="40" x2="100" y2="40" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" />
          <text x="2" y="38" fontSize="4" fill="#ef4444" className="font-mono">MIN_BALANCE_LIMIT</text>
          
          {/* Trajectory */}
          <path d="M0,20 C30,10 40,45 60,30 S80,10 100,15" fill="none" stroke="#00d2ff" strokeWidth="2" className="drop-shadow-[0_0_4px_rgba(0,210,255,0.8)]" />
          
          {/* End Point */}
          <circle cx="100" cy="15" r="2" fill="#00d2ff" />
        </svg>
        <div className="absolute right-2 top-10 bg-green-500/20 text-green-400 text-[8px] px-1 py-0.5 rounded font-mono border border-green-500/30">
          +18.4% Buffer
        </div>
      </div>

      <div className="space-y-4">
        <Checkpoint 
          color="bg-blue-500" 
          text="90-Day Liquidity Forecast (salary inflows, recurring liabilities, image receipts)." 
        />
        <Checkpoint 
          color="bg-red-500" 
          text="Inviolate Safety Boundary (T+0..T+90 balance >= minimum_balance_to_keep)." 
        />
        <Checkpoint 
          color="bg-amber-500" 
          text="Deterministic Inflow Filtering (Zero speculation, ignore pending deposits)." 
        />
      </div>
    </div>
  );
}

function Checkpoint({ color, text }: { color: string, text: string }) {
  return (
    <div className="flex items-start space-x-3">
      <div className={`mt-1.5 w-2 h-2 rounded-full ${color} shadow-[0_0_8px_currentColor] shrink-0`}></div>
      <p className="text-xs text-slate-300 leading-relaxed">{text}</p>
    </div>
  );
}

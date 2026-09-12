
import { Clock, RefreshCcw, Filter, Cpu } from 'lucide-react';

export default function HeaderHero() {
  return (
    <div className="pt-6 pb-4 px-4 border-b border-slate-800/50 bg-gradient-to-b from-[#010f1f] to-[#051424]">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center">
            <span className="text-blue-400 font-bold text-xs">BW</span>
          </div>
          <span className="font-bold text-lg text-white tracking-wide">BuyWait AI</span>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-mono text-green-400">90-DAY ENGINE: ACTIVE</span>
        </div>
      </div>

      {/* Pill Badge */}
      <div className="inline-block mb-4 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30">
        <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest flex items-center">
          <span className="w-1 h-1 rounded-full bg-cyan-400 mr-2 shadow-[0_0_8px_#22d3ee]"></span>
          AI-Native Financial Decision System
        </span>
      </div>

      {/* Title & Subtitle */}
      <h1 className="text-3xl font-extrabold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-[#b3d4ff] to-[#00d2ff]">
        Buy or Wait? Autonomous Affordability Engine
      </h1>
      <p className="text-sm text-slate-400 mb-8 leading-relaxed">
        Evaluating whether you can safely afford expenses over a 90-day trajectory using multimodal reasoning, cash-flow constraints, and deterministic verification.
      </p>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={<Clock size={16} />} title="HORIZON" value="90-Day Trajectory Model" />
        <MetricCard icon={<RefreshCcw size={16} />} title="FX SUPPORT" value="5 Currencies" />
        <MetricCard icon={<Filter size={16} />} title="DECISION STATES" value="5 Classes" />
        <MetricCard icon={<Cpu size={16} />} title="EFFICIENCY" value="Optimal (Bounded)" />
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
  return (
    <div className="bg-[#0a192f]/50 border border-[#1e2d3d] rounded-xl p-3 backdrop-blur-sm">
      <div className="text-blue-400 mb-2">{icon}</div>
      <div className="text-[10px] font-mono text-slate-500 mb-1">{title}</div>
      <div className="text-xs font-semibold text-slate-200">{value}</div>
    </div>
  );
}

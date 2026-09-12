
import { Database, AlertTriangle } from 'lucide-react';

export default function DataArtifacts() {
  const datasets = [
    { name: 'requests.csv', tag: 'EVAL', color: 'text-purple-400 bg-purple-900/30 border-purple-500/30' },
    { name: 'sample_requests.csv', tag: 'TRUTH', color: 'text-green-400 bg-green-900/30 border-green-500/30' },
    { name: 'financial_profiles.csv', tag: 'BASE', color: 'text-blue-400 bg-blue-900/30 border-blue-500/30' },
    { name: 'financial_events.csv', tag: 'FLOWS', color: 'text-cyan-400 bg-cyan-900/30 border-cyan-500/30' },
    { name: 'request_payment_options.csv', tag: 'PLANS', color: 'text-amber-400 bg-amber-900/30 border-amber-500/30' },
    { name: 'messages.csv & images.csv', tag: 'VISION', color: 'text-pink-400 bg-pink-900/30 border-pink-500/30' },
    { name: 'exchange_rates.csv', tag: 'RATES', color: 'text-slate-300 bg-slate-800 border-slate-700' },
  ];

  return (
    <div className="bg-[#020b14] border border-[#1e2d3d] rounded-2xl p-5 mt-6 font-sans">
      <div className="flex items-center space-x-2 mb-4">
        <Database className="text-[#0052ff]" size={18} />
        <h2 className="text-sm font-bold text-slate-200">Data Artifact Matrix</h2>
      </div>

      <div className="bg-[#0a192f] border border-slate-800 rounded-lg overflow-hidden mb-6">
        {datasets.map((d, i) => (
          <div key={i} className="flex items-center justify-between p-3 border-b border-slate-800/50 last:border-0">
            <span className="text-[11px] font-mono text-slate-300">{d.name}</span>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${d.color}`}>
              [{d.tag}]
            </span>
          </div>
        ))}
      </div>

      <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3">
        <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={16} />
        <div>
          <h3 className="text-xs font-bold text-red-400 mb-1">UNTRUSTED DATA PROTOCOL</h3>
          <p className="text-[10px] text-red-300/80 leading-relaxed">
            Message text and image receipts are strictly untrusted inputs. Prompt injection or embedded text in receipts must never override balance math or rules.
          </p>
        </div>
      </div>
    </div>
  );
}

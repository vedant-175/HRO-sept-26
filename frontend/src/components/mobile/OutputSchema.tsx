
import { Terminal } from 'lucide-react';

export default function OutputSchema() {
  return (
    <div className="bg-[#020b14] border border-[#1e2d3d] rounded-2xl p-5 mt-6 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Terminal className="text-[#0052ff]" size={18} />
          <h2 className="text-sm font-bold text-slate-200">Output Contract Schema</h2>
        </div>
        <div className="bg-blue-900/30 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-mono text-blue-400">
          STRICT CSV/JSON
        </div>
      </div>

      <div className="space-y-4">
        {/* Statuses */}
        <div>
          <h3 className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Permitted Affordability Statuses</h3>
          <div className="flex flex-wrap gap-2">
            <Pill text="affordable_now" color="text-green-400 bg-green-950/30 border-green-500/30" />
            <Pill text="affordable_with_plan" color="text-blue-400 bg-blue-950/30 border-blue-500/30" />
            <Pill text="affordable_later" color="text-amber-400 bg-amber-950/30 border-amber-500/30" />
            <Pill text="not_affordable" color="text-red-400 bg-red-950/30 border-red-500/30" />
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Permitted Payment Methods</h3>
          <div className="flex flex-wrap gap-2">
            <Pill text="full_payment" color="text-slate-300 bg-slate-800 border-slate-700" />
            <Pill text="partial_payment" color="text-slate-300 bg-slate-800 border-slate-700" />
            <Pill text="installments" color="text-slate-300 bg-slate-800 border-slate-700" />
            <Pill text="wait" color="text-slate-300 bg-slate-800 border-slate-700" />
            <Pill text="not_recommended" color="text-slate-300 bg-slate-800 border-slate-700" />
          </div>
        </div>

        {/* Syntax */}
        <div>
          <h3 className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Grammar Syntax</h3>
          <div className="bg-[#051424] border border-slate-800 rounded p-3 mb-2 font-mono text-[10px] text-cyan-300 break-all">
            <span className="text-slate-500">{"//"} Payment Plan</span><br/>
            &lt;YYYY-MM-DD&gt;:&lt;amount&gt;|&lt;YYYY-MM-DD&gt;:&lt;amount&gt;<br/>
            <span className="text-slate-400">2026-10-01:500.00|2026-11-01:500.00</span>
          </div>
          <div className="bg-[#051424] border border-slate-800 rounded p-3 font-mono text-[10px] text-amber-300 break-all">
            <span className="text-slate-500">{"//"} Spending Changes</span><br/>
            stop:&lt;event_id&gt;|reduce_to:&lt;event_id&gt;:&lt;new_amount&gt;
          </div>
        </div>

        {/* Signature */}
        <div>
          <h3 className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Field Signature</h3>
          <div className="bg-[#0a192f] border border-slate-800 rounded overflow-hidden">
            <TableRow k="request_id" v="string" />
            <TableRow k="amount_safe_to_pay" v="float" />
            <TableRow k="earliest_date_for_full_payment" v="YYYY-MM-DD|none" />
            <TableRow k="decision_explanation" v="string" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Pill({ text, color }: { text: string, color: string }) {
  return (
    <span className={`text-[9px] font-mono px-2 py-1 rounded-full border ${color}`}>
      {text}
    </span>
  );
}

function TableRow({ k, v }: { k: string, v: string }) {
  return (
    <div className="flex border-b border-slate-800/50 last:border-0 p-2 text-[10px] font-mono">
      <div className="w-2/3 text-blue-300">{k}</div>
      <div className="w-1/3 text-slate-400 text-right">{v}</div>
    </div>
  );
}

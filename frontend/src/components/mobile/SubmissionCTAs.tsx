
import { CheckCircle2, Download, TerminalSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SubmissionCTAs() {
  const navigate = useNavigate();

  return (
    <div className="mt-6 mb-10">
      <div className="bg-[#051424] border border-[#1e2d3d] rounded-2xl p-5 mb-4">
        <h3 className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Audited Checklist</h3>
        <div className="space-y-2">
          <CheckItem text="code.zip" />
          <CheckItem text="output.csv" />
          <CheckItem text="evaluation/usage_report.md" />
          <CheckItem text="evaluation/chat_transcript.jsonl" />
        </div>
      </div>

      <div className="space-y-3">
        <button className="w-full bg-[#0052ff] hover:bg-[#00d2ff] transition-colors text-white font-bold py-4 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,82,255,0.4)]">
          <Download size={18} className="mr-2" />
          Download Problem & Data
        </button>
        <button 
          onClick={() => navigate('/river')}
          className="w-full bg-transparent border border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 transition-all text-white font-bold py-4 rounded-xl flex items-center justify-center backdrop-blur"
        >
          <TerminalSquare size={18} className="mr-2" />
          Simulate 90-Day Agent
        </button>
      </div>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
      <CheckCircle2 className="text-green-400 shrink-0" size={14} />
      <span>{text}</span>
    </div>
  );
}

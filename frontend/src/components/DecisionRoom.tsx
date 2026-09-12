import { useState } from 'react';
import { useStore } from '../store';
import { CheckCircle2, AlertTriangle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DecisionRoom() {
  const { selectedRequest } = useStore();
  const [showWhy, setShowWhy] = useState(false);

  if (!selectedRequest || !selectedRequest.decision) return null;

  const decision = selectedRequest.decision;

  const statusColors: Record<string, string> = {
    'affordable_now': 'bg-teal-900 text-teal-100 border-teal-500',
    'affordable_with_plan': 'bg-amber-900 text-amber-100 border-amber-500',
    'affordable_later': 'bg-blue-900 text-blue-100 border-blue-500',
    'not_affordable': 'bg-red-900 text-red-100 border-red-500'
  };

  const statusIcons: Record<string, any> = {
    'affordable_now': <CheckCircle2 className="w-5 h-5 mr-2" />,
    'affordable_with_plan': <Clock className="w-5 h-5 mr-2" />,
    'affordable_later': <Clock className="w-5 h-5 mr-2" />,
    'not_affordable': <AlertTriangle className="w-5 h-5 mr-2" />
  };

  const statusDisplay = decision.affordability_status.replace(/_/g, ' ');
  const statusColorClass = statusColors[decision.affordability_status] || 'bg-zinc-800 text-zinc-100 border-zinc-500';

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full bg-[#0a0b0f] border border-zinc-800 shadow-2xl h-full overflow-y-auto pointer-events-auto"
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-1 text-zinc-100">Request {selectedRequest.request_id}</h2>
        <p className="text-zinc-400 mb-6 text-sm">{selectedRequest.request_text}</p>
        
        <div className={`flex items-center px-4 py-3 border-l-4 mb-6 capitalize font-semibold ${statusColorClass}`}>
          {statusIcons[decision.affordability_status]}
          Verdict: {statusDisplay}
        </div>
        
        <div className="space-y-6">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-bold">Recommended Method</p>
            <p className="text-lg capitalize text-zinc-200">{decision.recommended_payment_method.replace('_', ' ')}</p>
          </div>
          
          {decision.payment_plan !== 'none' && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-bold">Payment Plan</p>
              <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-2">
                {decision.payment_plan.split('|').map((p, i) => {
                  const [date, amt] = p.split(':');
                  return (
                    <div key={i} className="flex justify-between border-b border-zinc-800 last:border-0 pb-2 last:pb-0">
                      <span className="text-zinc-400">{date}</span>
                      <span className="font-mono text-zinc-100">${parseFloat(amt).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-bold">Explanation</p>
            <p className="text-zinc-300 leading-relaxed text-sm">
              {decision.decision_explanation}
            </p>
          </div>
          
          {decision.spending_changes_needed !== 'none' && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-bold">Spending Changes Needed</p>
              <ul className="list-disc pl-5 text-sm text-zinc-300 space-y-1">
                {decision.spending_changes_needed.split('|').map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-800">
            <button 
              onClick={() => setShowWhy(!showWhy)}
              className="flex items-center justify-between w-full text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span>View Data Evidence</span>
              {showWhy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showWhy && (
              <div className="mt-4 bg-zinc-900 p-4 border border-zinc-800 text-xs text-zinc-400 space-y-3 font-mono">
                <div>
                  <span className="text-zinc-500 block">Amount Safe to Pay Today:</span>
                  <span className="text-zinc-200">${decision.amount_safe_to_pay.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Earliest Full Payment:</span>
                  <span className="text-zinc-200">{decision.earliest_date_for_full_payment}</span>
                </div>
                
                <div className="pt-2 border-t border-zinc-800">
                  <span className="text-zinc-500 block mb-2">Evidence Sources:</span>
                  <div className="flex gap-2">
                    <div className="w-16 h-16 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-center text-zinc-500">
                      Bank<br/>Ledger
                    </div>
                    <div className="w-16 h-16 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-center text-zinc-500">
                      Message<br/>History
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
}

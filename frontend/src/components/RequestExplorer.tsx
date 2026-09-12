import { useState } from 'react';
import { useStore } from '../store';
import { Search, Table2 } from 'lucide-react';

export default function RequestExplorer() {
  const { requests, selectRequest, searchTerm, setSearchTerm } = useStore();
  const [showTable, setShowTable] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredRequests = requests.filter(r => 
    r.request_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.request_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col items-end pointer-events-none">
      {/* Search & Controls */}
      <div className="flex gap-2 pointer-events-auto mb-4">
        {isExpanded ? (
          <div className="flex gap-2 bg-[#0a0b0f]/80 p-2 rounded-full border border-zinc-800 backdrop-blur-md">
            <div className="relative w-48 md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search landmarks..."
                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-zinc-500 text-zinc-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <button 
              onClick={() => { setIsExpanded(false); setSearchTerm(''); }}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
            >
              Close
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsExpanded(true)}
            className="p-3 bg-zinc-900/50 hover:bg-zinc-800 rounded-full transition-colors border border-zinc-700/50 backdrop-blur-md shadow-lg"
            aria-label="Search Landmarks"
          >
            <Search className="h-5 w-5 text-zinc-400" />
          </button>
        )}
        
        <button 
          onClick={() => setShowTable(!showTable)}
          className="p-3 bg-zinc-900/50 hover:bg-zinc-800 rounded-full transition-colors border border-zinc-700/50 backdrop-blur-md shadow-lg"
          aria-label="Toggle Data Table"
        >
          <Table2 className="h-5 w-5 text-zinc-400" />
        </button>
      </div>

      {/* Accessibility Fallback Table */}
      {showTable && (
        <div className="pointer-events-auto bg-[#0a0b0f] w-full max-w-4xl border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800">
                  <th className="p-4 text-sm font-medium text-zinc-400">ID</th>
                  <th className="p-4 text-sm font-medium text-zinc-400">Date</th>
                  <th className="p-4 text-sm font-medium text-zinc-400">Type</th>
                  <th className="p-4 text-sm font-medium text-zinc-400">Amount</th>
                  <th className="p-4 text-sm font-medium text-zinc-400">Status</th>
                  <th className="p-4 text-sm font-medium text-zinc-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(req => (
                  <tr key={req.request_id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4 font-mono text-sm">{req.request_id}</td>
                    <td className="p-4 font-mono text-sm text-zinc-400">{req.request_date}</td>
                    <td className="p-4 text-sm capitalize">{req.request_type}</td>
                    <td className="p-4 font-mono text-sm">${req.requested_amount.toFixed(2)}</td>
                    <td className="p-4 text-sm">
                      {req.decision?.affordability_status || 'Pending'}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => selectRequest(req)}
                        className="text-teal-400 hover:text-teal-300 text-sm font-medium"
                      >
                        View in River →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

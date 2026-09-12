import React from 'react';
import type { MockRequest } from '../../data/mockRequests';
import { STATUS_META, fmtAmount } from '../../data/mockRequests';

interface RequestQueueProps {
  requests: MockRequest[];
  totalCount: number;
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function RequestQueue({
  requests,
  totalCount,
  currentFilter,
  onFilterChange,
  selectedId,
  onSelect
}: RequestQueueProps) {
  
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'affordable_now', label: 'Now' },
    { id: 'affordable_with_plan', label: 'Plan' },
    { id: 'affordable_later', label: 'Later' },
    { id: 'not_affordable', label: 'Denied' },
  ];

  return (
    <div className="queue">
      <div className="queue-head">
        <div className="eyebrow">REQUEST QUEUE</div>
        <h2 id="queue-count">{requests.length} of {totalCount} evaluations</h2>
      </div>
      <div className="filter-row" id="filter-row">
        {filters.map(f => (
          <div 
            key={f.id}
            className={`pill ${currentFilter === f.id ? 'active' : ''}`}
            onClick={() => onFilterChange(f.id)}
          >
            {f.label}
          </div>
        ))}
      </div>
      <div className="queue-list" id="queue-list">
        {requests.map(r => {
          const m = STATUS_META[r.status] || { color: '#7c8aa8', bg: 'transparent', border: '#7c8aa8', label: r.status };
          const isSelected = r.id === selectedId;
          
          return (
            <div 
              key={r.id}
              className={`qcard ${isSelected ? 'selected' : ''}`} 
              style={{ '--bar-color': m.color } as React.CSSProperties}
              onClick={() => onSelect(r.id)}
            >
              <div className="qcard-top">
                <span className="qcard-id">{r.id.toUpperCase()}</span>
                <span className="qcard-amount">{fmtAmount(r.requested_amount, r.currency)}</span>
              </div>
              <div className="qcard-text">{r.text}</div>
              <div className="qcard-bottom">
                <span className="status-chip" style={{ '--chip-color': m.color, '--chip-bg': m.bg, '--chip-border': m.border } as React.CSSProperties}>
                  {m.label}
                </span>
                <span className="qcard-user">{r.user}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

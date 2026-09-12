
import type { MockRequest } from '../../data/mockRequests';
import { STATUS_META } from '../../data/mockRequests';

interface KpiStripProps {
  requests: MockRequest[];
}

export default function KpiStrip({ requests }: KpiStripProps) {
  const counts = { affordable_now: 0, affordable_with_plan: 0, affordable_later: 0, not_affordable: 0 };
  
  requests.forEach(r => {
    if (counts[r.status as keyof typeof counts] !== undefined) {
      counts[r.status as keyof typeof counts]++;
    }
  });

  const avgRatio = requests.length > 0
    ? Math.round((requests.reduce((acc, r) => acc + (r.amount_safe_to_pay / r.requested_amount), 0) / requests.length) * 100)
    : 0;

  const items = [
    { label: 'TOTAL REQUESTS', value: requests.length, small: '' },
    { label: 'AFFORDABLE NOW', value: counts.affordable_now, small: '', color: STATUS_META.affordable_now.color },
    { label: 'WITH PLAN', value: counts.affordable_with_plan, small: '', color: STATUS_META.affordable_with_plan.color },
    { label: 'AFFORDABLE LATER', value: counts.affordable_later, small: '', color: STATUS_META.affordable_later.color },
    { label: 'NOT AFFORDABLE', value: counts.not_affordable, small: '', color: STATUS_META.not_affordable.color },
    { label: 'AVG SAFE-TO-PAY RATIO', value: avgRatio, small: '%' }
  ];

  return (
    <div className="kpis" id="kpi-strip">
      {items.map((k, i) => (
        <div className="kpi" key={i}>
          <div className="label">{k.label}</div>
          <div className="value" style={k.color ? { color: k.color } : {}}>
            {k.value}<small>{k.small}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

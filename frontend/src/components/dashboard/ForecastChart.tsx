import React, { useMemo } from 'react';
import type { MockRequest } from '../../data/mockRequests';
import { STATUS_META } from '../../data/mockRequests';

interface ForecastChartProps {
  request: MockRequest | undefined;
}

function seededSeries(seed: number) {
  let s = seed;
  return function() { 
    s = (s * 9301 + 49297) % 233280; 
    return s / 233280; 
  };
}

function buildForecast(r: MockRequest) {
  const days = 90;
  const rand = seededSeries(r.id.charCodeAt(3) * 17 + r.requested_amount);
  let bal = r.balance;
  const series = [bal];
  
  const hasPlan = r.method === 'partial_payment' || r.method === 'installments';
  
  for (let d = 1; d <= days; d++) {
    let delta = 15 * (rand() * 0.6 + 0.7); // standard slow income drift
    if (d % 30 === 0) delta += 3200; // Salary
    if (d % 30 === 5) delta -= 1500; // Rent
    
    // Simulate plan drops
    if (hasPlan && (d === 1 || (r.method === 'installments' && (d === 31 || d === 61)))) {
       delta -= r.amount_safe_to_pay;
    } else if (r.method === 'full_payment' && d === 1) {
       delta -= r.requested_amount;
    }
    
    bal += delta;
    series.push(bal);
  }
  return series;
}

export default function ForecastChart({ request }: ForecastChartProps) {
  const { markers, dayLabels, areaPath, linePath, threshY, m } = useMemo(() => {
    if (!request) return { series: [], markers: null, dayLabels: null, areaPath: '', linePath: '', threshY: 0, m: STATUS_META.affordable_now };

    const s = buildForecast(request);
    const W = 900, H = 132, padTop = 10, padBot = 20, padL = 6, padR = 6;
    const min = Math.min(...s, request.minBalance);
    const max = Math.max(...s, request.balance + 4000);
    const range = (max - min) || 1;
    const x = (i: number) => padL + (i / (s.length - 1)) * (W - padL - padR);
    const y = (v: number) => padTop + (H - padTop - padBot) * (1 - (v - min) / range);

    const lPath = s.map((v, i) => (i === 0 ? 'M' : 'L') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
    const aPath = lPath + ` L ${x(s.length - 1).toFixed(1)} ${y(min).toFixed(1)} L ${x(0).toFixed(1)} ${y(min).toFixed(1)} Z`;
    const tY = y(request.minBalance);
    const meta = STATUS_META[request.status] || STATUS_META.affordable_now;

    const hasPlan = request.method === 'partial_payment' || request.method === 'installments';
    const planDays = hasPlan ? (request.method === 'installments' ? [1, 31, 61] : [1]) : (request.method === 'full_payment' ? [1] : []);

    const mrks = planDays.map((d, i) => {
        return (
          <React.Fragment key={i}>
            <line x1={x(d)} y1={padTop} x2={x(d)} y2={H - padBot} stroke={meta.color} strokeWidth="1" strokeDasharray="3 3" opacity="0.55" />
            <circle cx={x(d)} cy={y(s[d])} r="3.4" fill={meta.color} />
          </React.Fragment>
        );
    });

    const dLabels = [0, 30, 60, 90].map(d => (
      <text key={d} x={x(d)} y={H - 4} fill="#526078" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle">D{d}</text>
    ));

    return { series: s, markers: mrks, dayLabels: dLabels, areaPath: aPath, linePath: lPath, threshY: tY, m: meta };
  }, [request]);

  if (!request) return null;

  return (
    <div className="chart-panel">
      <div className="chart-head">
        <h4>Balance vs. minimum threshold</h4>
        <div className="sub" id="chart-sub">Today → +90d · {request.currency}</div>
      </div>
      <svg id="forecast-svg" viewBox="0 0 900 132" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={m.color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={m.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="6" y1={threshY} x2="894" y2={threshY} stroke="#f0576e" strokeWidth="1" strokeDasharray="5 4" opacity="0.6" />
        <text x="894" y={threshY - 4} fill="#f0576e" fontFamily="JetBrains Mono" fontSize="9" textAnchor="end">min balance</text>
        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={linePath} fill="none" stroke={m.color} strokeWidth="1.8" />
        {markers}
        {dayLabels}
      </svg>
    </div>
  );
}

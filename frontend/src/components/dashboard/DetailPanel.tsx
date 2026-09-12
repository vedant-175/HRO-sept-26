import React, { useState } from 'react';
import type { MockRequest } from '../../data/mockRequests';
import { STATUS_META, fmtAmount } from '../../data/mockRequests';

interface DetailPanelProps {
  request: MockRequest | undefined;
  analyzing?: boolean;
}

export default function DetailPanel({ request, analyzing = false }: DetailPanelProps) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  if (!request) return <div className="detail"><div className="detail-inner">Select a request</div></div>;

  if (analyzing) {
    return (
      <div className="detail">
        <div className="detail-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--text-muted)' }}>
          <div className="loading-spinner" style={{ width: '32px', height: '32px', border: '3px solid rgba(0,255,163,0.1)', borderTopColor: 'var(--neon-teal)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '1px' }}>AGENT ANALYZING...</div>
        </div>
      </div>
    );
  }

  const m = STATUS_META[request.status] || STATUS_META['not_affordable'];

  let planHtml;
  if (!request.payment_plan || request.payment_plan === 'none') {
    planHtml = <div className="no-plan">No payment scheduled — request is not currently safe to fund.</div>;
  } else {
    const steps = request.payment_plan.split('|');
    planHtml = (
      <div className="timeline">
        {steps.map((step, idx) => {
          const [date, amountStr] = step.split(':');
          const amt = parseFloat(amountStr || '0');
          return (
            <div className="tl-step" key={idx}>
              <div className="tl-line"></div>
              <div className="tl-dot" style={{ borderColor: m.color }}></div>
              <div className="tl-content">
                <span className="tl-date">{date}</span>
                <span className="tl-amount">{fmtAmount(amt, request.currency)}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  let changesHtml;
  if (!request.spending_changes_needed || request.spending_changes_needed === 'none') {
    changesHtml = <span className="change-chip none">none required</span>;
  } else {
    const changes = request.spending_changes_needed.split('|');
    changesHtml = (
      <>
        {changes.map((change, idx) => {
           let text = change;
           if (change.startsWith('stop:')) text = 'Stop ' + change.split(':')[1];
           if (change.startsWith('reduce_to:')) text = 'Reduce ' + change.split(':')[1] + ' to ' + fmtAmount(parseFloat(change.split(':')[2]), request.currency);
           return <span className="change-chip" key={idx}>{text}</span>;
        })}
      </>
    );
  }

  const earliestDateText = request.earliest_date_for_full_payment || (request.status === 'affordable_now' ? '2026-09-12' : '— beyond 90-day forecast');

// Changes HTML logic was moved up

  const explanationText = request.explanation || `Balance of ${fmtAmount(request.balance, request.currency)} with a ${fmtAmount(request.minBalance, request.currency)} minimum leaves ${fmtAmount(request.balance - request.minBalance, request.currency)} of headroom on 2026-09-12. Confirmed salary of ${fmtAmount(3200, request.currency)} lands on 2026-09-25, well before any dip below threshold. ${request.method.replace(/_/g, ' ')} is the safest eligible option.`;

  return (
    <div className="detail">
      <div className="detail-inner" id="detail-inner">
        <div className="eyebrow">{request.id.toUpperCase()} · {request.user} · purchase</div>
        <h2 style={{ marginTop: '5px' }}>{request.text}</h2>

        <div className="verdict-banner" style={{ '--v-color': m.color, '--v-bg': m.bg, '--v-border': m.border } as React.CSSProperties}>
          <span className="vdot"></span>Verdict: {m.label}
        </div>

        <div className="stat-row">
          <div className="stat-box"><div className="label">REQUESTED</div><div className="value">{fmtAmount(request.requested_amount, request.currency)}</div></div>
          <div className="stat-box"><div className="label">SAFE TO PAY TODAY</div><div className="value" style={{ color: m.color }}>{fmtAmount(request.amount_safe_to_pay, request.currency)}</div></div>
        </div>

        <div className="section">
          <div className="label">RECOMMENDED METHOD</div>
          <div className="method">{(request.method || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
        </div>

        <div className="section">
          <div className="label">PAYMENT PLAN</div>
          {planHtml}
        </div>

        <div className="section">
          <div className="label">EARLIEST DATE FOR FULL PAYMENT</div>
          <div className="method" style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
            {earliestDateText}
          </div>
        </div>

        <div className="section">
          <div className="label">SPENDING CHANGES NEEDED</div>
          <div className="chip-row">{changesHtml}</div>
        </div>

        <div className="section">
          <div className="label">DECISION EXPLANATION</div>
          <div className="explanation">
            {explanationText}
          </div>
        </div>

        <div 
          className={`evidence-toggle ${evidenceOpen ? 'open' : ''}`} 
          onClick={() => setEvidenceOpen(!evidenceOpen)}
        >
          <span>View data evidence</span>
          <svg className="chev" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        
        <div className={`evidence-body ${evidenceOpen ? 'open' : ''}`}>
          <div className="ev-block">
            <div className="label">FINANCIAL PROFILE</div>
            <div className="ev-row"><span>Available balance</span><span>{fmtAmount(request.balance, request.currency)}</span></div>
            <div className="ev-row"><span>Minimum balance to keep</span><span>{fmtAmount(request.minBalance, request.currency)}</span></div>
            <div className="ev-row"><span>Home currency</span><span>{request.currency}</span></div>
          </div>
          <div className="ev-block">
            <div className="label">FINANCIAL EVENTS USED</div>
            <div className="ev-row"><span>Salary Deposit <em style={{ opacity: 0.6 }}>(ev_1)</em></span><span>+{fmtAmount(3200, request.currency)}</span></div>
            <div className="ev-row"><span>Rent Payment <em style={{ opacity: 0.6 }}>(ev_2)</em></span><span>-{fmtAmount(1500, request.currency)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

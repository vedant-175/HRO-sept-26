
import ThreeCanvas from './ThreeCanvas';
import type { ThreeCanvasRef } from './ThreeCanvas';
import ForecastChart from './ForecastChart';
import type { MockRequest } from '../../data/mockRequests';
import { fmtAmount } from '../../data/mockRequests';

interface CenterSceneProps {
  request: MockRequest | undefined;
  threeRef?: React.RefObject<ThreeCanvasRef | null>;
}

export default function CenterScene({ request, threeRef }: CenterSceneProps) {
  return (
    <div className="center-panel scene">
      <div className="scene-label">
        <div className="eyebrow">90-DAY CAPACITY FORECAST</div>
        <h3>{request ? `${request.id.toUpperCase()} — ${request.user}` : '--'}</h3>
      </div>
      
      <div className="scene-legend">
        <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--teal)' }}></div>Confirmed income</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--rose)' }}></div>Committed expense</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--blue)' }}></div>Balance capacity</div>
        <div className="legend-item" style={{ marginTop: '4px' }}>
          <div style={{ color: 'var(--muted)', fontSize: '12px' }}>Current Balance: <span style={{ color: 'var(--text)', fontWeight: 500 }}>{request ? fmtAmount(request.balance, request.currency) : '--'}</span></div>
        </div>
      </div>
      
      <ThreeCanvas request={request} ref={threeRef} />

      <ForecastChart request={request} />
    </div>
  );
}

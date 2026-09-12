

interface TopBarProps {
  onSearch: (term: string) => void;
  onResetCamera: () => void;
}

export default function TopBar({ onSearch, onResetCamera }: TopBarProps) {
  return (
    <div className="topbar">
      <div className="brand">
        <h1>BuyWait <span>AI</span></h1>
        <div className="status-pill"><span className="status-dot"></span>NEXUS ONLINE</div>
      </div>
      <div className="topbar-right">
        <div className="search-box">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c8aa8" strokeWidth="2">
            <circle cx="11" cy="11" r="7"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search request or user…" 
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <button className="reset-btn" onClick={onResetCamera}>Reset Camera</button>
        <div className="icon-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

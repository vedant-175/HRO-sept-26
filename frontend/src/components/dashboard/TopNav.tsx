

interface TopNavProps {
  onSearch: (q: string) => void;
  onResetCamera: () => void;
}

export default function TopNav({ onSearch, onResetCamera }: TopNavProps) {
  return (
    <div className="topbar">
      <div className="brand">
        <h1>BuyWait <span>AI</span></h1>
        <div className="status-pill">
          <div className="status-dot"></div>
          NEXUS ONLINE
        </div>
      </div>
      <div className="topbar-right">
        <div className="search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search request or user…" 
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <button className="reset-btn" onClick={onResetCamera}>Reset Camera</button>
        <button className="icon-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>
      </div>
    </div>
  );
}

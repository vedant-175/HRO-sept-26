import React, { useState, useMemo, useRef, useEffect } from 'react';
import { fetchMockRequests } from '../data/mockRequests';
import type { MockRequest } from '../data/mockRequests';
import './Dashboard.css';

import TopNav from '../components/dashboard/TopNav';
import RequestQueue from '../components/dashboard/RequestQueue';
import CenterScene from '../components/dashboard/CenterScene';
import KpiStrip from '../components/dashboard/KpiStrip';
import DetailPanel from '../components/dashboard/DetailPanel';
import type { ThreeCanvasRef } from '../components/dashboard/ThreeCanvas';

export default function Dashboard() {
  const [requests, setRequests] = useState<MockRequest[]>([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string>('req26'); // Matches the first row request_26 -> req26
  const [searchQuery, setSearchQuery] = useState('');
  
  const threeRef = useRef<ThreeCanvasRef>(null);

  useEffect(() => {
    fetchMockRequests().then(data => {
      setRequests(data);
      if (data.length > 0) {
        setSelectedId(data[0].id);
      }
    });
  }, []);
  

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchFilter = currentFilter === 'all' || r.status === currentFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = q === '' || 
                          r.id.toLowerCase().includes(q) || 
                          r.user.toLowerCase().includes(q) || 
                          r.text.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [requests, currentFilter, searchQuery]);

  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!selectedId || requests.length === 0) return;
    const req = requests.find(r => r.id === selectedId);
    if (req && !req.analyzed && !analyzing) {
       setAnalyzing(true);
       fetch(`http://localhost:8000/requests/${req.id.replace('req', 'request_')}/decision`)
         .then(res => res.json())
         .then(data => {
            if (data && data.decision) {
               setRequests(prev => prev.map(r => 
                 r.id === selectedId 
                   ? { ...r, 
                       analyzed: true, 
                       status: data.decision.affordability_status,
                       method: data.decision.recommended_payment_method,
                       amount_safe_to_pay: data.decision.amount_safe_to_pay,
                       explanation: data.decision.decision_explanation,
                       payment_plan: data.decision.payment_plan,
                       earliest_date_for_full_payment: data.decision.earliest_date_for_full_payment,
                       spending_changes_needed: data.decision.spending_changes_needed
                     } 
                   : r
               ));
            }
         })
         .catch(err => console.error("LLM fetch error:", err))
         .finally(() => setAnalyzing(false));
    }
  }, [selectedId, requests]);

  const selectedRequest = requests.find(r => r.id === selectedId);

  return (
    <div className="dashboard-app">
      <TopNav 
        onSearch={setSearchQuery} 
        onResetCamera={() => threeRef.current?.resetCamera()} 
      />
      
      <RequestQueue 
        requests={filteredRequests}
        totalCount={requests.length}
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      
      <CenterScene 
        request={selectedRequest} 
        threeRef={threeRef}
      />
      
      <KpiStrip 
        requests={requests} 
      />
      
      <DetailPanel 
        request={selectedRequest}
        analyzing={analyzing} 
      />
    </div>
  );
}

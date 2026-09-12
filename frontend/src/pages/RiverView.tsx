import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../store';
import RequestExplorer from '../components/RequestExplorer';
import DecisionRoom from '../components/DecisionRoom';
import CashFlowRiver from '../components/3d/CashFlowRiver';
import { Loader2 } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';

const API_URL = 'http://localhost:8000';

// We default to the first user found for demo purposes, or we could pass user_id via URL.
const DEFAULT_USER_ID = 'u1';

function RiverView() {
  const { setData, viewMode, selectRequest } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch ledger and requests for the default user
    axios.get(`${API_URL}/users/${DEFAULT_USER_ID}/ledger`)
      .then(res => {
        const data = res.data;
        setData(data.requests, data.ledger, data.one_time_expenses, data.minimum_balance_to_keep);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching user river data:", err);
        setLoading(false);
      });
  }, [setData]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0b0f] text-zinc-100 font-sans">
      {/* Background 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [30, 25, 30], rotation: [-Math.PI/6, Math.PI/4, 0], fov: 45 }}>
          <color attach="background" args={['#0a0b0f']} />
          <React.Suspense fallback={null}>
            <Environment preset="city" />
            <CashFlowRiver />
          </React.Suspense>
        </Canvas>
      </div>
      
      {/* Foreground UI Overlay */}
      <div className="relative z-10 w-full h-full pointer-events-none p-4 md:p-8 flex flex-col h-screen">
        <div className="flex justify-between items-start pointer-events-auto">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
            Buy or Wait?
          </h1>
          {viewMode === 'water-level' && (
            <button 
              onClick={() => selectRequest(null)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg transition-colors border border-white/10"
            >
              Back to Explorer
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center pointer-events-auto">
            <Loader2 className="w-12 h-12 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="flex-1 w-full flex mt-8">
            {viewMode === 'top-down' ? (
              <div className="w-full pointer-events-auto">
                <RequestExplorer />
              </div>
            ) : (
              <div className="w-full md:w-[400px] pointer-events-auto">
                <DecisionRoom />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RiverView;

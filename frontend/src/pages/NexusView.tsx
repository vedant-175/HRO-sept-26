import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../store';
import RequestExplorer from '../components/RequestExplorer';
import DecisionRoom from '../components/DecisionRoom';
import DataNexus from '../components/3d/DataNexus';
import { Loader2 } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';

const API_URL = 'http://localhost:8000';
const DEFAULT_USER_ID = 'u1';

export default function NexusView() {
  const { setData, viewMode, selectRequest, selectedRequest } = useStore();
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
        console.error("Error fetching user data:", err);
        setLoading(false);
      });
  }, [setData]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050b14] text-zinc-100 font-sans">
      {/* Background 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [40, 20, 40], fov: 50 }}>
          <color attach="background" args={['#050b14']} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <React.Suspense fallback={null}>
            <Environment preset="city" />
            <DataNexus />
          </React.Suspense>
        </Canvas>
      </div>
      
      {/* Foreground UI Overlay */}
      <div className="relative z-10 w-full h-full pointer-events-none p-4 md:p-8 flex flex-col h-screen">
        <div className="flex justify-between items-start pointer-events-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-xs font-mono text-blue-400">NEXUS ONLINE</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white drop-shadow-md">
              BuyWait <span className="text-blue-500">AI</span>
            </h1>
          </div>
          
          {selectedRequest && (
            <button 
              onClick={() => selectRequest(null)}
              className="px-4 py-2 bg-[#0a0b0f]/80 hover:bg-zinc-800 backdrop-blur-md rounded-lg transition-colors border border-zinc-700 shadow-xl"
            >
              Reset Camera
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center pointer-events-auto">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="flex-1 w-full flex mt-8">
            {!selectedRequest ? (
              <div className="w-full pointer-events-auto">
                <RequestExplorer />
              </div>
            ) : (
              <div className="w-full md:w-[450px] pointer-events-auto ml-auto">
                <DecisionRoom />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

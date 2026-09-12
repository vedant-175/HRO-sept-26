import { useMemo, useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useStore } from '../../store';
import * as THREE from 'three';
import { Text, Billboard } from '@react-three/drei';
import gsap from 'gsap';

const Y_SCALE = 0.005;
const Z_SCALE = 2.0;
const RIVER_WIDTH = 20;

export default function CashFlowRiver() {
  const { ledger, minBalance, requests, expenses, selectedRequest, viewMode, searchTerm } = useStore();
  const { camera } = useThree();
  
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Calculate vertex heights
  const geometry = useMemo(() => {
    if (!ledger || ledger.length === 0) return new THREE.PlaneGeometry(RIVER_WIDTH, 90 * Z_SCALE, 10, 89);
    
    const geo = new THREE.PlaneGeometry(RIVER_WIDTH, ledger.length * Z_SCALE, 10, ledger.length - 1);
    const pos = geo.attributes.position;
    
    // We also want vertex colors based on height
    const colors = new Float32Array(pos.count * 3);
    const colorTeal = new THREE.Color('#2dd4bf');
    const colorAmber = new THREE.Color('#fbbf24');
    const colorRed = new THREE.Color('#ef4444');
    
    for (let i = 0; i < pos.count; i++) {
      const zIndex = Math.floor(i / 11); // 11 vertices across width
      // PlaneGeometry is centered by default. We'll shift it so z starts at 0.
      const yVal = ledger[zIndex] ? ledger[zIndex].balance * Y_SCALE : 0;
      pos.setY(i, yVal);
      
      const safetyMargin = ledger[zIndex] ? (ledger[zIndex].balance - minBalance) : 0;
      let c = colorTeal;
      if (safetyMargin < 0) {
        c = colorRed;
      } else if (safetyMargin < minBalance * 0.2) {
        c = colorAmber;
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    
    // Shift geometry so it starts at z=0 and goes backwards (negative Z)
    geo.translate(0, 0, -(ledger.length * Z_SCALE) / 2);
    
    return geo;
  }, [ledger, minBalance]);

  // Handle GSAP Camera animations based on viewMode & selectedRequest
  useEffect(() => {
    if (viewMode === 'top-down') {
      gsap.to(camera.position, {
        x: 0,
        y: 100,
        z: 0,
        duration: 2.5,
        ease: 'power2.out'
      });
      gsap.to(camera.rotation, {
        x: -Math.PI / 2,
        y: 0,
        z: 0,
        duration: 2.5,
        ease: 'power2.out'
      });
    } else if (viewMode === 'water-level' && selectedRequest) {
      // Find the z-position of this request
      const reqDate = new Date(selectedRequest.request_date);
      const startDate = new Date(ledger[0]?.date || reqDate);
      const diffTime = reqDate.getTime() - startDate.getTime();
      const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
      const zPos = -diffDays * Z_SCALE;
      const yPos = (ledger[diffDays]?.balance || 0) * Y_SCALE;
      
      gsap.to(camera.position, {
        x: 10, // slightly offset to the side
        y: yPos + 5, // just above the water
        z: zPos + 10,
        duration: 1.5,
        ease: 'power3.inOut'
      });
      gsap.to(camera.rotation, {
        x: -Math.PI / 8, // slight look down
        y: Math.PI / 8,  // slight look left
        z: 0,
        duration: 1.5,
        ease: 'power3.inOut'
      });
    }
  }, [viewMode, selectedRequest, ledger, camera]);

  useFrame(({ clock }) => {
    if (!meshRef.current || !ledger || ledger.length === 0) return;
    const pos = meshRef.current.geometry.attributes.position;
    const time = clock.elapsedTime;
    
    for (let i = 0; i < pos.count; i++) {
      const zIndex = Math.floor(i / 11);
      const xIndex = i % 11;
      
      const baseHeight = ledger[zIndex] ? ledger[zIndex].balance * Y_SCALE : 0;
      const wave = Math.sin(time * 2 + zIndex * 0.5 + xIndex * 0.5) * 0.05;
      
      pos.setY(i, baseHeight + wave);
    }
    pos.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  const rocksData = useMemo(() => {
    if (!ledger || ledger.length === 0) return [];
    const minB = minBalance * Y_SCALE;
    const startDate = new Date(ledger[0].date);
    
    return expenses.map((exp, i) => {
      const expDate = new Date(exp.date);
      const diffTime = expDate.getTime() - startDate.getTime();
      const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
      if (diffDays >= ledger.length) return null;
      
      const zPos = -diffDays * Z_SCALE;
      const size = Math.log10(exp.amount + 1) * 0.5; // Log scaling
      const xOffset = -RIVER_WIDTH/3 + Math.random()*2;
      return { id: `exp-${i}`, size, xOffset, yPos: minB, zPos };
    }).filter((r) => r !== null) as { id: string, size: number, xOffset: number, yPos: number, zPos: number }[];
  }, [expenses, ledger, minBalance]);

  if (!ledger || ledger.length === 0) return null;

  const minB = minBalance * Y_SCALE;

  return (
    <group>
      {/* Lights */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 50, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-10, 20, -10]} intensity={0.5} color="#4a6fa5" />

      {/* The River */}
      <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
        <meshPhysicalMaterial 
          vertexColors 
          roughness={0.2}
          transmission={0.4}
          thickness={1.5}
          clearcoat={0.6}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Riverbed (Min Balance Plane) */}
      <mesh position={[0, minB - 0.1, -(ledger.length * Z_SCALE) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[RIVER_WIDTH + 10, ledger.length * Z_SCALE]} />
        <meshPhysicalMaterial color="#3f3f46" roughness={0.8} />
      </mesh>
      
      {/* Rocks (Expenses) */}
      {rocksData.map((rock) => (
        <mesh key={rock.id} position={[rock.xOffset, rock.yPos + rock.size/2, rock.zPos]} castShadow>
          <dodecahedronGeometry args={[rock.size]} />
          <meshPhysicalMaterial color="#52525b" roughness={0.9} />
        </mesh>
      ))}
      
      {/* Bridges (Payment Plans) */}
      {requests.map((req, i) => {
        if (!req.decision || req.decision.payment_plan === 'none') return null;
        
        const pmts = req.decision.payment_plan.split('|');
        return pmts.map((p, j) => {
          const [d, a] = p.split(':');
          const pDate = new Date(d);
          const startDate = new Date(ledger[0].date);
          const diffTime = pDate.getTime() - startDate.getTime();
          const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
          if (diffDays >= ledger.length) return null;
          
          const zPos = -diffDays * Z_SCALE;
          const yPos = (ledger[diffDays]?.balance || 0) * Y_SCALE + 2; // Above water
          
          return (
            <group key={`bridge-${i}-${j}`} position={[0, yPos, zPos]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[RIVER_WIDTH + 2, 0.5, 2]} />
                <meshPhysicalMaterial color="#d4d4d8" roughness={0.7} />
              </mesh>
              <Billboard position={[0, 0.5, 1.01]}>
                <Text 
                  fontSize={0.8}
                  color="#000"
                  anchorX="center"
                  anchorY="bottom"
                >
                  ${parseFloat(a).toFixed(2)}
                </Text>
              </Billboard>
            </group>
          )
        })
      })}
      
      {/* Flags (Earliest full payment dates) */}
      {requests.map((req, i) => {
        if (!req.decision || req.decision.earliest_date_for_full_payment === 'none') return null;
        const eDate = new Date(req.decision.earliest_date_for_full_payment);
        const startDate = new Date(ledger[0].date);
        const diffTime = eDate.getTime() - startDate.getTime();
        const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
        if (diffDays >= ledger.length) return null;
        
        const zPos = -diffDays * Z_SCALE;
        const yPos = minB + 2;
        
        return (
          <group key={`flag-${i}`} position={[RIVER_WIDTH/2 + 2, yPos, zPos]}>
            {/* Pole */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 4]} />
              <meshPhysicalMaterial color="#a1a1aa" />
            </mesh>
            {/* Flag cloth */}
            <mesh position={[-1, 1.5, 0]}>
              <planeGeometry args={[2, 1]} />
              <meshPhysicalMaterial color="#f43f5e" side={THREE.DoubleSide} />
            </mesh>
            <Billboard position={[0, 2.5, 0]}>
              <Text fontSize={0.6} color="#fff">
                Req: {req.request_id}
              </Text>
            </Billboard>
          </group>
        )
      })}

      {/* Requests Landmarks for Top-Down view */}
      {requests.map((req, i) => {
        const reqDate = new Date(req.request_date);
        const startDate = new Date(ledger[0].date);
        const diffTime = reqDate.getTime() - startDate.getTime();
        const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
        const zPos = -diffDays * Z_SCALE;
        
        const matchesSearch = searchTerm === '' || 
          req.request_text.toLowerCase().includes(searchTerm.toLowerCase()) || 
          req.request_type.toLowerCase().includes(searchTerm.toLowerCase());
        
        const isSelected = selectedRequest?.request_id === req.request_id;
        
        let op = 1;
        if (viewMode === 'water-level' && !isSelected) op = 0.2;
        if (!matchesSearch) op = 0.1;
        
        return (
          <group 
            key={`lm-${i}`} 
            position={[0, 10, zPos]} 
            onClick={(e) => { e.stopPropagation(); useStore.getState().selectRequest(req); }}
            visible={viewMode === 'top-down'}
          >
            <mesh>
              <sphereGeometry args={[1]} />
              <meshPhysicalMaterial color={isSelected ? '#3b82f6' : '#fff'} transparent opacity={op} />
            </mesh>
            <Text position={[0, 2, 0]} fontSize={1.5} color="#fff" anchorX="center" anchorY="bottom">
              {req.request_id} - ${req.requested_amount}
            </Text>
          </group>
        )
      })}
    </group>
  );
}

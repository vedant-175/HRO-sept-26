import React, { useMemo, useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useStore } from '../../store';
import * as THREE from 'three';
import { Line, Sphere, Text, Float, Sparkles, Ring } from '@react-three/drei';
import gsap from 'gsap';

export default function DataNexus() {
  const { ledger, requests, selectedRequest, viewMode, searchTerm } = useStore();
  const { camera } = useThree();
  const coreRef = useRef<THREE.Mesh>(null);
  
  // Calculate node positions deterministically using Fibonacci sphere scaled by time
  const nodes = useMemo(() => {
    if (!requests || requests.length === 0) return [];
    
    const startDate = ledger.length > 0 ? new Date(ledger[0].date) : new Date();
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
    
    return requests.map((req, i) => {
      // 1. Calculate time distance
      const reqDate = new Date(req.request_date);
      const diffTime = reqDate.getTime() - startDate.getTime();
      const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
      const dist = 6 + (diffDays * 0.15); // Pulled much closer to core
      
      // 2. Calculate spherical distribution
      const y = 1 - (i / (requests.length - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      
      const position = new THREE.Vector3(x * dist, y * dist, z * dist);
      
      // 3. Determine properties
      const size = Math.max(0.4, Math.log10(req.requested_amount + 1) * 0.6);
      
      let color = '#3b82f6'; // default blue
      if (req.decision) {
        if (req.decision.affordability_status.includes('yes_full')) color = '#00ffcc';
        else if (req.decision.affordability_status.includes('yes_partial')) color = '#2dd4bf';
        else if (req.decision.affordability_status.includes('wait_full')) color = '#fbbf24';
        else if (req.decision.affordability_status.includes('wait_partial')) color = '#f97316';
        else if (req.decision.affordability_status.includes('no')) color = '#ef4444';
      }
      
      return {
        req,
        position,
        size,
        color
      };
    });
  }, [requests, ledger]);

  // Core pulse animation
  useFrame(({ clock }) => {
    if (coreRef.current) {
      const scale = 1 + Math.sin(clock.elapsedTime * 2) * 0.02;
      coreRef.current.scale.set(scale, scale, scale);
      coreRef.current.rotation.y = clock.elapsedTime * 0.1;
    }
  });

  // Handle GSAP Camera animations based on viewMode & selectedRequest
  useEffect(() => {
    if (!selectedRequest) {
      // Default orbit view
      gsap.to(camera.position, {
        x: 40,
        y: 20,
        z: 40,
        duration: 2.5,
        ease: 'power3.inOut'
      });
      // Need a dummy object to look at the center smoothly
      const dummy = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
      gsap.to(dummy, {
        x: 0, y: 0, z: 0,
        duration: 2.5,
        ease: 'power3.inOut',
        onUpdate: () => camera.lookAt(0, 0, 0)
      });
    } else {
      // Fly to focused node
      const node = nodes.find(n => n.req.request_id === selectedRequest.request_id);
      if (node) {
        // Position camera slightly offset from the node to view it clearly
        const offset = node.position.clone().normalize().multiplyScalar(5); 
        const camPos = node.position.clone().add(offset);
        
        // Elevate camera slightly
        camPos.y += 2;
        
        gsap.to(camera.position, {
          x: camPos.x,
          y: camPos.y,
          z: camPos.z,
          duration: 1.5,
          ease: 'power3.inOut'
        });
        
        gsap.to(camera.rotation, {
          x: 0, y: 0, z: 0, // Reset rotation first? Actually looking at the node is better
        });
        
        // Smoothly look at the node
        const dummy = { t: 0 };
        const startRot = camera.rotation.clone();
        camera.lookAt(node.position);
        const endRot = camera.rotation.clone();
        camera.rotation.copy(startRot);
        
        gsap.to(dummy, {
          t: 1,
          duration: 1.5,
          ease: 'power3.inOut',
          onUpdate: () => {
            // Using GSAP to interpolate lookAt requires interpolating quaternions, 
            // but for simplicity we'll just force a lookAt during the flight
            camera.lookAt(node.position);
          }
        });
      }
    }
  }, [selectedRequest, camera, nodes]);

  // Total balance text for the core
  const currentBalance = ledger.length > 0 ? ledger[0].balance : 0;

  return (
    <group>
      {/* Deep Space / Neon City Lighting */}
      <ambientLight intensity={0.2} color="#0052ff" />
      <pointLight position={[0, 0, 0]} intensity={2} color="#00d2ff" distance={50} />
      <directionalLight position={[20, 30, 20]} intensity={1} color="#ffffff" castShadow shadow-mapSize={[2048, 2048]} />

      {/* Central Core: Total Capital */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={coreRef} castShadow>
          <sphereGeometry args={[4, 64, 64]} />
          <meshPhysicalMaterial 
            color="#00d2ff" 
            emissive="#0052ff" 
            emissiveIntensity={0.5}
            roughness={0.1}
            metalness={0.8}
            clearcoat={1}
            clearcoatRoughness={0.1}
            wireframe={true}
          />
        </mesh>
        {/* Inner solid core */}
        <mesh>
          <sphereGeometry args={[3.8, 32, 32]} />
          <meshBasicMaterial color="#051424" />
        </mesh>
        <Text position={[0, 0, 4.5]} fontSize={1} color="#ffffff" anchorX="center" anchorY="middle">
          ${currentBalance.toLocaleString()}
        </Text>
      </Float>

      {/* Volumetric Data Particles to fill space */}
      <Sparkles count={500} scale={40} size={2} speed={0.4} opacity={0.5} color="#00d2ff" />

      {/* Time Horizon Rings */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {[30, 60, 90].map((days, i) => {
          const r = 6 + (days * 0.15);
          return (
            <group key={`ring-${days}`}>
              <Ring args={[r - 0.05, r + 0.05, 64]} material-color="#0052ff" material-transparent material-opacity={0.2} />
              <Text position={[0, r, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.8} color="#0052ff" anchorX="center" anchorY="bottom">
                {days} Days
              </Text>
            </group>
          );
        })}
      </group>

      {/* Nodes and Energy Tethers */}
      {nodes.map((node, i) => {
        const isSelected = selectedRequest?.request_id === node.req.request_id;
        
        // Search filter opacity
        const matchesSearch = searchTerm === '' || 
          node.req.request_text.toLowerCase().includes(searchTerm.toLowerCase()) || 
          node.req.request_type.toLowerCase().includes(searchTerm.toLowerCase());
          
        let nodeOpacity = 1;
        if (selectedRequest && !isSelected) nodeOpacity = 0.1;
        if (!matchesSearch) nodeOpacity = 0.05;

        return (
          <group key={node.req.request_id}>
            {/* Tether */}
            <Line 
              points={[[0,0,0], [node.position.x, node.position.y, node.position.z]]} 
              color={node.color} 
              opacity={nodeOpacity * 0.3} 
              transparent 
              lineWidth={isSelected ? 3 : 1}
            />
            
            {/* Node Mesh */}
            <Float speed={3} rotationIntensity={1} floatIntensity={1}>
              <mesh 
                position={[node.position.x, node.position.y, node.position.z]}
                onClick={(e) => {
                  e.stopPropagation();
                  useStore.getState().selectRequest(node.req);
                }}
                castShadow
              >
                <sphereGeometry args={[node.size, 32, 32]} />
                <meshPhysicalMaterial 
                  color={node.color}
                  emissive={node.color}
                  emissiveIntensity={isSelected ? 1 : 0.5}
                  roughness={0.2}
                  metalness={0.8}
                  transparent
                  opacity={nodeOpacity}
                  clearcoat={0.8}
                />
              </mesh>
              
              {/* Floating ID Label */}
              <Text 
                position={[node.position.x, node.position.y + node.size + 0.5, node.position.z]} 
                fontSize={0.6} 
                color="#ffffff" 
                anchorX="center" 
                anchorY="bottom"
                fillOpacity={nodeOpacity}
              >
                {node.req.request_id}
              </Text>
            </Float>
          </group>
        );
      })}
    </group>
  );
}

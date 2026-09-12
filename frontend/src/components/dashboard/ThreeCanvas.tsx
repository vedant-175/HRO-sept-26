import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { MockRequest } from '../../data/mockRequests';
import { fmtAmount, STATUS_META } from '../../data/mockRequests';

interface ThreeCanvasProps {
  request: MockRequest | undefined;
}

export interface ThreeCanvasRef {
  resetCamera: () => void;
}

const ThreeCanvas = forwardRef<ThreeCanvasRef, ThreeCanvasProps>(({ request }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const materialsRef = useRef<any>({});
  const balLabelSpriteRef = useRef<THREE.Sprite | null>(null);

  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (controlsRef.current) {
        controlsRef.current.reset();
      }
    }
  }));

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 11);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.minDistance = 3;
    controls.maxDistance = 30;
    controls.enablePan = false;
    controls.saveState(); // for reset
    controlsRef.current = controls;

    const rig = new THREE.Group();
    scene.add(rig);

    function makeGlowTexture() {
      const c = document.createElement('canvas'); c.width = c.height = 256;
      const ctx = c.getContext('2d')!;
      const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, 'rgba(120,180,255,0.55)');
      g.addColorStop(0.4, 'rgba(80,140,255,0.22)');
      g.addColorStop(1, 'rgba(80,140,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(c);
    }
    const glowMat = new THREE.SpriteMaterial({ map: makeGlowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.set(7, 7, 1);
    rig.add(glow);

    const sphereGeo = new THREE.IcosahedronGeometry(1.35, 3);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x3d8bff, emissive: 0x14335c, roughness: 0.35, metalness: 0.25,
      wireframe: false, flatShading: false
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    rig.add(sphere);

    const wireGeo = new THREE.IcosahedronGeometry(1.37, 1);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x9fd0ff, wireframe: true, transparent: true, opacity: 0.18 });
    const wireSphere = new THREE.Mesh(wireGeo, wireMat);
    rig.add(wireSphere);

    materialsRef.current = { glowMat, sphereMat, wireMat };

    const light1 = new THREE.PointLight(0x6fb0ff, 2.2, 30); light1.position.set(4, 3, 5); scene.add(light1);
    const light2 = new THREE.PointLight(0x9b7bf0, 1.1, 30); light2.position.set(-5, -2, -3); scene.add(light2);
    scene.add(new THREE.AmbientLight(0x223148, 1.2));

    const ringGroup = new THREE.Group();
    rig.add(ringGroup);
    const ringSpecs = [
      { radius: 2.15, label: '30 DAYS' },
      { radius: 2.75, label: '60 DAYS' },
      { radius: 3.35, label: '90 DAYS' }
    ];

    function makeLabelSprite(text: string) {
      const c = document.createElement('canvas'); c.width = 256; c.height = 64;
      const ctx = c.getContext('2d')!;
      ctx.font = '600 26px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(150,185,230,0.85)';
      ctx.textAlign = 'left'; ctx.fillText(text, 6, 40);
      const tex = new THREE.CanvasTexture(c);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
      const spr = new THREE.Sprite(mat);
      spr.scale.set(1.3, 0.32, 1);
      return spr;
    }

    ringSpecs.forEach((spec, idx) => {
      const geo = new THREE.TorusGeometry(spec.radius, 0.006, 8, 96);
      const mat = new THREE.MeshBasicMaterial({ color: 0x3d8bff, transparent: true, opacity: 0.35 - idx * 0.06 });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = Math.PI / 2 + 0.25;
      ring.rotation.z = 0.15;
      ringGroup.add(ring);
      const lbl = makeLabelSprite(spec.label);
      const ang = -0.5;
      lbl.position.set(Math.cos(ang) * spec.radius, Math.sin(0.25) * spec.radius * 0.35, Math.sin(ang) * spec.radius * 0.3);
      ringGroup.add(lbl);
    });

    const balLabelSprite = makeLabelSprite('$0');
    balLabelSprite.position.set(-0.55, 1.75, 0);
    balLabelSprite.scale.set(1.6, 0.4, 1);
    rig.add(balLabelSprite);
    balLabelSpriteRef.current = balLabelSprite;

    const PARTICLE_COUNT = 140;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const baseColors = new Float32Array(PARTICLE_COUNT * 3);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const kinds = new Array(PARTICLE_COUNT);
    const teal = new THREE.Color(0x1fbf9a), rose = new THREE.Color(0xf0576e);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const isIncome = i % 2 === 0;
      kinds[i] = isIncome ? 1 : -1;
      const r = 1.6 + Math.random() * 1.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = r * Math.cos(phi);
      const col = isIncome ? teal : rose;
      colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
      baseColors[i * 3] = col.r; baseColors[i * 3 + 1] = col.g; baseColors[i * 3 + 2] = col.b;
      speeds[i] = 0.004 + Math.random() * 0.006;
    }
    
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particleMat = new THREE.PointsMaterial({ size: 0.15, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
    const particles = new THREE.Points(particleGeo, particleMat);
    rig.add(particles);

    const starGeo = new THREE.BufferGeometry();
    const starCount = 1400;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 60;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.045, color: 0x8fb0e0, transparent: true, opacity: 0.55 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Interaction Setup
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.15;
    const mouse = new THREE.Vector2(-1000, -1000);
    
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      if (tooltipRef.current) {
        tooltipRef.current.style.left = `${e.clientX + 15}px`;
        tooltipRef.current.style.top = `${e.clientY + 15}px`;
      }
    };
    container.addEventListener('pointermove', handlePointerMove);

    function resizeScene() {
      const w = container.clientWidth, h = container.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Shift camera view to vertically center the globe in the space above the chart
      // The chart is 210px tall from bottom, so offset by 105px to center in remaining space.
      camera.setViewOffset(w, h, 0, 105, w, h);
      
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resizeScene);
    setTimeout(resizeScene, 100);

    let hoveredIndex = -1;
    let frameId: number;
    
    function animate() {
      frameId = requestAnimationFrame(animate);
      
      controls.update(); // for damping/autorotate
      
      sphere.rotation.y += 0.0022;
      wireSphere.rotation.y -= 0.0016;
      ringGroup.rotation.z += 0.0009;
      stars.rotation.y += 0.00015;

      const posAttr = particleGeo.attributes.position;
      const colAttr = particleGeo.attributes.color;
      
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let x = posAttr.getX(i), y = posAttr.getY(i), z = posAttr.getZ(i);
        const len = Math.sqrt(x * x + y * y + z * z) || 1;
        const dir = kinds[i];
        x += (x / len) * speeds[i] * dir; y += (y / len) * speeds[i] * dir; z += (z / len) * speeds[i] * dir;
        const newLen = Math.sqrt(x * x + y * y + z * z);
        if (dir > 0 && newLen < 1.5) { const scale = 3.5 / (newLen || 1); x *= scale; y *= scale; z *= scale; }
        if (dir < 0 && newLen > 3.6) { const scale = 1.6 / (newLen || 1); x *= scale; y *= scale; z *= scale; }
        posAttr.setXYZ(i, x, y, z);
        
        if (i !== hoveredIndex) {
          colAttr.setXYZ(i, baseColors[i*3], baseColors[i*3+1], baseColors[i*3+2]);
        }
      }
      posAttr.needsUpdate = true;

      // Raycasting
      raycaster.setFromCamera(mouse, camera);
      // Raycast against particles; they are children of rig, so world matrix is applied automatically by three.js
      const intersects = raycaster.intersectObject(particles);
      
      if (intersects.length > 0) {
        const idx = intersects[0].index;
        if (idx !== undefined && idx !== hoveredIndex) {
          hoveredIndex = idx;
          if (tooltipRef.current) {
            tooltipRef.current.style.opacity = '1';
            tooltipRef.current.innerHTML = kinds[idx] > 0 ? '+ Incoming Flow' : '- Outgoing Cost';
          }
        }
        if (idx !== undefined) {
           colAttr.setXYZ(idx, 1, 1, 1); // White highlight
        }
      } else {
        hoveredIndex = -1;
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = '0';
        }
      }
      colAttr.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', resizeScene);
      controls.dispose();
      
      sphereGeo.dispose();
      sphereMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      glowMat.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!request || !materialsRef.current.sphereMat || !balLabelSpriteRef.current) return;
    
    const statusColor = STATUS_META[request.status]?.color || '#3d8bff';
    const c = new THREE.Color(statusColor);
    
    materialsRef.current.sphereMat.color.copy(c);
    materialsRef.current.sphereMat.emissive.copy(c).multiplyScalar(0.28);
    if (materialsRef.current.glowMat) materialsRef.current.glowMat.color.copy(c);
    materialsRef.current.wireMat.color.copy(c);

    const text = fmtAmount(request.balance, request.currency);
    const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 70;
    const ctx = canvas.getContext('2d')!;
    ctx.font = '600 34px "JetBrains Mono", monospace';
    ctx.fillStyle = '#eaf2ff';
    ctx.textAlign = 'left'; ctx.fillText(text, 4, 46);
    
    const sprite = balLabelSpriteRef.current;
    if (sprite.material.map) sprite.material.map.dispose();
    sprite.material.map = new THREE.CanvasTexture(canvas);
    sprite.material.needsUpdate = true;
  }, [request]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas className="scene-canvas" id="scene-canvas" ref={canvasRef}></canvas>
      <div 
        ref={tooltipRef}
        style={{
          position: 'fixed',
          background: 'rgba(15, 25, 45, 0.95)',
          border: '1px solid rgba(100, 160, 255, 0.3)',
          color: '#eaf2ff',
          padding: '6px 12px',
          borderRadius: '4px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.1s',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)'
        }}
      ></div>
    </div>
  );
});

export default ThreeCanvas;

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const ConferenceRoom = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f7);

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 8);

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    if (mountRef.current) mountRef.current.appendChild(renderer.domElement);

    // ── Controls ──
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.update();

    // ── Lights ──
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // ── Floor (Large) ──
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 6),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // ── Glass Material ──
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xaaddff, transparent: true, opacity: 0.25,
      roughness: 0, metalness: 0, transmission: 1,
    });

    // ── Glass Cabin Walls (8m x 6m) ──
    const walls = [
      { x: 0, y: 1.5, z: -3.0, w: 8, h: 3, d: 0.08 }, // back
      { x: 0, y: 1.5, z: 3.0,  w: 8, h: 3, d: 0.08 }, // front
      { x: -4.0, y: 1.5, z: 0, w: 0.08, h: 3, d: 6 }, // left
      // Right wall is the door wall, handled separately below for splitting
    ];
    walls.forEach(w => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.w, w.h, w.d), glassMat);
      mesh.position.set(w.x, w.y, w.z);
      scene.add(mesh);
    });

    // Corner Frames
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 0.7, roughness: 0.3 });
    [[-4, -3], [4, -3], [-4, 3], [4, 3]].forEach(([cx, cz]) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3, 0.1), frameMat);
      col.position.set(cx, 1.5, cz);
      scene.add(col);
    });

    // ── Rectangular Conference Table ──
    // 5m long, 1.2m wide
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.08, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xc8a165, roughness: 0.7 })
    );
    tableTop.position.set(0, 0.92, 0);
    tableTop.castShadow = true;
    scene.add(tableTop);

    // Table legs (white)
    const legMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const legPositions = [
      [-2.4, 0.46, -0.5], [-2.4, 0.46, 0.5],
      [2.4, 0.46, -0.5], [2.4, 0.46, 0.5],
      [0, 0.46, -0.5], [0, 0.46, 0.5]
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.84, 0.1), legMat);
      leg.position.set(lx, ly, lz);
      scene.add(leg);
    });

    // ── Detailed Charging Slots on Table ──
    const openingMat = new THREE.MeshStandardMaterial({ color: 0x111111 }); // Black opening
    const outletMat = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White outlet
    const switchMat = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White switch
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });    // Black holes

    // 8 slots for the long side chairs
    const longSideX = [-1.8, -0.6, 0.6, 1.8];
    longSideX.forEach(sx => {
      [-0.5, 0.5].forEach(sz => {
        const xPos = sx + 0.3;
        
        const op = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.01, 0.15), openingMat);
        op.position.set(xPos, 0.961, sz);
        scene.add(op);

        const outlet = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.01, 0.1), outletMat);
        outlet.position.set(xPos - 0.05, 0.962, sz);
        scene.add(outlet);

        const pSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.015, 0.05), switchMat);
        pSwitch.position.set(xPos + 0.06, 0.965, sz);
        scene.add(pSwitch);

        const h1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.01, 0.03), holeMat);
        h1.position.set(xPos - 0.05, 0.965, sz + 0.02);
        scene.add(h1);
        const h2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.01, 0.03), holeMat);
        h2.position.set(xPos - 0.05, 0.965, sz - 0.02);
        scene.add(h2);
      });
    });

    // 2 slots for the end chairs
    [[-2.4, 0], [2.4, 0]].forEach(([ex, ez]) => {
        const xPos = ex;
        const zPos = ez + 0.3; // Offset slightly to the side of the end chair

        const op = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.01, 0.25), openingMat);
        op.position.set(xPos, 0.961, zPos);
        scene.add(op);

        const outlet = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.01, 0.1), outletMat);
        outlet.position.set(xPos, 0.962, zPos - 0.05);
        scene.add(outlet);

        const pSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.015, 0.03), switchMat);
        pSwitch.position.set(xPos, 0.965, zPos + 0.06);
        scene.add(pSwitch);

        const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.01, 0.02), holeMat);
        hl1.position.set(xPos + 0.02, 0.965, zPos - 0.05);
        scene.add(hl1);
        const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.01, 0.02), holeMat);
        hl2.position.set(xPos - 0.02, 0.965, zPos - 0.05);
        scene.add(hl2);
    });

    // ── Realistic Chair Function (from MeetingRoom) ──
    function createChair(x, z, rotY) {
      const chairGroup = new THREE.Group();
      chairGroup.position.set(x, 0, z);
      chairGroup.rotation.y = rotY;
      scene.add(chairGroup);

      const fabricMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.9 });
      const cushionMat = new THREE.MeshStandardMaterial({ color: 0x16213e, roughness: 0.85 });
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, metalness: 0.8, roughness: 0.3 });
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 });

      chairGroup.add(new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.1, 0.64, 6, 0.05), cushionMat)); // seat
      chairGroup.children[0].position.set(0, 0.58, 0);
      chairGroup.children[0].castShadow = true;
      
      const lip = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.06, 0.06, 4, 0.03), fabricMat);
      lip.position.set(0, 0.545, -0.31);
      chairGroup.add(lip);

      const back = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.75, 0.07, 6, 0.05), fabricMat);
      back.position.set(0, 0.96, 0.32);
      back.castShadow = true;
      chairGroup.add(back);

      const head = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.2, 0.07, 4, 0.05), cushionMat);
      head.position.set(0, 1.385, 0.32);
      head.castShadow = true;
      chairGroup.add(head);

      const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.38), metalMat);
      piston.position.set(0, 0.31, 0);
      chairGroup.add(piston);

      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const sl = 0.28;
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, sl), metalMat);
        spoke.position.set(Math.sin(a) * sl / 2, 0.09, Math.cos(a) * sl / 2);
        spoke.rotation.y = a;
        chairGroup.add(spoke);
        const caster = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04), wheelMat);
        caster.rotation.x = Math.PI / 2;
        caster.position.set(Math.sin(a) * sl, 0.04, Math.cos(a) * sl);
        chairGroup.add(caster);
      }
    }

    // ── Placing 10 Chairs ──
    const xOffsets = [-1.8, -0.6, 0.6, 1.8];
    // Side 1 (Long)
    xOffsets.forEach(ox => createChair(ox, 1.1, 0));
    // Side 2 (Long)
    xOffsets.forEach(ox => createChair(ox, -1.1, Math.PI));
    // Side 3 (Short Left)
    createChair(-3.0, 0, -Math.PI / 2);
    // Side 4 (Short Right)
    createChair(3.0, 0, Math.PI / 2);

    // ── Door Wall (Right Side x=4.0) Split Logic ──
    // Two fixed blue glass panels (total length 6m - 1.5m door = 4.5m / 2 = 2.25m each)
    const fixedBack = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3, 2.25), glassMat);
    fixedBack.position.set(4.0, 1.5, -1.875);
    scene.add(fixedBack);

    const fixedFront = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3, 2.25), glassMat);
    fixedFront.position.set(4.0, 1.5, 1.875);
    scene.add(fixedFront);

    // ── Sliding Door ──
    const doorGroup = new THREE.Group();
    doorGroup.position.set(3.96, 1.5, 0);
    scene.add(doorGroup);
    const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3, 1.5), 
      new THREE.MeshPhysicalMaterial({ color: 0x112233, transparent: true, opacity: 0.45, transmission: 0.9 }));
    doorGroup.add(doorPanel);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    handle.position.set(-0.05, 0, 0.65);
    doorGroup.add(handle);

    // ── Whiteboard ──
    const wb = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 1.5), new THREE.MeshStandardMaterial({ color: 0xfafafa }));
    wb.position.set(-3.95, 2.0, 0);
    wb.rotation.y = Math.PI / 2;
    scene.add(wb);

    // ── Animation ──
    let animationId;
    function animate() {
      animationId = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;
      doorGroup.position.z = -0.75 + Math.sin(t) * 0.75;
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const currentMount = mountRef.current;
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (currentMount && renderer.domElement) currentMount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '6px 20px',
        borderRadius: 20, fontFamily: 'Inter, sans-serif', fontSize: 14, letterSpacing: 1
      }}>
        Conference Room (10 Seater)
      </div>
    </div>
  );
};

export default ConferenceRoom;

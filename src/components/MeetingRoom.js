import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const MeetingRoom = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfafafa);

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 4, 6);

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
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(4, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // ── Floor ──
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.MeshStandardMaterial({ color: 0xe8d5b7, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // ── Glass Material ──
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xaaddff,
      transparent: true,
      opacity: 0.25,
      roughness: 0,
      metalness: 0,
      transmission: 1,
    });

    // ── Glass Cabin Walls ──
    // Front, Back, Left, Right panels (2.5 m room)
    const wallConfigs = [
      { x: 0, y: 1.5, z: -2.5, w: 5, h: 3, d: 0.08 }, // back
      { x: 0, y: 1.5, z: 2.5,  w: 5, h: 3, d: 0.08 }, // front (glass)
      { x: -2.5, y: 1.5, z: 0, w: 0.08, h: 3, d: 5 }, // left
      { x: 2.5,  y: 1.5, z: 0, w: 0.08, h: 3, d: 5 }, // right
    ];
    wallConfigs.forEach(({ x, y, z, w, h, d }) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glassMat);
      wall.position.set(x, y, z);
      scene.add(wall);
    });

    // Silver frame edges (corner bars)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 0.7, roughness: 0.3 });
    const corners = [[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]];
    corners.forEach(([cx, cz]) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3, 0.08), frameMat);
      col.position.set(cx, 1.5, cz);
      scene.add(col);
    });

    // Ceiling strip light
    const ceiling = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.06, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6 })
    );
    ceiling.position.set(0, 2.97, 0);
    scene.add(ceiling);

    // ── Round Table ──
    const tableMat = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.65 });
    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.08, 48), tableMat);
    tableTop.position.set(0, 0.92, 0);
    tableTop.castShadow = true;
    scene.add(tableTop);

    // Table edge ring (darker)
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0xc8a060, roughness: 0.8 });
    const tableEdge = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.04, 8, 48), edgeMat);
    tableEdge.rotation.x = Math.PI / 2;
    tableEdge.position.set(0, 0.92, 0);
    scene.add(tableEdge);

    // Table base (pedestal)
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 0.7, roughness: 0.3 });
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.84, 16), baseMat);
    pedestal.position.set(0, 0.46, 0);
    scene.add(pedestal);

    const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 24), baseMat);
    baseRing.position.set(0, 0.025, 0);
    scene.add(baseRing);

    // ── Realistic Chair Function ──
    function createChair(angle) {
      const radius = 1.05; // Tucked slightly more under the table
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      const chairGroup = new THREE.Group();
      chairGroup.position.set(x, 0, z);
      chairGroup.rotation.y = angle; // Face the center
      scene.add(chairGroup);

      // Materials
      const fabricMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.9 });
      const cushionMat = new THREE.MeshStandardMaterial({ color: 0x16213e, roughness: 0.85 });
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, metalness: 0.8, roughness: 0.3 });
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 });

      // ── SEAT CUSHION ──
      const seat = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.1, 0.64, 6, 0.05), cushionMat);
      seat.position.set(0, 0.58, 0);
      seat.castShadow = true;
      chairGroup.add(seat);

      // Seat front lip
      const lip = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.06, 0.06, 4, 0.03), fabricMat);
      lip.position.set(0, 0.545, -0.31); // Local -Z is front
      chairGroup.add(lip);

      // ── BACKREST ──
      const backRest = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.75, 0.07, 6, 0.05), fabricMat);
      backRest.position.set(0, 0.96, 0.32); // Local +Z is back
      backRest.castShadow = true;
      chairGroup.add(backRest);

      // Lumbar bump
      const lumbar = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.12, 0.05, 4, 0.04), cushionMat);
      lumbar.position.set(0, 0.72, 0.28);
      chairGroup.add(lumbar);

      // Headrest
      const headrest = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.2, 0.07, 4, 0.05), cushionMat);
      headrest.position.set(0, 1.385, 0.32);
      chairGroup.add(headrest);

      // Headrest neck bar
      const headNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12), metalMat);
      headNeck.position.set(0, 1.28, 0.32);
      chairGroup.add(headNeck);

      // ── ARMRESTS ──
      [-0.38, 0.38].forEach(ax => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22), metalMat);
        post.position.set(ax, 0.62, 0);
        chairGroup.add(post);
        const pad = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.04, 0.28, 4, 0.02), cushionMat);
        pad.position.set(ax, 0.74, 0);
        chairGroup.add(pad);
      });

      // ── GAS PISTON & BASE ──
      const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.38), metalMat);
      piston.position.set(0, 0.31, 0);
      chairGroup.add(piston);

      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03), metalMat);
      plate.position.set(0, 0.52, 0);
      chairGroup.add(plate);

      // 5-star base
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

    // 3 chairs equally spaced around table
    const numChairs = 3;
    for (let i = 0; i < numChairs; i++) {
      const angle = (i / numChairs) * Math.PI * 2;
      createChair(angle);
    }

    // ── Sliding Door (front wall) ──
    const doorGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x112233, transparent: true, opacity: 0.45,
      roughness: 0, metalness: 0, transmission: 0.9
    });
    const fixedL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3, 1.75), glassMat);
    fixedL.position.set(2.5, 1.5, -1.625);
    scene.add(fixedL);
    const fixedR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3, 1.75), glassMat);
    fixedR.position.set(2.5, 1.5, 1.625);
    scene.add(fixedR);

    const doorGroup = new THREE.Group();
    doorGroup.position.set(2.46, 1.5, 0);
    scene.add(doorGroup);
    const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3, 1.5), doorGlassMat);
    doorGroup.add(doorPanel);

    const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 5), doorFrameMat);
    topRail.position.set(2.48, 2.96, 0);
    scene.add(topRail);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5), handleMat);
    handle.position.set(-0.05, 0, 0.65);
    doorGroup.add(handle);

    // ── Whiteboard on back wall ──
    const wbFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 1.3, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    wbFrame.position.set(0, 2.2, -2.46);
    scene.add(wbFrame);
    const wbSurface = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 1.1),
      new THREE.MeshStandardMaterial({ color: 0xfafafa })
    );
    wbSurface.position.set(0, 2.2, -2.43);
    scene.add(wbSurface);

    // ── Small Switchboard (on back wall near board) ──
    const sbBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.22, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    sbBase.position.set(1.8, 1.2, -2.47);
    scene.add(sbBase);

    // Mini switches on the board
    const swMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });
    const switchGeo = new THREE.BoxGeometry(0.04, 0.06, 0.01);
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const sw = new THREE.Mesh(switchGeo, swMat);
        sw.position.set(1.75 + col * 0.1, 1.25 - row * 0.1, -2.45);
        scene.add(sw);
      }
    }

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
        Small Meeting Room
      </div>
    </div>
  );
};

export default MeetingRoom;

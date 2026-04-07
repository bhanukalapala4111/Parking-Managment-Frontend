import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const ThreeDScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup from provided code
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(6, 5, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    
    // Append to our ref instead of document.body
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const controls = new OrbitControls(camera, renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    light.castShadow = true;
    scene.add(light);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 5),
      new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xaaddff,
      transparent: true,
      opacity: 0.25,
      roughness: 0,
      metalness: 0,
      transmission: 1
    });

    function createGlassWall(x, y, z, w, h, d) {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        glassMaterial
      );
      wall.position.set(x, y, z);
      scene.add(wall);
    }

    createGlassWall(0, 1.5, -2.5, 4, 3, 0.08); // Back wall
    createGlassWall(0, 1.5, 2.5, 4, 3, 0.08);  // Front wall
    createGlassWall(-2, 1.5, 0, 0.08, 3, 5); // Left wall
    
    // Silver corner frame edges (corner bars)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 0.7, roughness: 0.3 });
    const corners = [[-2, -2.5], [2, -2.5], [-2, 2.5], [2, 2.5]];
    corners.forEach(([cx, cz]) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3, 0.08), frameMat);
      col.position.set(cx, 1.5, cz);
      scene.add(col);
    });
    
    // Right wall as a Sliding Door (Tinted Black Glass)
    const doorGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x112233,
      transparent: true,
      opacity: 0.45,
      roughness: 0,
      metalness: 0,
      transmission: 0.9
    });
    // The fixed parts of the wall uses standard glass (front and back)
    const fixedBack = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3, 1.75), glassMaterial);
    fixedBack.position.set(2, 1.5, -1.625);
    scene.add(fixedBack);

    const fixedFront = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3, 1.75), glassMaterial);
    fixedFront.position.set(2, 1.5, 1.625);
    scene.add(fixedFront);

    const slidingDoorGroup = new THREE.Group();
    slidingDoorGroup.position.set(1.92, 1.5, 0); // Center of the wall
    scene.add(slidingDoorGroup);

    const slidingDoor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3, 1.5), doorGlassMat);
    slidingDoorGroup.add(slidingDoor);
    
    // Sliding door rails and handle
    const railMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 5.0), railMat);
    topRail.position.set(1.96, 2.95, 0);
    scene.add(topRail);
    const bottomRail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 5.0), railMat);
    bottomRail.position.set(1.96, 0.025, 0);
    scene.add(bottomRail);
    
    // Handle
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6), handleMat);
    handle.position.set(-0.04, 0, 0.6); // Handle on the opposite side
    slidingDoorGroup.add(handle);

    function createDesk(z) {
      // Wood Top
      const top = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.1, 1),
        new THREE.MeshStandardMaterial({ color: 0xc8a165, roughness: 0.7 })
      );
      top.position.set(0, 1.05, z);
      top.castShadow = true;
      scene.add(top);

      // White Supports (Legs)
      const legMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      
      const legLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.8), legMat);
      legLeft.position.set(-1.8, 0.5, z);
      legLeft.castShadow = true;
      scene.add(legLeft);

      const legRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.8), legMat);
      legRight.position.set(1.8, 0.5, z);
      legRight.castShadow = true;
      scene.add(legRight);

      // ── Small Black Mesh Dustbin ──
      const binMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8, wireframe: false });
      // Body (tapered cylinder - wider at top)
      const binBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.28, 12, 1, true), binMat);
      binBody.position.set(1.5, 0.14, z);
      scene.add(binBody);
      // Bottom cap
      const binBottom = new THREE.Mesh(new THREE.CircleGeometry(0.09, 12), binMat);
      binBottom.rotation.x = -Math.PI / 2;
      binBottom.position.set(1.5, 0.0, z);
      scene.add(binBottom);

      // Recessed charging slots (black opening with white switch and socket)
      const openingMat = new THREE.MeshStandardMaterial({ color: 0x111111 }); // Black opening
      const outletMat = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White outlet
      const switchMat = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White switch
      const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });      // Black holes

      [-1.5, 0, 1.5].forEach((xPos) => {
        // Move towards the wall (which is at z = -2.5 or 2.5)
        const socketZ = z < 0 ? z - 0.4 : z + 0.4;

        // Black opening (flush with table top y=1.10)
        const opening = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.01, 0.15), openingMat);
        opening.position.set(xPos + 0.3, 1.101, socketZ); 
        scene.add(opening);

        // White Outlet plate
        const outlet = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.01, 0.1), outletMat);
        outlet.position.set(xPos + 0.25, 1.102, socketZ);
        scene.add(outlet);

        // Power Switch
        const pSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.015, 0.05), switchMat);
        pSwitch.position.set(xPos + 0.36, 1.105, socketZ);
        scene.add(pSwitch);

        // Socket plug holes (black)
        const hole1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.01, 0.03), holeMat);
        hole1.position.set(xPos + 0.25, 1.105, socketZ + 0.02);
        scene.add(hole1);

        const hole2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.01, 0.03), holeMat);
        hole2.position.set(xPos + 0.25, 1.105, socketZ - 0.02);
        scene.add(hole2);
      });
    }

    createDesk(-2.0); // back wall table (moved outwards slightly)
    createDesk(2.0);  // front wall table (moved outwards slightly)

    function createChair(x, z, targetZ) {
      const facingBack = targetZ < z;
      const chairGroup = new THREE.Group();
      chairGroup.position.set(x, 0, z);
      chairGroup.rotation.y = facingBack ? 0 : Math.PI;
      scene.add(chairGroup);

      // Materials
      const fabricMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.9 });         // Dark navy fabric
      const cushionMat = new THREE.MeshStandardMaterial({ color: 0x16213e, roughness: 0.85 });        // Slightly lighter cushion
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, metalness: 0.8, roughness: 0.3 }); // Chrome metal
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 });           // Dark rubber wheels

      // ── SEAT CUSHION (slightly rounded look) ──
      const seatCushion = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.1, 0.64, 6, 0.05), cushionMat);
      seatCushion.position.set(0, 0.58, 0);
      seatCushion.castShadow = true;
      chairGroup.add(seatCushion);

      // Seat front edge rounding
      const seatFront = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.06, 0.06, 4, 0.03), fabricMat);
      seatFront.position.set(0, 0.545, -0.31);
      chairGroup.add(seatFront);

      // ── BACKREST ──
      const backRest = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.75, 0.07, 6, 0.05), fabricMat);
      backRest.position.set(0, 0.96, 0.32);
      backRest.castShadow = true;
      chairGroup.add(backRest);

      // Lumbar support bump
      const lumbar = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.12, 0.05, 4, 0.04), cushionMat);
      lumbar.position.set(0, 0.72, 0.28);
      chairGroup.add(lumbar);

      // Headrest
      const headrest = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.2, 0.07, 4, 0.05), cushionMat);
      headrest.position.set(0, 1.385, 0.32);
      headrest.castShadow = true;
      chairGroup.add(headrest);

      // Headrest neck bar
      const headNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12), metalMat);
      headNeck.position.set(0, 1.28, 0.32);
      chairGroup.add(headNeck);

      // ── BACK FRAME (two vertical bars) ──
      [-0.29, 0.29].forEach(bx => {
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.82), metalMat);
        bar.position.set(bx, 0.97, 0.32);
        chairGroup.add(bar);
      });

      // ── ARMRESTS ──
      [-0.38, 0.38].forEach(ax => {
        // Arm post
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22), metalMat);
        post.position.set(ax, 0.62, 0);
        chairGroup.add(post);
        // Arm pad
        const pad = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.04, 0.28, 4, 0.02), cushionMat);
        pad.position.set(ax, 0.74, 0);
        chairGroup.add(pad);
      });

      // ── GAS LIFT PISTON & BASE ──
      const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.38), metalMat);
      piston.position.set(0, 0.31, 0);
      chairGroup.add(piston);

      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03), metalMat);
      plate.position.set(0, 0.52, 0);
      chairGroup.add(plate);

      // 5-star base
      const numSpokes = 5;
      const spokeLength = 0.28;
      for (let i = 0; i < numSpokes; i++) {
        const angle = (i / numSpokes) * Math.PI * 2;
        const sx = Math.sin(angle) * spokeLength / 2;
        const sz = Math.cos(angle) * spokeLength / 2;

        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, spokeLength), metalMat);
        spoke.position.set(sx, 0.09, sz);
        spoke.rotation.y = angle;
        chairGroup.add(spoke);

        // Caster wheel at tip
        const caster = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04), wheelMat);
        caster.rotation.x = Math.PI / 2;
        caster.position.set(Math.sin(angle) * spokeLength, 0.04, Math.cos(angle) * spokeLength);
        chairGroup.add(caster);
      }
    }

    // 3 chairs facing the back wall table (z = -2.0)
    createChair(-1.5, -1.4, -2.0);
    createChair(0, -1.4, -2.0);
    createChair(1.5, -1.4, -2.0);

    // 3 chairs facing the front wall table (z = 2.0)
    createChair(-1.5, 1.4, 2.0);
    createChair(0, 1.4, 2.0);
    createChair(1.5, 1.4, 2.0);

    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 1.1),
      new THREE.MeshStandardMaterial({ color: 0xeeeeee })
    );
    // Attached to Left wall - raised higher
    board.position.set(-1.95, 2.2, 0);
    board.rotation.y = Math.PI / 2;
    scene.add(board);

    let animationId;
    function animate() {
      animationId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      // Center: -0.75, Amplitude: 0.75. z oscillates between 0 (closed) and -1.5 (open)
      slidingDoorGroup.position.z = -0.75 + Math.sin(time) * 0.75;
      
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

    // Cleanup block
    const currentMount = mountRef.current;
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
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
        Six Seater Cabin
      </div>
    </div>
  );
};

export default ThreeDScene;

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { GlobeComment, PendingCoords } from '@/lib/types';

interface GlobeCanvasProps {
  pins: GlobeComment[];
  onGlobeTap: (coords: PendingCoords) => void;
  onPinTap: (pin: GlobeComment) => void;
  controlsEnabled: boolean;
}

const GLOBE_RADIUS = 5;

// A reliable, CORS-enabled Earth day map texture.
const EARTH_TEXTURE_URL =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg';

function createPinMesh(): THREE.Group {
  const group = new THREE.Group();

  // Core sphere — solid bright marker
  const coreGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.name = 'pin-core';
  group.add(core);

  // Outer glow ring — semi-transparent, animated
  const ringGeo = new THREE.SphereGeometry(0.16, 16, 16);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.5,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.name = 'pin-glow';
  group.add(ring);

  // Make the whole group raycastable via the core
  group.userData.raycastOnlyCore = true;

  return group;
}

export default function GlobeCanvas({
  pins,
  onGlobeTap,
  onPinTap,
  controlsEnabled,
}: GlobeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef<GlobeComment[]>(pins);
  const controlsEnabledRef = useRef(controlsEnabled);
  const onGlobeTapRef = useRef(onGlobeTap);
  const onPinTapRef = useRef(onPinTap);
  const pinGroupRef = useRef<THREE.Group | null>(null);

  // Keep refs in sync with latest props without re-running the Three.js setup
  pinsRef.current = pins;
  controlsEnabledRef.current = controlsEnabled;
  onGlobeTapRef.current = onGlobeTap;
  onPinTapRef.current = onPinTap;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene setup ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    // Camera positioned at z=25 so the globe appears ~40% smaller than at z=15
    camera.position.set(0, 0, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';

    // --- Lighting ---
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 2.0);
    directional.position.set(10, 10, 10);
    scene.add(directional);

    // --- Earth mesh ---
    const globeGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const globeMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.7,
      metalness: 0.1,
    });

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      EARTH_TEXTURE_URL,
      (texture) => {
        globeMaterial.map = texture;
        globeMaterial.needsUpdate = true;
      },
      undefined,
      () => {
        // Fallback: solid ocean-blue globe if texture fails to load
        globeMaterial.color = new THREE.Color(0x0a2540);
        globeMaterial.needsUpdate = true;
      },
    );

    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Subtle atmospheric glow shell
    const atmoGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.03, 64, 64);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmosphere);

    // --- Pin group ---
    const pinGroup = new THREE.Group();
    scene.add(pinGroup);
    pinGroupRef.current = pinGroup;

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.6;
    controls.minDistance = 12;
    controls.maxDistance = 33;
    controls.enablePan = false;

    // --- Raycaster + pointer tracking ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isPointerDown = false;

    const onPointerDown = (e: PointerEvent) => {
      startX = e.clientX;
      startY = e.clientY;
      startTime = performance.now();
      isPointerDown = true;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isPointerDown) return;
      isPointerDown = false;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const elapsed = performance.now() - startTime;

      // Tap vs drag: small movement + short duration
      const isTap = distance < 6 && elapsed < 250;
      if (!isTap) return;

      // Ignore taps if controls are disabled (modal open)
      if (!controlsEnabledRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      // Check pin hits first (closer to camera = on top)
      const pinMeshes: THREE.Object3D[] = [];
      pinGroup.traverse((obj) => {
        if (obj.name === 'pin-core') pinMeshes.push(obj);
      });

      const pinHits = raycaster.intersectObjects(pinMeshes, false);
      if (pinHits.length > 0) {
        const pinData = pinHits[0].object.parent?.userData?.pinData;
        if (pinData) {
          onPinTapRef.current(pinData as GlobeComment);
          return;
        }
      }

      // Otherwise check globe surface
      const globeHits = raycaster.intersectObject(globe, false);
      if (globeHits.length > 0) {
        const point = globeHits[0].point.clone();
        onGlobeTapRef.current({
          x: point.x,
          y: point.y,
          z: point.z,
        });
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // --- Render loop ---
    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Pulse glow rings on all pins
      pinGroup.traverse((obj) => {
        if (obj.name === 'pin-glow' && obj instanceof THREE.Mesh) {
          const scale = 1 + Math.sin(t * 3) * 0.25;
          obj.scale.setScalar(scale);
          if (obj.material instanceof THREE.MeshBasicMaterial) {
            obj.material.opacity = 0.3 + Math.sin(t * 3) * 0.2;
          }
        }
      });

      controls.enabled = controlsEnabledRef.current;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- Sync pin meshes whenever pins change ---
    const syncPins = () => {
      // Clear old pins
      while (pinGroup.children.length > 0) {
        const child = pinGroup.children[0];
        pinGroup.remove(child);
        child.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            const mat = obj.material;
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else mat.dispose();
          }
        });
      }

      // Add current pins
      for (const pin of pinsRef.current) {
        const mesh = createPinMesh();
        const pos = new THREE.Vector3(pin.pos_x, pin.pos_y, pin.pos_z);
        pos.multiplyScalar(1.01); // offset above surface to prevent z-fighting
        mesh.position.copy(pos);
        mesh.userData.pinData = pin;
        pinGroup.add(mesh);
      }
    };

    // Initial sync + watch for pin changes
    syncPins();
    let lastPinCount = pinsRef.current.length;
    let lastPinHash = pinsRef.current.map((p) => p.id).join(',');
    const syncInterval = setInterval(() => {
      const currentCount = pinsRef.current.length;
      const currentHash = pinsRef.current.map((p) => p.id).join(',');
      if (currentCount !== lastPinCount || currentHash !== lastPinHash) {
        lastPinCount = currentCount;
        lastPinHash = currentHash;
        syncPins();
      }
    }, 200);

    // --- Resize ---
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(frameId);
      clearInterval(syncInterval);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      globeGeometry.dispose();
      globeMaterial.dispose();
      atmoGeo.dispose();
      atmoMat.dispose();
      pinGroup.children.forEach((child) => {
        child.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            const mat = obj.material;
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else mat.dispose();
          }
        });
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0" />;
}

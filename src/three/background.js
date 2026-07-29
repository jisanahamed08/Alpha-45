import * as THREE from 'three';
import { getState, subscribe } from '../state/appState.js';
import { createQuantumMesh } from './quantumMesh.js';
import { createCyberGrid } from './cyberGrid.js';
import { createPlasmaSphere } from './plasmaSphere.js';
import { createMatrixRain } from './matrixRain.js';

let activeMode = 'quantum';
let quantumSubScene = null;
let cyberSubScene = null;
let plasmaSubScene = null;
let matrixSubScene = null;

/**
 * Switches the active 3D shader background mode
 * @param {'quantum' | 'cyber' | 'plasma' | 'matrix'} mode
 */
export function setShaderMode(mode) {
  const validModes = ['quantum', 'cyber', 'plasma', 'matrix'];
  if (!validModes.includes(mode)) return;

  activeMode = mode;

  if (quantumSubScene?.group) {
    quantumSubScene.group.visible = (mode === 'quantum');
  }
  if (cyberSubScene?.group) {
    cyberSubScene.group.visible = (mode === 'cyber');
  }
  if (plasmaSubScene?.group) {
    plasmaSubScene.group.visible = (mode === 'plasma');
  }
  if (matrixSubScene?.group) {
    matrixSubScene.group.visible = (mode === 'matrix');
  }
}

/**
 * Initializes the Three.js 3D WebGL Background Scene with Scroll-Driven Animations
 * @param {HTMLCanvasElement} canvas - The canvas element to render into
 */
export function initBackgroundScene(canvas) {
  if (!canvas) return;

  // 1. Scene, Camera & Renderer Setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 25;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  const maxPixelRatio = window.innerWidth < 768 ? 1.25 : 1.5;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));

  // 2. Instantiate Sub-scenes
  quantumSubScene = createQuantumMesh(scene);
  cyberSubScene = createCyberGrid(scene);
  plasmaSubScene = createPlasmaSphere(scene);
  matrixSubScene = createMatrixRain(scene);

  const initialState = getState();
  setShaderMode(initialState.shaderMode || 'quantum');

  const unsubscribeStore = subscribe((state) => {
    if (state.shaderMode) {
      setShaderMode(state.shaderMode);
    }
  });

  // 3. Mouse/Touch Pointer Parallax Controller
  const mouse = { targetX: 0, targetY: 0, currentX: 0, currentY: 0 };

  function onPointerMove(event) {
    mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // 4. Scroll-Driven 3D Animation Controller
  let scrollTargetProgress = 0;
  let currentScrollProgress = 0;

  function onScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollTargetProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 5. Window Resize Handler
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
  }

  window.addEventListener('resize', onWindowResize, false);

  // 6. Animation Loop & Tab Visibility Handle
  let animationFrameId = null;
  const clock = new THREE.Clock();

  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    mouse.currentX += (mouse.targetX - mouse.currentX) * 0.05;
    mouse.currentY += (mouse.targetY - mouse.currentY) * 0.05;
    currentScrollProgress += (scrollTargetProgress - currentScrollProgress) * 0.08;

    camera.position.x = mouse.currentX * 2.5;
    camera.position.y = mouse.currentY * 2.0 + Math.sin(currentScrollProgress * Math.PI) * 1.5;
    camera.position.z = 25 - currentScrollProgress * 6;
    camera.rotation.z = Math.sin(currentScrollProgress * Math.PI) * 0.15;
    camera.lookAt(0, 0, 0);

    if (quantumSubScene?.group?.visible) {
      quantumSubScene.group.rotation.y = elapsedTime * 0.1 + currentScrollProgress * Math.PI * 2;
      quantumSubScene.group.rotation.x = currentScrollProgress * Math.PI * 0.5;
      quantumSubScene.update(elapsedTime, mouse);
    }
    if (cyberSubScene?.group?.visible) {
      cyberSubScene.group.rotation.x = -Math.PI * 0.35 + currentScrollProgress * 0.4;
      cyberSubScene.group.position.z = currentScrollProgress * 12;
      cyberSubScene.update(elapsedTime, mouse);
    }
    if (plasmaSubScene?.group?.visible) {
      plasmaSubScene.group.rotation.y = elapsedTime * 0.3 + currentScrollProgress * Math.PI * 3;
      plasmaSubScene.group.scale.setScalar(1 + currentScrollProgress * 0.35);
      plasmaSubScene.update(elapsedTime, mouse);
    }
    if (matrixSubScene?.group?.visible) {
      matrixSubScene.update(elapsedTime);
    }

    renderer.render(scene, camera);
  }

  function onVisibilityChange() {
    if (document.hidden) {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    } else {
      if (!animationFrameId) {
        clock.start();
        animate();
      }
    }
  }

  document.addEventListener('visibilitychange', onVisibilityChange, false);

  clock.start();
  animate();

  return {
    setShaderMode,
    destroy() {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (unsubscribeStore) unsubscribeStore();

      quantumSubScene?.dispose();
      cyberSubScene?.dispose();
      plasmaSubScene?.dispose();
      matrixSubScene?.dispose();
      renderer.dispose();
    }
  };
}

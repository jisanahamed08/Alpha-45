import * as THREE from 'three';

/**
 * Creates the Matrix Digital Code Rain 3D Sub-scene (Mode 4)
 * @param {THREE.Scene} scene - Parent Three.js Scene
 * @returns {{ group: THREE.Group, update: (elapsedTime: number) => void, dispose: () => void }}
 */
export function createMatrixRain(scene) {
  const group = new THREE.Group();

  // Create Matrix Code Characters Canvas Texture
  function createMatrixTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 128, 128);

    ctx.font = 'bold 70px monospace';
    ctx.fillStyle = '#00f2fe';
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 15;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('01', 64, 64);

    return new THREE.CanvasTexture(canvas);
  }

  const texture = createMatrixTexture();
  const count = 180;
  const positions = new Float32Array(count * 3);
  const speeds = [];

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;     // X
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50; // Y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // Z

    speeds.push(0.08 + Math.random() * 0.15);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 1.2,
    map: texture,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  group.add(points);
  scene.add(group);

  function update(elapsedTime) {
    if (!group.visible) return;

    const pos = geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3 + 1;
      pos[idx] -= speeds[i];

      if (pos[idx] < -25) {
        pos[idx] = 25;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    group.rotation.y = elapsedTime * 0.05;
  }

  function dispose() {
    geometry.dispose();
    material.dispose();
    texture.dispose();
    scene.remove(group);
  }

  return {
    group,
    update,
    dispose
  };
}

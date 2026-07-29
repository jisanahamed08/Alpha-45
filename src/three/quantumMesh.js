import * as THREE from 'three';

/**
 * Creates and manages the Quantum Particle Mesh 3D Sub-scene (Mode 1)
 * Particle constellation node network with dynamic lines & instanced wireframe icosahedrons.
 * @param {THREE.Scene} scene - Parent Three.js Scene
 * @returns {{ group: THREE.Group, update: (elapsedTime: number, mouse: { currentX: number, currentY: number }) => void, dispose: () => void }}
 */
export function createQuantumMesh(scene) {
  const group = new THREE.Group();

  // 1. Procedural Radial Glow Particle Texture
  function createParticleTexture() {
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 64;
    texCanvas.height = 64;
    const ctx = texCanvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(0, 242, 254, 1.0)');   // Cyan center
    gradient.addColorStop(0.35, 'rgba(79, 172, 254, 0.6)'); // Sky blue mid
    gradient.addColorStop(0.7, 'rgba(127, 0, 255, 0.25)'); // Violet outer
    gradient.addColorStop(1, 'rgba(127, 0, 255, 0.0)');    // Transparent edge

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(texCanvas);
  }

  const particleTexture = createParticleTexture();

  // 2. Particle Constellation Network Setup
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const particleCount = isMobile ? 65 : 120;
  const maxDistance = isMobile ? 3.5 : 5.2;

  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = [];

  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 45;
    const y = (Math.random() - 0.5) * 30;
    const z = (Math.random() - 0.5) * 20;

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    particleVelocities.push({
      x: (Math.random() - 0.5) * 0.025,
      y: (Math.random() - 0.5) * 0.025,
      z: (Math.random() - 0.5) * 0.015
    });
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(particlePositions, 3)
  );

  const particleMaterial = new THREE.PointsMaterial({
    size: isMobile ? 0.7 : 1.1,
    map: particleTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particlePoints = new THREE.Points(particleGeometry, particleMaterial);
  group.add(particlePoints);

  // 3. Dynamic Connecting Line Segments Allocation
  const maxLines = (particleCount * (particleCount - 1)) / 2;
  const linePositions = new Float32Array(maxLines * 6);
  const lineColors = new Float32Array(maxLines * 6);

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(linePositions, 3)
  );
  lineGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(lineColors, 3)
  );

  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
  group.add(lineMesh);

  // 4. Low-Poly Floating Instanced Wireframe Icosahedrons
  const solidCount = 20;
  const solidGeometry = new THREE.IcosahedronGeometry(0.65, 0);
  const solidMaterial = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
    wireframe: true,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending
  });

  const instancedSolids = new THREE.InstancedMesh(
    solidGeometry,
    solidMaterial,
    solidCount
  );

  const dummy = new THREE.Object3D();
  const solidData = [];

  for (let i = 0; i < solidCount; i++) {
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 25,
      (Math.random() - 0.5) * 15 - 5
    );
    const rot = new THREE.Vector3(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    const rotSpeed = new THREE.Vector3(
      (Math.random() - 0.5) * 0.015,
      (Math.random() - 0.5) * 0.015,
      (Math.random() - 0.5) * 0.015
    );
    const scale = 0.6 + Math.random() * 0.8;

    solidData.push({ pos, rot, rotSpeed, scale, seed: Math.random() * 100 });
  }
  group.add(instancedSolids);

  scene.add(group);

  // 5. Update Loop Animation Handle
  function update(elapsedTime, mouse) {
    if (!group.visible) return;

    // Update particle positions & bounce bounds
    const posAttr = particleGeometry.attributes.position;
    const posArray = posAttr.array;

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      const vel = particleVelocities[i];

      posArray[idx] += vel.x;
      posArray[idx + 1] += vel.y;
      posArray[idx + 2] += vel.z;

      if (Math.abs(posArray[idx]) > 25) vel.x *= -1;
      if (Math.abs(posArray[idx + 1]) > 18) vel.y *= -1;
      if (Math.abs(posArray[idx + 2]) > 12) vel.z *= -1;
    }
    posAttr.needsUpdate = true;

    // Calculate line connections between close node pairs
    let lineVertexCount = 0;
    const linePosArr = lineGeometry.attributes.position.array;
    const lineColArr = lineGeometry.attributes.color.array;

    for (let i = 0; i < particleCount; i++) {
      const x1 = posArray[i * 3];
      const y1 = posArray[i * 3 + 1];
      const z1 = posArray[i * 3 + 2];

      for (let j = i + 1; j < particleCount; j++) {
        const x2 = posArray[j * 3];
        const y2 = posArray[j * 3 + 1];
        const z2 = posArray[j * 3 + 2];

        const dx = x1 - x2;
        const dy = y1 - y2;
        const dz = z1 - z2;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance) {
          const alpha = 1.0 - dist / maxDistance;
          const pIdx = lineVertexCount * 3;

          linePosArr[pIdx] = x1;
          linePosArr[pIdx + 1] = y1;
          linePosArr[pIdx + 2] = z1;

          linePosArr[pIdx + 3] = x2;
          linePosArr[pIdx + 4] = y2;
          linePosArr[pIdx + 5] = z2;

          const r = 0.0 * (1 - alpha) + 0.5 * alpha;
          const g = 0.95 * alpha;
          const b = 1.0;

          lineColArr[pIdx] = r * alpha;
          lineColArr[pIdx + 1] = g * alpha;
          lineColArr[pIdx + 2] = b * alpha;

          lineColArr[pIdx + 3] = r * alpha;
          lineColArr[pIdx + 4] = g * alpha;
          lineColArr[pIdx + 5] = b * alpha;

          lineVertexCount += 2;
        }
      }
    }

    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.attributes.color.needsUpdate = true;
    lineGeometry.setDrawRange(0, lineVertexCount);

    // Update floating instanced solids
    for (let i = 0; i < solidCount; i++) {
      const data = solidData[i];
      data.rot.x += data.rotSpeed.x;
      data.rot.y += data.rotSpeed.y;
      data.rot.z += data.rotSpeed.z;

      const yOffset = Math.sin(elapsedTime * 0.8 + data.seed) * 0.5;

      dummy.position.set(data.pos.x, data.pos.y + yOffset, data.pos.z);
      dummy.rotation.set(data.rot.x, data.rot.y, data.rot.z);
      dummy.scale.setScalar(data.scale);
      dummy.updateMatrix();

      instancedSolids.setMatrixAt(i, dummy.matrix);
    }
    instancedSolids.instanceMatrix.needsUpdate = true;
  }

  function dispose() {
    particleGeometry.dispose();
    particleMaterial.dispose();
    particleTexture.dispose();
    lineGeometry.dispose();
    lineMaterial.dispose();
    solidGeometry.dispose();
    solidMaterial.dispose();
    scene.remove(group);
  }

  return {
    group,
    update,
    dispose
  };
}

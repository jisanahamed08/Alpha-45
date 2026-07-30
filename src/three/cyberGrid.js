import * as THREE from 'three';

/**
 * Creates and manages the Cyber Grid Wave 3D Sub-scene (Mode 2)
 * Animated 3D grid plane with wave vertex displacement and cyan grid lines.
 * @param {THREE.Scene} scene - Parent Three.js Scene
 * @returns {{ group: THREE.Group, update: (elapsedTime: number, mouse: { currentX: number, currentY: number }) => void, dispose: () => void }}
 */
export function createCyberGrid(scene) {
  const group = new THREE.Group();

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const gridWidth = 70;
  const gridHeight = 70;
  const segments = isMobile ? 30 : 45;

  const planeGeometry = new THREE.PlaneGeometry(gridWidth, gridHeight, segments, segments);

  // Custom Shader Material for GPU Wave Displacement
  const customShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorCyan: { value: new THREE.Color(0x38bdf8) },
      uColorPurple: { value: new THREE.Color(0x6366f1) }
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying float vWave;

      void main() {
        vUv = uv;
        vec3 pos = position;

        float wave1 = sin(pos.x * 0.2 + uTime * 2.0) * cos(pos.y * 0.2 + uTime * 1.5);
        float wave2 = sin(pos.x * 0.4 - uTime * 2.5) * 0.5;
        float wave3 = cos(sqrt(pos.x * pos.x + pos.y * pos.y) * 0.25 - uTime * 1.8) * 0.5;

        pos.z += (wave1 + wave2 + wave3) * 1.2;
        vWave = pos.z;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColorCyan;
      uniform vec3 uColorPurple;
      varying vec2 vUv;
      varying float vWave;

      void main() {
        vec2 grid = abs(fract(vUv * 35.0 - 0.5) - 0.5);
        vec2 delta = vec2(0.03);
        vec2 line = smoothstep(vec2(0.0), delta, grid);
        float gridPattern = 1.0 - min(line.x, line.y);

        vec3 color = mix(uColorCyan, uColorPurple, clamp(vWave * 0.3 + 0.5, 0.0, 1.0));
        float horizonFade = smoothstep(1.0, 0.15, vUv.y);
        float alpha = (gridPattern * 0.75 + 0.1) * horizonFade;

        gl_FragColor = vec4(color * (0.8 + gridPattern * 0.6), alpha);
      }
    `,
    transparent: true,
    wireframe: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const gridMesh = new THREE.Mesh(planeGeometry, customShaderMaterial);
  gridMesh.rotation.x = -Math.PI / 2.3;
  gridMesh.position.y = -6;
  gridMesh.position.z = -5;
  group.add(gridMesh);

  // Floating Horizon Particles
  const particleCount = isMobile ? 30 : 50;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSpeeds = [];

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 60;
    particlePositions[i * 3 + 1] = -5 + Math.random() * 20;
    particlePositions[i * 3 + 2] = -25 + Math.random() * 30;

    particleSpeeds.push({
      y: 0.02 + Math.random() * 0.025,
      x: (Math.random() - 0.5) * 0.01
    });
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.6,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  group.add(particles);

  scene.add(group);

  // Fast GPU Shader Update Loop
  function update(elapsedTime, mouse) {
    if (!group.visible) return;

    // Update shader time uniform on GPU
    customShaderMaterial.uniforms.uTime.value = elapsedTime;

    // Update floating horizon particles
    const pPosAttr = particleGeometry.attributes.position;
    const pPosArr = pPosAttr.array;

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      const speed = particleSpeeds[i];

      pPosArr[idx] += speed.x;
      pPosArr[idx + 1] += speed.y;

      if (pPosArr[idx + 1] > 15) {
        pPosArr[idx + 1] = -5;
        pPosArr[idx] = (Math.random() - 0.5) * 60;
      }
    }
    pPosAttr.needsUpdate = true;

    // Parallax tilt on grid mesh
    gridMesh.rotation.z = mouse.currentX * 0.08;
    gridMesh.rotation.x = -Math.PI / 2.3 + mouse.currentY * 0.05;
  }

  function dispose() {
    planeGeometry.dispose();
    customShaderMaterial.dispose();
    particleGeometry.dispose();
    particleMaterial.dispose();
    scene.remove(group);
  }

  return {
    group,
    update,
    dispose
  };
}

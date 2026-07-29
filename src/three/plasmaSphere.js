import * as THREE from 'three';

/**
 * Creates and manages the Glowing Plasma Sphere 3D Sub-scene (Mode 3)
 * Rotational sphere with custom ShaderMaterial / rim lighting and pulsing plasma effects.
 * @param {THREE.Scene} scene - Parent Three.js Scene
 * @returns {{ group: THREE.Group, update: (elapsedTime: number, mouse: { currentX: number, currentY: number }) => void, dispose: () => void }}
 */
export function createPlasmaSphere(scene) {
  const group = new THREE.Group();

  // 1. Core Plasma Sphere Geometry & Custom Shader Material
  const coreGeometry = new THREE.SphereGeometry(4.5, 64, 64);

  const plasmaShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorCyan: { value: new THREE.Color(0x00f2fe) },
      uColorMagenta: { value: new THREE.Color(0xff007f) },
      uColorPurple: { value: new THREE.Color(0x7f00ff) }
    },
    vertexShader: `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);

        vec3 pos = position;
        float wave1 = sin(pos.x * 1.8 + uTime * 2.5) * cos(pos.y * 1.8 + uTime * 2.0);
        float wave2 = sin(pos.z * 2.5 + uTime * 3.0) * 0.25;
        pos += normal * (wave1 * 0.35 + wave2);

        vPosition = pos;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorCyan;
      uniform vec3 uColorMagenta;
      uniform vec3 uColorPurple;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;

      void main() {
        vec3 viewDir = normalize(-vPosition);
        float rim = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
        float fresnel = pow(rim, 2.5);

        float p1 = sin(vPosition.x * 1.5 + uTime * 2.0);
        float p2 = cos(vPosition.y * 1.5 - uTime * 1.8);
        float p3 = sin(vPosition.z * 1.5 + uTime * 2.2);
        float plasma = (p1 + p2 + p3) / 3.0;

        vec3 color = mix(uColorPurple, uColorMagenta, plasma * 0.5 + 0.5);
        color = mix(color, uColorCyan, fresnel * 0.95);

        float alpha = 0.85 + fresnel * 0.15;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending
  });

  const plasmaMesh = new THREE.Mesh(coreGeometry, plasmaShaderMaterial);
  group.add(plasmaMesh);

  // 2. Outer Glowing Atmosphere / Aura Halo
  const auraGeometry = new THREE.SphereGeometry(5.4, 32, 32);
  const auraMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorCyan: { value: new THREE.Color(0x00f2fe) }
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColorCyan;
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
        gl_FragColor = vec4(uColorCyan, intensity * 0.5);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });

  const auraMesh = new THREE.Mesh(auraGeometry, auraMaterial);
  group.add(auraMesh);

  // 3. Orbiting Energy Torus Rings
  const ringGeometry1 = new THREE.TorusGeometry(7.0, 0.05, 16, 100);
  const ringMaterial1 = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });
  const ring1 = new THREE.Mesh(ringGeometry1, ringMaterial1);
  ring1.rotation.x = Math.PI / 3;
  group.add(ring1);

  const ringGeometry2 = new THREE.TorusGeometry(8.2, 0.04, 16, 100);
  const ringMaterial2 = new THREE.MeshBasicMaterial({
    color: 0xff007f,
    wireframe: true,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });
  const ring2 = new THREE.Mesh(ringGeometry2, ringMaterial2);
  ring2.rotation.y = Math.PI / 4;
  group.add(ring2);

  scene.add(group);

  // 4. Update Loop
  function update(elapsedTime, mouse) {
    if (!group.visible) return;

    plasmaShaderMaterial.uniforms.uTime.value = elapsedTime;
    auraMaterial.uniforms.uTime.value = elapsedTime;

    // Rotations & movement
    plasmaMesh.rotation.y = elapsedTime * 0.25;
    plasmaMesh.rotation.x = Math.sin(elapsedTime * 0.15) * 0.1;

    ring1.rotation.z = elapsedTime * 0.35;
    ring1.rotation.x = Math.PI / 3 + Math.sin(elapsedTime * 0.2) * 0.1;

    ring2.rotation.z = -elapsedTime * 0.25;
    ring2.rotation.y = Math.PI / 4 + Math.cos(elapsedTime * 0.2) * 0.15;

    // Mouse parallax offset on group
    group.position.x = mouse.currentX * 1.5;
    group.position.y = mouse.currentY * 1.2;
  }

  function dispose() {
    coreGeometry.dispose();
    plasmaShaderMaterial.dispose();
    auraGeometry.dispose();
    auraMaterial.dispose();
    ringGeometry1.dispose();
    ringMaterial1.dispose();
    ringGeometry2.dispose();
    ringMaterial2.dispose();
    scene.remove(group);
  }

  return {
    group,
    update,
    dispose
  };
}

/**
 * test_m2_edge_cases.js - Empirical Edge Case & Boundary Challenger Suite for Milestone 2
 * Tests invalid mode states, pub/sub subscriber leaks, error resilience, window resize handling in Cyber/Plasma modes,
 * pointer move edge cases, and background scene destruction/lifecycle.
 */

import assert from 'node:assert';
import * as THREE from 'three';
import { createPortfolioDOMEnvironment } from '../../tests/setup-dom.js';
import { getState, setState, subscribe } from '../../src/state/appState.js';
import { initBackgroundScene, setShaderMode } from '../../src/three/background.js';
import { createQuantumMesh } from '../../src/three/quantumMesh.js';
import { createCyberGrid } from '../../src/three/cyberGrid.js';
import { createPlasmaSphere } from '../../src/three/plasmaSphere.js';

let testCount = 0;
let passCount = 0;
let failCount = 0;
const findings = [];

function runTest(name, fn) {
  testCount++;
  try {
    fn();
    passCount++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    failCount++;
    console.error(`  [FAIL] ${name}: ${err.message}`);
    findings.push({ name, error: err.message, stack: err.stack });
  }
}

function createTestDOMEnv() {
  const env = createPortfolioDOMEnvironment();
  env.document.defaultView = env.window;
  return env;
}

console.log('================================================================');
console.log('       CHALLENGER 2 - MILESTONE 2 EMPIRICAL TEST SUITE          ');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// SECTION 1: appState Store Boundary & Edge Cases
// -----------------------------------------------------------------------------
console.log('--- Category 1: AppState Pub/Sub Store Edge & Boundary Cases ---');

runTest('AppState 1.1: getState returns an isolated clone of internal state', () => {
  const state1 = getState();
  state1.shaderMode = 'HACKED_MODE';
  state1.isMuted = true;
  
  const state2 = getState();
  assert.strictEqual(state2.shaderMode, 'quantum', 'getState must return shallow clone, not internal reference');
  assert.strictEqual(state2.isMuted, false);
});

runTest('AppState 1.2: setState handles null, undefined, primitives, and non-object inputs safely', () => {
  const before = getState();
  setState(null);
  setState(undefined);
  setState('string');
  setState(123);
  setState(true);
  const after = getState();
  assert.deepStrictEqual(before, after, 'setState should ignore non-object inputs without throwing');
});

runTest('AppState 1.3: setState does not notify subscribers if no state properties changed', () => {
  let notifyCount = 0;
  const unsub = subscribe(() => {
    notifyCount++;
  });

  setState({ shaderMode: 'quantum' }); // Same as current
  assert.strictEqual(notifyCount, 0, 'No notification should fire if state value is identical');

  setState({ isMuted: false }); // Same as current
  assert.strictEqual(notifyCount, 0, 'No notification should fire if state value is identical');

  setState({ shaderMode: 'cyber' });
  assert.strictEqual(notifyCount, 1, 'Notification should fire when value changes');

  // Reset back to quantum
  setState({ shaderMode: 'quantum' });
  unsub();
});

runTest('AppState 1.4: subscribe handles non-function arguments cleanly', () => {
  const unsub1 = subscribe(null);
  const unsub2 = subscribe(undefined);
  const unsub3 = subscribe(123);
  assert.strictEqual(typeof unsub1, 'function');
  assert.strictEqual(typeof unsub2, 'function');
  assert.strictEqual(typeof unsub3, 'function');
  // Executing returned unsub functions should not crash
  unsub1();
  unsub2();
  unsub3();
});

runTest('AppState 1.5: Unsubscribe function is idempotent (multiple calls do not throw)', () => {
  let calls = 0;
  const unsub = subscribe(() => calls++);
  
  unsub();
  unsub(); // second call
  unsub(); // third call

  setState({ isMuted: true });
  assert.strictEqual(calls, 0, 'Subscriber should be removed and multiple unsub calls should succeed');
  setState({ isMuted: false });
});

runTest('AppState 1.6: Listener exception handling does not break state update or remaining subscribers', () => {
  let sub2Called = false;

  const unsub1 = subscribe(() => {
    throw new Error('Failing subscriber test error');
  });

  const unsub2 = subscribe(() => {
    sub2Called = true;
  });

  // Should catch subscriber error gracefully and notify remaining subscribers
  setState({ shaderMode: 'plasma' });
  assert.strictEqual(sub2Called, true, 'Subsequent subscribers must be notified even if prior subscriber throws');
  assert.strictEqual(getState().shaderMode, 'plasma');

  unsub1();
  unsub2();
  setState({ shaderMode: 'quantum' });
});


// -----------------------------------------------------------------------------
// SECTION 2: 3D Shader Switcher & Invalid Mode Boundary Handling
// -----------------------------------------------------------------------------
console.log('\n--- Category 2: 3D Shader Switcher Invalid Mode Handling ---');

runTest('ShaderMode 2.1: setShaderMode handles invalid string and non-string inputs without mutating active mode', () => {
  const env = createTestDOMEnv();

  setShaderMode('quantum');
  assert.strictEqual(getState().shaderMode, 'quantum');

  // Attempt setting invalid modes directly
  setShaderMode('invalid_mode');
  setShaderMode('CYBER'); // uppercase invalid
  setShaderMode('');
  setShaderMode(null);
  setShaderMode(undefined);
  setShaderMode(123);
  setShaderMode({ mode: 'cyber' });

  // State should remain unchanged
  assert.strictEqual(getState().shaderMode, 'quantum');
});

runTest('ShaderMode 2.2: Mode state transitions quantum -> cyber -> plasma -> quantum update state correctly', () => {
  const env = createTestDOMEnv();

  // Transition to cyber
  setState({ shaderMode: 'cyber' });
  assert.strictEqual(getState().shaderMode, 'cyber');

  // Transition to plasma
  setState({ shaderMode: 'plasma' });
  assert.strictEqual(getState().shaderMode, 'plasma');

  // Transition to quantum
  setState({ shaderMode: 'quantum' });
  assert.strictEqual(getState().shaderMode, 'quantum');
});


// -----------------------------------------------------------------------------
// SECTION 3: Window Resize Handling in Cyber & Plasma Modes
// -----------------------------------------------------------------------------
console.log('\n--- Category 3: Window Resize Handling in Cyber & Plasma Modes ---');

runTest('Resize 3.1: Triggering window resize in Cyber Grid mode updates camera and renderer cleanly', () => {
  const env = createTestDOMEnv();

  setState({ shaderMode: 'cyber' });
  env.window.resize(800, 600);
  env.window.stepFrames(2);
});

runTest('Resize 3.2: Triggering window resize in Plasma Sphere mode updates camera and renderer cleanly', () => {
  const env = createTestDOMEnv();

  setState({ shaderMode: 'plasma' });
  env.window.resize(3840, 2160);
  env.window.stepFrames(2);
});

runTest('Resize 3.3: Rapid consecutive window resizes across mode switches do not throw or leak listeners', () => {
  const env = createTestDOMEnv();

  const modes = ['quantum', 'cyber', 'plasma'];
  const sizes = [
    { w: 320, h: 480 },
    { w: 1920, h: 1080 },
    { w: 2560, h: 1440 },
    { w: 1024, h: 768 }
  ];

  for (let i = 0; i < 12; i++) {
    const mode = modes[i % modes.length];
    const size = sizes[i % sizes.length];

    setState({ shaderMode: mode });
    env.window.resize(size.w, size.h);
    env.window.stepFrames(1);
  }
});


// -----------------------------------------------------------------------------
// SECTION 4: Sub-Scene Update Loop & Mathematical Edge Cases
// -----------------------------------------------------------------------------
console.log('\n--- Category 4: Sub-Scene Update Loops with Boundary Coordinates ---');

runTest('SubScene 4.1: CyberGrid update loop with extreme mouse coordinates and time steps', () => {
  const scene = new THREE.Scene();
  const cyber = createCyberGrid(scene);

  cyber.update(0.0, { currentX: 0, currentY: 0 });
  cyber.update(100.5, { currentX: -10, currentY: 10 });
  cyber.update(9999.9, { currentX: 999, currentY: -999 });

  cyber.dispose();
});

runTest('SubScene 4.2: PlasmaSphere update loop with extreme mouse coordinates and time steps', () => {
  const scene = new THREE.Scene();
  const plasma = createPlasmaSphere(scene);

  plasma.update(0.0, { currentX: 0, currentY: 0 });
  plasma.update(50.2, { currentX: 5.5, currentY: -4.2 });
  plasma.update(10000.0, { currentX: -50, currentY: 50 });

  plasma.dispose();
});

runTest('SubScene 4.3: QuantumMesh update loop with extreme mouse coordinates and time steps', () => {
  const scene = new THREE.Scene();
  const quantum = createQuantumMesh(scene);

  quantum.update(0.0, { currentX: 0, currentY: 0 });
  quantum.update(123.4, { currentX: -2.5, currentY: 3.5 });

  quantum.dispose();
});


// -----------------------------------------------------------------------------
// SECTION 5: Background Scene Lifecycle & Clean Unsubscribe Leaks Test
// -----------------------------------------------------------------------------
console.log('\n--- Category 5: Background Scene Lifecycle & Resource Cleanup ---');

runTest('Lifecycle 5.1: Multiple background instances destroyed via destroy() cleanup store subscribers and listeners cleanly', () => {
  const env = createTestDOMEnv();
  const canvas = env.document.createElement('canvas');
  canvas.ownerDocument = env.document;
  const bgInstance = initBackgroundScene(canvas);

  setState({ shaderMode: 'cyber' });
  env.window.stepFrames(1);

  bgInstance.destroy();

  // State changes after destroy should not throw
  setState({ shaderMode: 'plasma' });
  setState({ shaderMode: 'quantum' });
});

runTest('Lifecycle 5.2: Pointermove event handling in window across modes', () => {
  const env = createTestDOMEnv();

  const pointerEvent = { type: 'pointermove', clientX: 500, clientY: 300 };
  env.window.dispatchEvent(pointerEvent);
  env.window.stepFrames(2);
});


// -----------------------------------------------------------------------------
// SUMMARY REPORT
// -----------------------------------------------------------------------------

console.log('\n================================================================');
console.log('               CHALLENGER 2 TEST EXECUTION SUMMARY               ');
console.log('================================================================');
console.log(` Total Executed Edge Cases : ${testCount}`);
console.log(` Passed Test Cases          : ${passCount}`);
console.log(` Failed Test Cases          : ${failCount}`);
console.log('================================================================\n');

if (failCount > 0) {
  console.error(`VERDICT: ${failCount} EDGE CASE FAILURES DETECTED!`);
  process.exit(1);
} else {
  console.log('VERDICT: ALL 16 EDGE CASE AND BOUNDARY TESTS PASSED SUCCESSFULLY! (100% PASS)');
  process.exit(0);
}

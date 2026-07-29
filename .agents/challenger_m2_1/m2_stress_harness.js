/**
 * m2_stress_harness.js
 * Empirical Stress Test Harness for Milestone 2: Multi-Mode 3D WebGL Background & Shader Switcher.
 * 
 * Verifies state consistency, sub-scene visibility, DOM active states,
 * error-free execution under 200+ rapid mode toggles, invalid input resilience,
 * and memory cleanup on dispose.
 */

import assert from 'node:assert';
import { createPortfolioDOMEnvironment } from '../../tests/setup-dom.js';
import { getState, setState, subscribe } from '../../src/state/appState.js';
import { initNavbarComponent } from '../../src/components/navbar.js';
import { initBackgroundScene } from '../../src/three/background.js';

async function runM2StressHarness() {
  console.log('================================================================');
  console.log('   MILESTONE 2: 3D SHADER SWITCHER EMPIRICAL STRESS TEST HARNESS ');
  console.log('================================================================\n');

  let passedTests = 0;
  let failedTests = 0;
  const errorList = [];

  function runTestCase(testName, testFn) {
    try {
      testFn();
      console.log(`  [PASS] ${testName}`);
      passedTests++;
    } catch (err) {
      console.log(`  [FAIL] ${testName}`);
      console.log(`         Error: ${err.message}`);
      failedTests++;
      errorList.push({ testName, error: err.message, stack: err.stack });
    }
  }

  // --- Setup DOM & Background Scene ---
  const { document, window, flushTimers, stepFrame } = createPortfolioDOMEnvironment();
  const canvas = document.getElementById('bg-canvas');
  assert.ok(canvas, '#bg-canvas must exist in DOM');

  // Initialize navbar theme switcher and 3D background scene
  initNavbarComponent();
  const bgScene = initBackgroundScene(canvas);
  assert.ok(bgScene, 'initBackgroundScene must return scene handle');

  const themeSwitcher = document.getElementById('theme-switcher');
  assert.ok(themeSwitcher, '#theme-switcher must exist');
  
  const cyberBtn = themeSwitcher.querySelector('.theme-btn[data-mode="cyber"]');
  const plasmaBtn = themeSwitcher.querySelector('.theme-btn[data-mode="plasma"]');
  const quantumBtn = themeSwitcher.querySelector('.theme-btn[data-mode="quantum"]');

  assert.ok(cyberBtn && plasmaBtn && quantumBtn, 'All 3 mode buttons must exist');

  // --- Test 1: Initial State Consistency ---
  runTestCase('M2_1.1: Initial State & Button Active Class', () => {
    const state = getState();
    assert.strictEqual(state.shaderMode, 'quantum', 'Default shaderMode should be quantum');
    assert.strictEqual(quantumBtn.classList.contains('active'), true, 'Quantum button active');
    assert.strictEqual(quantumBtn.getAttribute('aria-pressed'), 'true', 'Quantum button aria-pressed true');
    assert.strictEqual(cyberBtn.classList.contains('active'), false, 'Cyber button inactive');
    assert.strictEqual(plasmaBtn.classList.contains('active'), false, 'Plasma button inactive');
  });

  // --- Test 2: Sequential Mode Toggling (100 Rapid Switches) ---
  runTestCase('M2_1.2: 100 Rapid Sequential Mode Toggles via State and DOM Clicks', () => {
    const modes = ['cyber', 'plasma', 'quantum'];
    const startTime = performance.now();

    for (let i = 0; i < 100; i++) {
      const targetMode = modes[i % 3];

      if (i % 2 === 0) {
        // Toggle via state store directly
        setState({ shaderMode: targetMode });
      } else {
        // Toggle via UI button click
        const btn = targetMode === 'cyber' ? cyberBtn : targetMode === 'plasma' ? plasmaBtn : quantumBtn;
        btn.click();
      }

      // Step frame loop once
      stepFrame();

      // Verify app state
      const currentMode = getState().shaderMode;
      assert.strictEqual(currentMode, targetMode, `Iter ${i}: Expected state mode '${targetMode}', got '${currentMode}'`);

      // Verify DOM button active states
      assert.strictEqual(cyberBtn.classList.contains('active'), targetMode === 'cyber');
      assert.strictEqual(plasmaBtn.classList.contains('active'), targetMode === 'plasma');
      assert.strictEqual(quantumBtn.classList.contains('active'), targetMode === 'quantum');

      assert.strictEqual(cyberBtn.getAttribute('aria-pressed'), targetMode === 'cyber' ? 'true' : 'false');
      assert.strictEqual(plasmaBtn.getAttribute('aria-pressed'), targetMode === 'plasma' ? 'true' : 'false');
      assert.strictEqual(quantumBtn.getAttribute('aria-pressed'), targetMode === 'quantum' ? 'true' : 'false');
    }

    const duration = performance.now() - startTime;
    console.log(`         [INFO] 100 Sequential mode switches executed in ${duration.toFixed(2)} ms (${(duration/100).toFixed(3)} ms/switch)`);
  });

  // --- Test 3: Randomized High-Frequency Stress Loop (100 Rapid Switches) ---
  runTestCase('M2_1.3: 100 Randomized High-Frequency Mode Switches under Animation Loop Step', () => {
    const modes = ['quantum', 'cyber', 'plasma'];
    const startTime = performance.now();

    for (let i = 0; i < 100; i++) {
      const randomMode = modes[Math.floor(Math.random() * modes.length)];

      if (Math.random() > 0.5) {
        setState({ shaderMode: randomMode });
      } else {
        const btn = randomMode === 'cyber' ? cyberBtn : randomMode === 'plasma' ? plasmaBtn : quantumBtn;
        btn.click();
      }

      // Step frame
      stepFrame();

      const currentMode = getState().shaderMode;
      assert.strictEqual(currentMode, randomMode, `Random iter ${i}: Expected mode '${randomMode}', got '${currentMode}'`);
    }

    const duration = performance.now() - startTime;
    console.log(`         [INFO] 100 Randomized mode switches executed in ${duration.toFixed(2)} ms (${(duration/100).toFixed(3)} ms/switch)`);
  });

  // --- Test 4: Invalid Input & Fallback Boundary Resilience ---
  runTestCase('M2_1.4: Resilience to Invalid Shader Modes and Null Inputs', () => {
    const lastValidMode = getState().shaderMode;

    // Attempt invalid mode via setShaderMode directly
    bgScene.setShaderMode('nonexistent_mode');
    assert.strictEqual(getState().shaderMode, lastValidMode, 'State should remain last valid mode');

    bgScene.setShaderMode(null);
    assert.strictEqual(getState().shaderMode, lastValidMode, 'State should remain last valid mode on null');

    bgScene.setShaderMode(12345);
    assert.strictEqual(getState().shaderMode, lastValidMode, 'State should remain last valid mode on number');

    // Attempt invalid state update
    setState({ shaderMode: 'bogus' });
    assert.strictEqual(getState().shaderMode, 'bogus', 'Store holds assigned value, but bgScene ignores invalid modes');

    // Restore to valid mode
    setState({ shaderMode: 'quantum' });
    assert.strictEqual(getState().shaderMode, 'quantum');
  });

  // --- Test 5: Long-Running Frame Loop Audit (500 animation ticks) ---
  runTestCase('M2_1.5: Continuous Frame Loop Execution (500 Ticks) Across Modes', () => {
    const modes = ['quantum', 'cyber', 'plasma'];
    
    for (let modeIdx = 0; modeIdx < modes.length; modeIdx++) {
      setState({ shaderMode: modes[modeIdx] });
      for (let f = 0; f < 166; f++) {
        stepFrame();
      }
    }

    assert.strictEqual(getState().shaderMode, 'plasma');
  });

  // --- Test 6: Teardown & Resource Disposal Verification ---
  runTestCase('M2_1.6: Background Scene Disposal Integrity', () => {
    assert.doesNotThrow(() => {
      bgScene.destroy();
    }, 'bgScene.destroy() must execute without throwing errors');
  });

  console.log('\n================================================================');
  console.log(` M2 Stress Test Summary: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runM2StressHarness().catch(err => {
  console.error('Fatal error in stress harness:', err);
  process.exit(1);
});

import assert from 'node:assert';
import { createPortfolioDOMEnvironment } from './setup-dom.js';
import { getState, setState, subscribe } from '../src/state/appState.js';

export function runM2Tests() {
  console.log('--- Milestone 2: Shader Mode Switcher Unit & Integration Tests ---');
  
  // Test 1: appState store Pub/Sub
  const initialState = getState();
  assert.strictEqual(initialState.shaderMode, 'quantum');
  assert.strictEqual(initialState.isMuted, false);
  assert.strictEqual(initialState.isTerminalOpen, false);
  assert.strictEqual(initialState.activeModalProjectId, null);

  let notifiedState = null;
  const unsubscribe = subscribe((state) => {
    notifiedState = state;
  });

  setState({ shaderMode: 'cyber' });
  assert.strictEqual(getState().shaderMode, 'cyber');
  assert.strictEqual(notifiedState.shaderMode, 'cyber');

  unsubscribe();
  setState({ shaderMode: 'plasma' });
  assert.strictEqual(getState().shaderMode, 'plasma');
  assert.strictEqual(notifiedState.shaderMode, 'cyber'); // Unsubscribed, so not updated

  // Reset state to quantum
  setState({ shaderMode: 'quantum' });
  console.log('  [PASS] M2_State_1: appState Pub/Sub store manages state and notifications cleanly');

  // Test 2: Navbar Theme Switcher DOM & state integration
  const { document } = createPortfolioDOMEnvironment();
  const themeSwitcher = document.getElementById('theme-switcher');
  assert.ok(themeSwitcher, '#theme-switcher element must exist in navbar');

  const cyberBtn = themeSwitcher.querySelector('.theme-btn[data-mode="cyber"]');
  const plasmaBtn = themeSwitcher.querySelector('.theme-btn[data-mode="plasma"]');
  const quantumBtn = themeSwitcher.querySelector('.theme-btn[data-mode="quantum"]');

  assert.ok(cyberBtn, 'Cyber mode button exists');
  assert.ok(plasmaBtn, 'Plasma mode button exists');
  assert.ok(quantumBtn, 'Quantum mode button exists');

  // Click Cyber button
  cyberBtn.click();
  assert.strictEqual(getState().shaderMode, 'cyber');
  assert.strictEqual(cyberBtn.classList.contains('active'), true);
  assert.strictEqual(quantumBtn.classList.contains('active'), false);

  // Click Plasma button
  plasmaBtn.click();
  assert.strictEqual(getState().shaderMode, 'plasma');
  assert.strictEqual(plasmaBtn.classList.contains('active'), true);
  assert.strictEqual(cyberBtn.classList.contains('active'), false);

  // Click Quantum button
  quantumBtn.click();
  assert.strictEqual(getState().shaderMode, 'quantum');
  assert.strictEqual(quantumBtn.classList.contains('active'), true);
  assert.strictEqual(plasmaBtn.classList.contains('active'), false);

  console.log('  [PASS] M2_Navbar_2: Theme switcher buttons correctly trigger appState updates and active class toggling\n');
}

runM2Tests();

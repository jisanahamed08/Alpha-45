## 2026-07-29T05:28:55Z
You are Worker 1 for Milestone 2 (R1: Multi-Mode 3D WebGL Background & Shader Switcher) of the 3D Interactive Portfolio Upgrade project.
Your working directory is C:\Users\Jisan\.gemini\antigravity\scratch\interactive_3d_portfolio\.agents\worker_m2_1.
Target project directory is C:\Users\Jisan\.gemini\antigravity\scratch\interactive_3d_portfolio.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Tasks:
1. Create `src/state/appState.js`:
   - Implement lightweight Pub/Sub store managing `shaderMode` ('quantum' | 'cyber' | 'plasma'), `isMuted`, `isTerminalOpen`, and `activeModalProjectId`.
   - Provide `getState()`, `setState(partialState)`, `subscribe(listener)`.

2. Create 3D Sub-scenes in `src/three/`:
   - `quantumMesh.js`: Default particle constellation network with instanced wireframe icosahedrons.
   - `cyberGrid.js`: Cyber Grid Wave - animated 3D grid plane with wave vertex displacement and cyan grid lines.
   - `plasmaSphere.js`: Glowing Plasma Sphere - rotational sphere with custom ShaderMaterial / rim lighting and pulsing plasma effects.

3. Refactor `src/three/background.js`:
   - Keep persistent `WebGLRenderer` on `#bg-canvas`.
   - Add mode switcher `setShaderMode(mode)` that toggles group visibility and updates animation loop.
   - Maintain mouse parallax tracking and window resize handler.

4. Update UI in `index.html`, `src/components/navbar.js`, and `src/style.css`:
   - Add `#theme-switcher` UI container in navbar with 3 mode buttons: Quantum, Cyber Grid, Plasma Sphere (or icons/text).
   - Wire buttons to `appState.setState({ shaderMode: mode })` and highlight active button state.

5. Verification:
   - Run `cmd /c npm run build` to verify production bundling cleanly.
   - Run `cmd /c node run-e2e-tests.js` to ensure baseline test suite passes 100%.

6. Report:
   - Write complete handoff report to `C:\Users\Jisan\.gemini\antigravity\scratch\interactive_3d_portfolio\.agents\worker_m2_1\handoff.md`.
   - Send message to orchestrator upon completion.

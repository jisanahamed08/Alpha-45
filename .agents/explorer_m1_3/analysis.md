# Requirements Architecture & Gap Analysis Report (Milestone 1)

**Target Project**: 3D Interactive Portfolio Upgrade (`C:\Users\Jisan\.gemini\antigravity\scratch\interactive_3d_portfolio`)  
**Author**: Explorer 3 (Requirements Architecture & Gap Analysis)  
**Date**: 2026-07-29  

---

## 1. Executive Summary

This report delivers a thorough requirements architecture and gap analysis for upgrading the existing **3D Interactive Portfolio Website** with five advanced interactive features (R1 through R5).

A comprehensive audit of the baseline codebase confirms:
- **Baseline Infrastructure**: Vite 6, vanilla ES modules, Three.js (`three@0.174.0`), Lucide icons (`lucide@0.475.0`), and Canvas Confetti (`canvas-confetti@1.9.4`).
- **Baseline Test Suite**: 43/43 E2E tests passing (100% pass rate verified via `node run-e2e-tests.js`), validating initial M0 features (Hero, 3D Background canvas, Projects grid + filter, Career timeline, Skills progress bars, Glassmorphism contact form validation).
- **Upgrade Objective**: Implement 3D Shader Switcher (R1), Ctrl+K Command Palette & CLI drawer (R2), Web Audio Synthesizers & EQ toggle (R3), Testimonials Carousel & GitHub Activity Heatmap (R4), and Interactive 3D Canvas Modal Previews (R5) without breaking existing functionality, introducing WebGL memory leaks, or causing frame drops.

---

## 2. Requirement-by-Requirement Analysis

### R1. Multi-Mode 3D WebGL Background & Shader Switcher
- **Functional Requirements**:
  - Top navigation bar Theme Switcher allowing users to toggle live between 3 distinct WebGL visual modes:
    1. **Quantum Particle Mesh** (default particle constellation with proximity connection lines and low-poly floating solids).
    2. **Cyber Grid Wave** (animated 3D wireframe grid plane with procedural terrain wave displacement).
    3. **Glowing Plasma Sphere** (rotational shader sphere with pulsing rim lighting and color gradient).
  - Mode transitions must be smooth, seamless, and performant without WebGL context destruction, re-creation overhead, or memory leaks.
- **Interface Contract**:
  - `mode`: `'quantum' | 'cyber' | 'plasma'`
  - Global state dispatch and event notification.

### R2. Interactive Terminal / Command Palette Overlay (Ctrl + K)
- **Functional Requirements**:
  - Floating command palette / CLI drawer opened via keyboard shortcut `Ctrl + K` (or `Cmd + K` on macOS) or clicking a search/terminal trigger button in the navbar.
  - Interactive terminal supporting CLI commands:
    - `help`: Lists all supported commands with short descriptions.
    - `about`: Prints developer bio, role, and background details.
    - `skills`: Displays tech stack summary and top competencies.
    - `projects`: Lists featured projects and filtering categories.
    - `contact`: Prints contact details and smoothly scrolls to contact form.
    - `theme [1-3]`: Programmatically triggers 3D background shader switch (`theme 1` -> Quantum, `theme 2` -> Cyber, `theme 3` -> Plasma).
    - `download-cv`: Triggers resume download or opens resume link.
    - `clear`: Clears the terminal output screen buffer.
- **Interface Contract**:
  - Shortcut listener `(e.ctrlKey || e.metaKey) && e.key === 'k'`.
  - Command parser returning formatted terminal output entries and triggering application state side-effects.

### R3. Web Audio Micro-Interactions & Mute Control
- **Functional Requirements**:
  - Zero external asset dependency: Uses native Web Audio API oscillators, GainNodes, and BiquadFilterNodes to generate synthetic futuristic UI sound effects.
  - Triggers audio on key UI events:
    - Button / card hover (`mouseenter`).
    - Button click (`click`).
    - Section scroll boundary entry (`scroll`).
    - Theme / mode change chime.
  - Mute/Unmute toggle button in the navigation bar with an animated SVG/CSS sound equalizer (EQ) visualizer reflecting mute state.
- **Interface Contract**:
  - Methods: `playHover()`, `playClick()`, `playScroll()`, `playThemeChange()`, `toggleMute()`, `isMuted()`.
  - Global state synchronization between audio manager and navbar EQ UI component.

### R4. Testimonials Slider & GitHub Activity Grid
- **Functional Requirements**:
  - **Testimonials Carousel**:
    - Interactive touch/drag slider featuring client/peer reviews, client names, roles, company tags, star ratings (1-5), quote text, and avatar images.
    - Navigation controls: Previous/Next buttons, pagination dot indicators, and drag gesture support (`pointerdown`, `pointermove`, `pointerup`).
    - Auto-play rotation with pause on hover.
  - **GitHub Contribution Heatmap**:
    - Interactive 52-week code contribution activity grid (GitHub-style intensity squares: levels 0 to 4).
    - Interactive tooltips on hover/focus displaying daily commit counts and timestamps.
    - Summary stat badges (Total Commits, Current Streak, Longest Streak, Top Repositories).

### R5. Interactive 3D Canvas Preview inside Project Modals
- **Functional Requirements**:
  - When opening a project detail modal, render an interactive 3D WebGL preview canvas adjacent to project text details.
  - Renders project-themed 3D objects (e.g., interactive rotating laptop/device mesh, geometric crystal, cyber cube, torus knot, or plasma torus).
  - Supports mouse drag / orbit rotation by the user.
  - Must properly destroy and clean up WebGL geometries, materials, and requestAnimationFrame loops when the modal is closed to prevent WebGL context loss or memory leaks.

---

## 3. Gap Analysis: Existing Code vs Required Features

| Feature | Existing Implementation State | Missing Components & Gaps | Required Implementation Assets |
|---------|--------------------------------|---------------------------|--------------------------------|
| **R1: 3D Shader Switcher** | `src/three/background.js` has a single hardcoded scene (Particle network + low-poly solids). | - No Theme Switcher UI in navbar.<br>- No mode state manager/pub-sub.<br>- Missing Cyber Grid Wave scene/shader.<br>- Missing Glowing Plasma Sphere scene/shader.<br>- No scene transition manager. | - `src/three/shaders/quantumMesh.js`<br>- `src/three/shaders/cyberGrid.js`<br>- `src/three/shaders/plasmaSphere.js`<br>- `src/components/themeSwitcher.js`<br>- `src/state/appState.js` |
| **R2: Terminal Palette (Ctrl+K)** | No terminal drawer or CLI parser in codebase. Navbar has no shortcut button. | - No modal/drawer DOM container (`#terminal-modal`).<br>- Missing `Ctrl+K` keyboard shortcut listener.<br>- Missing CLI command parser and registry.<br>- No integration with page scrolling or 3D theme switcher. | - `#terminal-modal` in `index.html`<br>- `src/components/terminal.js`<br>- CSS drawer animations in `src/style.css` |
| **R3: Web Audio Synth & EQ** | No audio code or `src/audio/` directory in project. | - No Web Audio API synthesizer module.<br>- Missing procedural audio generators (`playHover`, `playClick`, `playScroll`).<br>- Missing Navbar Mute/Unmute EQ UI toggle.<br>- No UI event binding hooks. | - `src/audio/synth.js`<br>- `src/components/audioControl.js`<br>- `src/hooks/useAudio.js`<br>- Navbar EQ markup in `index.html` |
| **R4: Testimonials & GitHub Grid** | Codebase contains no Testimonials section and no GitHub Grid section. | - No HTML markup for `#testimonials` or `#github-activity`.<br>- Missing Testimonial dataset and GitHub contribution data generator.<br>- Missing touch/drag slider logic.<br>- Missing contribution heatmap grid & tooltip logic. | - `src/data/testimonials.js`<br>- `src/data/github.js`<br>- `src/components/testimonials.js`<br>- `src/components/githubGrid.js`<br>- HTML sections in `index.html` |
| **R5: Modal Interactive 3D Preview** | `src/components/modal.js` renders a static `<img>` tag in a single-column layout. | - Modal body is single-column.<br>- No WebGL preview canvas container in modal.<br>- Missing modal 3D rendering pipeline and controls.<br>- Missing WebGL cleanup/disposal logic on modal close. | - 2-column grid layout in `src/style.css`<br>- `src/three/modalPreview.js`<br>- 3D metadata on project items in `src/data/projects.js`<br>- Lifecycle hooks in `src/components/modal.js` |

---

## 4. Proposed Component Architecture & State Management

### 4.1 State Architecture (`src/state/appState.js`)
To decouple UI components from direct background canvas references and prevent circular dependencies, a centralized Lightweight Pub/Sub Store will be introduced:

```javascript
// State Shape
{
  shaderMode: 'quantum' | 'cyber' | 'plasma', // default: 'quantum'
  isMuted: boolean,                            // default: false
  isTerminalOpen: boolean,                    // default: false
  activeModalProjectId: string | null         // default: null
}

// API Methods
export const getAppState = () => ({ ...state });
export const setShaderMode = (mode) => { ... notifyListeners('shaderMode', mode); };
export const setMuted = (muted) => { ... notifyListeners('isMuted', muted); };
export const toggleTerminal = (open) => { ... notifyListeners('isTerminalOpen', open); };
export const subscribe = (key, callback) => { ... };
```

### 4.2 Web Audio Synthesizer Architecture (`src/audio/synth.js`)
Zero external assets. Audio is synthesized using native Web Audio API oscillators:
- **`AudioContext` Management**: Lazy initialization on first user gesture to comply with browser autoplay policies.
- **`playHover()`**: Sine oscillator 800Hz -> 1200Hz frequency sweep over 0.05s with exponential gain decay.
- **`playClick()`**: Dual square wave oscillator 300Hz / 600Hz snap over 0.08s.
- **`playScroll()`**: Low sine wave 150Hz thump over 0.04s.
- **`playThemeChange()`**: Harmonic tri-tone sweep (440Hz -> 659.25Hz -> 880Hz).
- **`toggleMute()` / `isMuted()`**: Master GainNode mute flag.

### 4.3 3D Shader Architecture (`src/three/`)
- `background.js`: Main background WebGL orchestrator holding active camera, renderer, and mouse parallax listener.
- `shaders/quantumMesh.js`: Group containing particle points, line segments, and instanced low-poly icosahedrons.
- `shaders/cyberGrid.js`: Group containing a plane geometry wireframe mesh with vertex height displacement driven by sine waves (`Math.sin(x * 0.5 + time) * 1.5`).
- `shaders/plasmaSphere.js`: Group containing a SphereGeometry with custom ShaderMaterial (vertex shader + fragment shader with procedural noise, pulsing rim lighting, and vibrant cyan/purple gradients).
- `modalPreview.js`: Separate lightweight WebGL scene & renderer attached to `#modal-3d-canvas`. Renders custom 3D geometries (e.g. laptop box, cyber cube, torus knot, icosahedron) with continuous rotation and drag response. Includes `destroy()` method disposing geometries, materials, textures, and renderer.

---

## 5. Proposed File Hierarchy

```
C:\Users\Jisan\.gemini\antigravity\scratch\interactive_3d_portfolio\
├── index.html                       # Updated with navbar EQ, theme switcher, terminal modal, R4 sections, modal 3D canvas
├── package.json
├── vite.config.js
├── src/
│   ├── main.js                      # Bootstrap orchestrator connecting R1-R5 components
│   ├── style.css                    # Updated CSS styles, glassmorphism, responsive breakpoints & animations
│   ├── audio/
│   │   └── synth.js                 # Web Audio API synthesizer engine & mute control
│   ├── state/
│   │   └── appState.js              # Centralized application pub/sub state manager
│   ├── hooks/
│   │   └── useAudio.js              # Event listener binder for UI hover/click/scroll sound triggers
│   ├── data/
│   │   ├── projects.js              # Project data + 3D preview model metadata
│   │   ├── experience.js            # Career timeline data
│   │   ├── skills.js                # Skills categories data
│   │   ├── testimonials.js          # Client & peer testimonials dataset (R4)
│   │   └── github.js                # GitHub 52-week activity dataset & statistics (R4)
│   ├── components/
│   │   ├── hero.js                  # Hero typing & stats counter
│   │   ├── projects.js              # Projects grid & filter pills
│   │   ├── modal.js                 # Project modal with 3D canvas lifecycle integration
│   │   ├── timeline.js              # Career timeline component
│   │   ├── skills.js                # Tech stack skills progress bars
│   │   ├── contact.js               # Glassmorphism contact form & validation
│   │   ├── themeSwitcher.js         # Navbar 3D shader mode switcher buttons (R1)
│   │   ├── terminal.js              # Ctrl+K Command Palette drawer & CLI parser (R2)
│   │   ├── audioControl.js          # Navbar Mute/Unmute EQ toggle button (R3)
│   │   ├── testimonials.js          # Touch/drag testimonials carousel with star ratings (R4)
│   │   └── githubGrid.js            # GitHub contribution heatmap & live stats (R4)
│   └── three/
│       ├── background.js            # Multi-mode WebGL background scene manager
│       ├── modalPreview.js          # Interactive 3D object preview renderer for modals (R5)
│       └── shaders/
│           ├── quantumMesh.js       # Quantum particle network scene group
│           ├── cyberGrid.js         # Cyber grid wave terrain scene group
│           └── plasmaSphere.js      # Glowing plasma sphere shader scene group
└── tests/                           # E2E test suite (Tiers 1 to 4 + R1-R5 verification)
```

---

## 6. Implementation Roadmap & Phased Dependency Ordering

```
[Phase 1: Foundation & Audio State] ---> [Phase 2: 3D Shader Switcher] ---> [Phase 3: Terminal Palette Ctrl+K]
                                                                                      |
                                                                                      v
[Phase 6: E2E Test Suite Upgrade] <--- [Phase 5: Modal 3D Preview] <--- [Phase 4: Testimonials & GitHub Grid]
```

### Phase Breakdown
1. **Phase 1: Foundation State & Web Audio (R3)**
   - Implement `src/state/appState.js`.
   - Implement `src/audio/synth.js` and `src/components/audioControl.js`.
   - Implement `src/hooks/useAudio.js` binding hover/click/scroll listeners.

2. **Phase 2: Multi-Mode 3D WebGL Switcher (R1)**
   - Create sub-scenes `quantumMesh.js`, `cyberGrid.js`, `plasmaSphere.js`.
   - Refactor `src/three/background.js` to manage active sub-scene switching without context loss.
   - Implement `src/components/themeSwitcher.js` navbar UI controls.

3. **Phase 3: Interactive Terminal Palette Ctrl+K (R2)**
   - Add `#terminal-modal` HTML drawer in `index.html`.
   - Implement `src/components/terminal.js` with shortcut listeners, CLI command execution, and state integration (`theme [1-3]`, section navigation).

4. **Phase 4: Testimonials Carousel & GitHub Activity Grid (R4)**
   - Create `src/data/testimonials.js` and `src/data/github.js`.
   - Add HTML section containers `#testimonials` and `#github-activity` to `index.html`.
   - Implement `src/components/testimonials.js` (touch/drag carousel, star ratings, dots).
   - Implement `src/components/githubGrid.js` (52-week heatmap grid, tooltips, stats).

5. **Phase 5: Interactive 3D Canvas Preview in Modals (R5)**
   - Update modal layout in `index.html` and `src/style.css` to 2-column layout.
   - Implement `src/three/modalPreview.js` with mouse drag rotation and project-specific 3D meshes.
   - Integrate modal preview initialization and strict WebGL disposal into `src/components/modal.js`.

6. **Phase 6: E2E Test Suite Extension & Verification**
   - Extend `tests/` E2E suite to include Tier 1 tests for R1-R5 features.
   - Run complete suite (`node run-e2e-tests.js`) to verify 100% pass status.

---

## 7. Risk Analysis & Mitigation Strategies

1. **Risk: WebGL Context Loss / Memory Leaks during Mode Switching (R1 & R5)**
   - *Mitigation*: Single persistent `WebGLRenderer` and `Scene` for background. Sub-scenes switch by adding/removing scene groups or toggling visibility/opacity rather than creating new contexts. For modal previews, explicitly call `geometry.dispose()`, `material.dispose()`, and `renderer.dispose()` on modal close.

2. **Risk: Web Audio Autoplay Policy Warnings (R3)**
   - *Mitigation*: `AudioContext` stays in `suspended` state until the first user interaction event (`click`, `keydown`, `pointerdown`), where `audioCtx.resume()` is safely called.

3. **Risk: Touch/Drag Event Conflicts on Testimonials Carousel (R4)**
   - *Mitigation*: Use standard Pointer Events API (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`) with `touch-action: pan-y` CSS property to prevent page scroll blocking while preserving touch drag smoothness.

4. **Risk: Layout Distortion in Project Modal (R5)**
   - *Mitigation*: Use responsive CSS grid/flexbox for modal body (`grid-template-columns: 1fr 1fr` on desktop, `1fr` stacked on mobile breakpoints).

---

## 8. Verification Strategy

1. **Static & Build Verification**:
   - Run `cmd.exe /c npm run build` to verify clean module bundling with Vite.
2. **Functional E2E Verification**:
   - Run `cmd.exe /c node run-e2e-tests.js` to confirm all 43 baseline tests and new R1-R5 test cases pass.
3. **Manual Interactive Verification**:
   - Test navbar theme switcher buttons for seamless 3D scene changes.
   - Press `Ctrl+K` to open command palette and run `help`, `theme 2`, `contact`, `clear`.
   - Toggle audio mute button in navbar and verify sound synthesis on button hover.
   - Swipe testimonials carousel and hover over GitHub heatmap contribution cells.
   - Open a project detail modal and interact with the rotating 3D preview shape.

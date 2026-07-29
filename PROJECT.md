# Project: 3D Interactive Portfolio Upgrade

## Mission & Overview
Upgrade the existing 3D Interactive Portfolio Website with advanced WebGL 3D modes, interactive terminal overlay (Ctrl+K), Web Audio micro-interactions with mute/EQ toggle, testimonials carousel & GitHub activity grid, and interactive 3D canvas previews inside project detail modals.

Target Directory: `C:\Users\Jisan\.gemini\antigravity\scratch\interactive_3d_portfolio`

## Architecture
- **Framework**: Vanilla JavaScript (ESM) / Vite 6 / CSS3 Glassmorphism System
- **3D Engine**: Three.js v0.174.0 (WebGLRenderer, ShaderMaterial, InstancedMesh, BufferGeometry)
- **Audio Engine**: Web Audio API Procedural Synthesizers (OscillatorNode, GainNode, BiquadFilterNode)
- **State Management**: Lightweight Pub/Sub Store (`src/state/appState.js`)

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Baseline Test Harness | Codebase audit, structure verification, build & test baseline | None | DONE |
| 2 | R1: Multi-Mode 3D WebGL Switcher | Quantum Mesh, Cyber Grid Wave, Glowing Plasma Sphere + Navbar Switcher | M1 | IN_PROGRESS |
| 3 | R2: Interactive Terminal & Palette | Ctrl+K floating terminal drawer supporting 8 CLI commands | M1 | PLANNED |
| 4 | R3: Web Audio & Mute Control | Web Audio API sound effects on hover/click/scroll + navbar EQ toggle | M1 | PLANNED |
| 5 | R4: Testimonials & GitHub Grid | Touch/drag carousel with star ratings + 52-week contribution heatmap | M1 | PLANNED |
| 6 | R5: Modal Interactive 3D Preview | 3D object preview canvas inside project detail modals with disposal | M1, M2 | PLANNED |
| 7 | Full E2E & Forensic Verification | Expanded test suite, 100% E2E test pass, production build, forensic integrity audit | M2-M6 | PLANNED |

## Interface Contracts & Data Schemas

### 1. Central State Store (`src/state/appState.js`)
- `getState()`: Returns `{ shaderMode: 'quantum'|'cyber'|'plasma', isMuted: boolean, isTerminalOpen: boolean, activeModalProjectId: string|null }`
- `setState(partialState)`: Merges state updates and notifies subscribers.
- `subscribe(listener)`: Subscribes listener callback `(state, prevState) => void`.

### 2. 3D Scene Switcher (`src/three/background.js`)
- `setShaderMode(mode)`: Transitions active 3D sub-scene (`quantumMesh`, `cyberGrid`, `plasmaSphere`).
- `initBackgroundScene(canvasElement)`: Initializes global WebGLRenderer, Camera, and sub-scenes.

### 3. Web Audio Synthesizer (`src/audio/synth.js`)
- `playHover()`, `playClick()`, `playScroll()`, `toggleMute()`, `isMuted()`
- Equalizer animation callback for navbar `#audio-eq`.

### 4. Command Palette CLI (`src/components/terminal.js`)
- `executeCommand(cmdStr)`: Parses CLI input and dispatches state updates or navigation scroll actions.
- Supported commands: `help`, `about`, `skills`, `projects`, `contact`, `theme [1-3]`, `download-cv`, `clear`.

### 5. Modal 3D Preview Renderer (`src/three/modalPreview.js`)
- `initModal3DPreview(canvasElement, projectData)`: Spawns lightweight Three.js canvas.
- `disposeModal3DPreview()`: Disposes materials, geometries, textures, and renderer.

## Code Layout
```
src/
├── audio/
│   └── synth.js              # Web Audio API procedural synthesizer & mute control
├── components/
│   ├── contact.js            # Contact form validation & confetti feedback
│   ├── githubActivity.js     # 52-week GitHub contribution heatmap grid
│   ├── hero.js               # Typing headline & quick stats counter
│   ├── modal.js              # Project detail modal with 3D canvas container
│   ├── navbar.js             # Theme switcher, Audio EQ toggle, Terminal button
│   ├── projects.js           # Interactive project grid & tag filtering
│   ├── skills.js             # Visual skill progress indicators
│   ├── terminal.js           # Ctrl+K command palette drawer & CLI processor
│   ├── testimonials.js       # Touch/drag review carousel with star ratings
│   └── timeline.js           # Visual career experience timeline
├── data/
│   ├── github.js             # 52-week commit activity & live stats dataset
│   ├── projects.js           # Project metadata & 3D preview geometry config
│   └── testimonials.js       # Testimonials dataset with ratings & avatars
├── state/
│   └── appState.js           # Pub/Sub application state management
├── three/
│   ├── background.js         # Main WebGL canvas renderer & mode manager
│   ├── cyberGrid.js          # Cyber Grid Wave 3D sub-scene (Mode 2)
│   ├── modalPreview.js       # Modal 3D object preview canvas renderer
│   ├── plasmaSphere.js       # Glowing Plasma Sphere 3D sub-scene (Mode 3)
│   └── quantumMesh.js        # Quantum Particle Mesh 3D sub-scene (Mode 1)
├── main.js                   # Application bootstrap & event listeners
└── style.css                 # Glassmorphism styling, layout, theme modes, terminal
```

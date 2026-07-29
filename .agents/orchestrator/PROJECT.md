# Project: Interactive 3D Portfolio Website

## Architecture
- Tech Stack: Vite + HTML5 / CSS3 / JavaScript (ES6+) + Three.js + WebGL + Google Fonts (Inter, Outfit) + FontAwesome / SVG Icons.
- Design System: Dark mode aesthetic, vibrant cyan/neon accents (#00f2fe, #4facfe, #7f00ff), glassmorphic UI cards (backdrop-filter: blur(12px), semi-transparent border and background), micro-interactions, responsive grid/flexbox.
- 3D WebGL Scene: Three.js background canvas with animated floating geometric particles / interactive node network, mouse-driven parallax camera movement, responsive resize handler.
- Core Modules:
  - `index.html`: Main HTML structure with semantic sections (Hero, Projects, Experience, Skills, Contact, Modals).
  - `src/styles/`: Glassmorphism CSS, neon themes, typography, responsive breakpoints, animations.
  - `src/three/`: Three.js scene setup, particle network, camera controller, animation loop, resize listener.
  - `src/components/`: Hero typing effect, Project filtering & Modal manager, Timeline, Skills grid, Contact form validator.
  - `src/main.js`: Main entry point initializing 3D canvas and UI component controllers.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | E2E Test Suite (Testing Track) | Comprehensive E2E test infra & runner (Tiers 1-4) | none | DONE |
| M1 | Project Setup & Layout Base | Vite setup, HTML template, CSS glassmorphism system | none | DONE |
| M2 | 3D WebGL Background Scene | Three.js particle node network, mouse camera tracking | M1 | DONE |
| M3 | Hero Section & Typing Effect | Hero UI, typing animation, quick stats, CTAs | M1 | DONE |
| M4 | Projects Showcase & Modals | Dynamic filter tags, animated grid, modal overlays | M1 | DONE |
| M5 | Experience & Skills Grids | Interactive timeline, skills progress bars & badges | M1 | DONE |
| M6 | Contact Form & Validation | Glassmorphism form, live validation, success UI | M1 | DONE |
| M7 | E2E Verification & Hardening | 100% E2E test pass (Phase 1) & Adversarial test (Phase 2) | M0..M6 | DONE |

## Interface Contracts
### 3D Scene Controller (`src/three/scene.js`)
- `initScene(containerId)`: Initializes Three.js renderer, camera, lights, particle network.
- `onMouseMove(x, y)`: Updates camera target or particle cursor attraction.
- `onResize()`: Updates camera aspect ratio and renderer size.

### Project Filter Manager (`src/components/projects.js`)
- `initProjects(projectsData)`: Renders project cards into grid.
- `filterProjects(categoryTag)`: Filters visible cards with smooth fade/scale transition.
- `openProjectModal(projectId)`: Displays backdrop overlay and populates modal content.

### Contact Form Validator (`src/components/contact.js`)
- `validateField(fieldElement)`: Checks required rules, email format, updates feedback UI.
- `handleFormSubmit(event)`: Prevents default, validates all fields, shows success modal/card state.

## Code Layout
- `index.html`
- `package.json`
- `vite.config.js`
- `src/`
  - `main.js`
  - `style.css`
  - `three/`
    - `background.js`
  - `data/`
    - `projects.js`
    - `experience.js`
    - `skills.js`
  - `components/`
    - `hero.js`
    - `projects.js`
    - `modal.js`
    - `timeline.js`
    - `skills.js`
    - `contact.js`

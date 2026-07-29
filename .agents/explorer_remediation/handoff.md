# Technical Remediation Strategy & Refactoring Plan — E2E Test Suite Rewiring

## 1. Observation

### Summary of VETO Findings from `reviewer_2/handoff.md`
`reviewer_2` flagged a critical **INTEGRITY VIOLATION** resulting in a **VETO / REQUEST_CHANGES** verdict:
- `run-e2e-tests.js` and all test suites in `tests/*.test.js` import `createPortfolioDOMEnvironment()` from `tests/setup-dom.js`.
- `tests/setup-dom.js` (lines 401–836) constructs its own simulated DOM tree and attaches hardcoded mock event handlers (`updateTyping`, `renderLoop`, filter listeners, contact form validation) defined entirely within `setup-dom.js`.
- **Zero imports from `src/`**: None of the test files import `src/main.js`, `src/components/hero.js`, `src/components/projects.js`, `src/components/modal.js`, `src/components/timeline.js`, `src/components/skills.js`, `src/components/contact.js`, or `src/three/background.js`.
- **Result**: Breaking changes or bugs introduced in `src/` do not cause `node run-e2e-tests.js` to fail, rendering the test suite a self-certifying facade.

### Deep Comparison: Fake Mock DOM (`setup-dom.js`) vs Real Production (`index.html` & `src/`)

| Feature Subsystem | Fake Mock DOM (`setup-dom.js`) | Real Production (`index.html` & `src/`) | Assertion Impact |
|---|---|---|---|
| **HTML Hierarchy** | Hardcoded programmatically created dummy nodes (`#app`, `#hero`, `#projects`, `#timeline`, `#skills-grid`, `#contact-form`). | Rich production `index.html` containing `#bg-canvas`, `.navbar`, `#hero`, `#hero-typing`, `.stat-number`, `#projects-grid`, `#project-filters`, `#timeline-container`, `#skills-container`, `#contact-form`, `#name-error`, `#email-error`, `#subject-error`, `#message-error`, `#contact-success`, `#project-modal`. | Tests must load `index.html` into `document.body` instead of building artificial nodes. |
| **Hero Component** | `.stat-item` with static strings (`'5+ Years Exp'`). Manual `updateTyping()` helper. | `src/components/hero.js`: `.stat-number` with `data-target="5"`, `"24"`, `"15"`, animated via quadratic ease-out. Dynamic typing effect updating `#hero-typing`. | Test `T1_Hero_3` & `T4_RealWorld_1` must query `.stat-number` and `data-target` instead of `.stat-item`. |
| **Projects Showcase** | Filter buttons use `data-filter` attribute. Cards use inline `display` toggling. | `src/components/projects.js`: Filter buttons rendered dynamically with `data-category` attribute. Cards rendered from `projectsData` with `data-id`. Filter transition uses `setTimeout(..., 200)` and re-renders grid. | Filter tag tests must query `[data-category]` instead of `[data-filter]`. Tests must handle/advance timers for `renderGrid()`. |
| **Modal Overlay** | Uses classes `modal-visible` and `modal-hidden`. Close button text `'X'`. | `src/components/modal.js`: Toggles class `active` on `#project-modal` and updates attribute `aria-hidden` (`'false'` / `'true'`). Close button ID `#modal-close`. Locks `document.body.style.overflow`. | Tests `T1_Proj_5`, `T3_Cross_1`, `T3_Cross_3`, `T3_Cross_4`, `T4_RealWorld_1`, `T4_RealWorld_2` must check `classList.contains('active')`, `aria-hidden`, and `#modal-close`. |
| **Timeline Section** | Static items inside `#timeline`. | `src/components/timeline.js`: Dynamic rendering from `experienceData` into `#timeline-container` with `.timeline-item`, `.timeline-marker`, `.timeline-content`, `.timeline-period`, `.timeline-role`, `.timeline-company`, `.timeline-summary`. | Tests must query `#timeline-container` instead of `#timeline`. |
| **Skills Grid** | Static `.skill-card` inside `#skills-grid` with `.skill-progress-bar`. | `src/components/skills.js`: Dynamic category cards rendered into `#skills-container` with `.skill-category-card`, `.skill-item`, `.skill-name`, `.skill-percent`, `.progress-bar-fill` (`data-level`). | Tests must query `#skills-container` and `.progress-bar-fill` instead of `#skills-grid`. |
| **Contact Form** | Single `.form-feedback` container for errors. Success sets `.success-message` `style.display = 'block'`. | `src/components/contact.js`: Field-specific error containers `#name-error`, `#email-error`, `#subject-error`, `#message-error`. Inputs toggle `is-invalid` / `is-valid` classes. Form submission uses `setTimeout(..., 1000)` delay, resets inputs, hides `#contact-form`, and removes `hidden` class from `#contact-success`. | Tests `T1_Contact_2`–`T1_Contact_5`, `T2_Boundary_1`, `T2_Boundary_2`, `T3_Cross_2`, `T3_Cross_5`, `T4_RealWorld_1`, `T4_RealWorld_2` must target field-specific error elements (`#name-error`, `#email-error`), input `is-invalid` class, and `#contact-success` visibility (`!classList.contains('hidden')`). |
| **3D WebGL Background** | Canvas `#webgl-canvas` inside `#canvas-container`. | `src/three/background.js`: Initialized on `#bg-canvas`. Particle constellation, instanced icosahedrons, line segments, mouse parallax pointermove, tab visibility listener. | Canvas element target must be `#bg-canvas`. |

---

## 2. Logic Chain

1. **Premise 1**: The goal of an E2E test suite is to guarantee that the application production code (`src/`) operates correctly against the application DOM (`index.html`).
2. **Premise 2**: Currently, `tests/setup-dom.js` creates a mock environment with inline logic, bypassing `src/`.
3. **Step 1 — Real HTML Ingestion**: By updating `tests/setup-dom.js` to read `index.html` from disk and parse its HTML tree into `document.body`, the DOM layout becomes 100% authentic to production.
4. **Step 2 — Direct Production Module Execution**: By importing `initHeroComponent`, `initProjectsComponent`, `initModalComponent`, `initTimelineComponent`, `initSkillsComponent`, `initContactComponent`, and `initBackgroundScene` directly into `tests/setup-dom.js` and executing them during environment setup, the actual production JavaScript code attaches listeners, populates dynamic grids, and manages state.
5. **Step 3 — Timer & Event Synchronization**: Production modules like `projects.js` and `contact.js` utilize `setTimeout` (200ms for grid fade-in, 1000ms for form submit). The test environment in `setup-dom.js` must provide synchronous timer advancement utilities (`window.stepTimers(ms)` or immediate timeout execution) so tests execute predictably without relying on real-time delays.
6. **Step 4 — Assertion Alignment**: Updating test assertions in `tier1_features.test.js`, `tier2_boundary.test.js`, `tier3_cross.test.js`, and `tier4_realworld.test.js` to target real production IDs (`#bg-canvas`, `#hero-typing`, `#project-filters`, `#projects-grid`, `#timeline-container`, `#skills-container`, `#contact-form`, `#name-error`, `#email-error`, `#contact-success`, `#project-modal`) ensures every single assertion validates real `src/` component outputs.
7. **Conclusion**: Completing this 4-step remediation plan eliminates the self-certifying facade and restores complete integrity to the E2E test suite.

---

## 3. Caveats & Architectural Considerations

1. **Node.js ESM Module Execution & Global Mocks**:
   - `src/` modules use global objects (`document`, `window`, `IntersectionObserver`, `performance`).
   - `tests/setup-dom.js` must establish `global.document`, `global.window`, `global.IntersectionObserver`, `global.performance`, `global.requestAnimationFrame`, `global.cancelAnimationFrame`, and `global.setTimeout` BEFORE importing or executing `src/` modules.

2. **WebGL Context Mocks for Three.js**:
   - `src/three/background.js` imports `three` and instantiates `THREE.WebGLRenderer({ canvas })`.
   - Three.js requires specific WebGL context methods/constants on `canvas.getContext('webgl')`:
     - `createShader`, `shaderSource`, `compileShader`, `getShaderParameter`, `getShaderInfoLog`, `createProgram`, `attachShader`, `linkProgram`, `getProgramParameter`, `useProgram`, `createBuffer`, `bindBuffer`, `bufferData`, `enable`, `disable`, `depthFunc`, `blendFunc`, `viewport`, `clearColor`, `clear`, `createTexture`, `bindTexture`, `texImage2D`, `texParameteri`, `getShaderPrecisionFormat`, `getExtension`, `getParameter`.
   - `SimulatedWebGLContext` in `tests/setup-dom.js` must provide robust no-op / stub implementations of these methods so `initBackgroundScene` initializes without throwing WebGL errors.

3. **Asynchronous Operations in Tests**:
   - `projects.js` uses `setTimeout(..., 200)` inside `renderGrid()`. When a filter button is clicked during tests, the test helper must auto-flush or advance pending timeouts (e.g. `window.flushTimeouts()`) so the DOM grid updates synchronously before test assertions run.
   - `contact.js` uses `setTimeout(..., 1000)` on form submission. `T1_Contact_4`, `T4_RealWorld_1`, and `T4_RealWorld_2` must flush timeouts after dispatching the `submit` event to trigger the success UI transition.

---

## 4. Remediation Blueprint & Concrete File Modifications

### A. Refactoring `tests/setup-dom.js`

1. **HTML Parsing Engine**:
   - Add a lightweight, robust HTML parser `parseHTML(htmlString)` to `setup-dom.js` that recursively converts HTML tags and attributes into `SimulatedElement` nodes attached to `document.body`.
   - Load `index.html` via `fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8')`.

2. **Global Environment Mocks**:
   - Provide `MockIntersectionObserver` class with `observe()`, `unobserve()`, `disconnect()` methods, auto-triggering `isIntersecting: true` callbacks so skills and hero counter animations run cleanly.
   - Expand `SimulatedWebGLContext` with complete WebGL 1.0 stubs required by Three.js.
   - Expand `SimulatedWindow` with timer management: `setTimeout`, `clearTimeout`, `flushTimeouts()`, `stepFrames()`, `resize()`.

3. **Production Module Ingestion**:
   - Import `initHeroComponent` from `../src/components/hero.js`
   - Import `initProjectsComponent` from `../src/components/projects.js`
   - Import `initModalComponent`, `openProjectModal`, `closeModal` from `../src/components/modal.js`
   - Import `initTimelineComponent` from `../src/components/timeline.js`
   - Import `initSkillsComponent` from `../src/components/skills.js`
   - Import `initContactComponent` from `../src/components/contact.js`
   - Import `initBackgroundScene` from `../src/three/background.js`

4. **Environment Initialization Function (`createPortfolioDOMEnvironment()`)**:
   ```javascript
   export function createPortfolioDOMEnvironment() {
     const document = new SimulatedDocument();
     const window = new SimulatedWindow(document);
     
     global.document = document;
     global.window = window;
     global.IntersectionObserver = MockIntersectionObserver;
     global.performance = { now: () => Date.now() };

     // Parse real index.html into document.body
     const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
     parseHTML(html, document);

     // Initialize production UI & 3D background modules
     initHeroComponent();
     initModalComponent();
     initProjectsComponent();
     initTimelineComponent();
     initSkillsComponent();
     initContactComponent();

     const bgCanvas = document.getElementById('bg-canvas');
     if (bgCanvas) {
       initBackgroundScene(bgCanvas);
     }

     return {
       document,
       window,
       webglContext: bgCanvas ? bgCanvas.getContext('webgl') : null,
       openProjectModal,
       closeModal
     };
   }
   ```

---

### B. Refactoring Test Files (`tests/*.test.js`)

#### 1. `tests/tier1_features.test.js`
- **`T1_Hero_1`**: Query `h1.hero-headline` (check text `"Crafting Immersive 3D Digital Experiences"`), `#hero-typing`, `a[href="#projects"]`, `a[href="#contact"]`.
- **`T1_Hero_2`**: Check `#hero-typing` text updates.
- **`T1_Hero_3`**: Query `.stat-number` elements (verify `data-target` attributes `"5"`, `"24"`, `"15"` and text content `"5+"`, `"24+"`, `"15+"`).
- **`T1_Hero_4` & `T1_Hero_5`**: Assert anchor `href` attributes match `#projects` and `#contact`.
- **`T1_3D_1`–`T1_3D_5`**: Target canvas `#bg-canvas`.
- **`T1_Proj_1`–`T1_Proj_4`**: Query `.filter-btn` with `data-category="web"`, `data-category="all"`. Call `window.flushTimeouts()` after click to execute `projects.js`'s `renderGrid()`. Verify `.project-card` count and tags.
- **`T1_Proj_5`**: Click `.project-card`, verify `#project-modal` has class `active` and `aria-hidden="false"`, modal title matches project title.
- **`T1_Exp_1`–`T1_Exp_5`**: Query `#timeline-container` and `.timeline-item` (verify `.timeline-role`, `.timeline-company`, `.timeline-period`).
- **`T1_Skills_1`–`T1_Skills_5`**: Query `#skills-container` and `.skill-category-card` (verify `.progress-bar-fill` and `.skill-percent`).
- **`T1_Contact_1`–`T1_Contact_5`**: Query `#contact-form`, `#contact-name`, `#contact-email`, `#contact-subject`, `#contact-message`, `#contact-submit`. Verify field error elements `#name-error`, `#email-error`, `#subject-error`, `#message-error` and `is-invalid` input class on empty/invalid submit. On valid submit, flush timeouts and verify `#contact-success` does not have `hidden` class.

#### 2. `tests/tier2_boundary.test.js`
- **`T2_Boundary_1`**: Submit empty form, check `#name-error` displays `"Name is required."`, check submit button remains enabled.
- **`T2_Boundary_2`**: Iterate malformed emails array, dispatch `submit`, verify `#email-error` displays `"Please enter a valid email address."` for each.
- **`T2_Boundary_3`**: Rapid click filter buttons `[data-category="web"]`, `[data-category="ai"]`, `[data-category="mobile"]`, `[data-category="all"]`. Flush timeouts, verify final state.
- **`T2_Boundary_4`**: Resize window across breakpoints, verify canvas width/height update.
- **`T2_Boundary_5`**: Dispatch `error` event on `.project-thumbnail img`, verify fallback image source.

#### 3. `tests/tier3_cross.test.js`
- **`T3_Cross_1`**: Click `[data-category="ai"]`, flush timeouts, click AI card, verify modal `active`, click `#modal-close`, verify modal `aria-hidden="true"`.
- **`T3_Cross_2`**: Step WebGL frames while submitting invalid form, check `#name-error` text and WebGL render calls.
- **`T3_Cross_3`**: Open modal, resize window to mobile, check `#project-modal` stays `active` and canvas resizes.
- **`T3_Cross_4`**: Open modal, click filter tag `[data-category="ai"]`, flush timeouts, verify modal stays `active`.
- **`T3_Cross_5`**: Submit form with invalid email, check `#email-error`, resize window, verify `#email-error` retains text.

#### 4. `tests/tier4_realworld.test.js`
- **`T4_RealWorld_1`**: Full journey: land on hero -> click project CTA -> filter `"web"` -> open modal -> close modal -> inspect timeline items -> inspect skills cards -> fill contact form -> submit -> flush timeouts -> verify `#contact-success` visible (`!classList.contains('hidden')`).
- **`T4_RealWorld_2`**: Heavy stress test: rapid tag filtering -> open/close 3 modals -> invalid form submits -> valid form submit -> window resize.
- **`T4_RealWorld_3`**: WebGL background frame audit across user interactions: step 30 frames -> pointermove -> filter click -> step 20 frames -> audit 50 render calls.

---

## 5. Verification Method

To independently verify the complete rewiring and integrity of the refactored test suite:

1. **Execute E2E Test Suite**:
   ```cmd
   cmd.exe /c node run-e2e-tests.js
   ```
   Verify 43/43 tests pass cleanly against the real `src/` modules.

2. **Negative Invalidation Verification (Integrity Test)**:
   - Temporarily break email validation in `src/components/contact.js` (e.g. change error message from `'Please enter a valid email address.'` to `'INVALID_EMAIL'`).
   - Run `node run-e2e-tests.js` — observe that `T1_Contact_3`, `T2_Boundary_2`, `T3_Cross_5`, and `T4_RealWorld_2` **FAIL** with explicit error messages.
   - Revert the change in `src/components/contact.js` and re-run `node run-e2e-tests.js` — observe 43/43 tests **PASS**.
   - This proves beyond doubt that the test suite directly evaluates production source code in `src/`.

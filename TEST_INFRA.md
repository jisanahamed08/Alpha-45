# E2E Test Infrastructure & Suite Architecture (`TEST_INFRA.md`)

## Overview
This document details the architectural design, feature inventory, methodology, and execution framework for the **Interactive 3D Portfolio** E2E Test Suite created during Dual Track Milestone M0.

The test infrastructure is designed for **opaque-box requirement-driven testing**, validating functional contracts across the full lifecycle of the web application — including 3D WebGL canvas initialization and frame loop rendering, hero typing effects, dynamic project grid filtering and modal overlays, chronological experience/education timelines, skills progress bars, and glassmorphic contact form validation.

---

## Architecture & Framework Setup

### 1. Test Harness (`tests/setup-dom.js`)
- **Simulated Browser DOM Environment**: Zero-dependency, high-performance DOM simulation providing `SimulatedElement`, `SimulatedDocument`, `SimulatedWindow`, and `SimulatedEvent`.
- **Full Selector Matcher**: Supports IDs (`#id`), CSS classes (`.class`), tag names (`button`), and compound attribute selectors (e.g. `.filter-btn[data-filter="web"]`, `input[name="email"]`).
- **WebGL Context & Animation Loop Emulator**:
  - `canvas.getContext('webgl')` stub tracking shaders, buffers, clear colors, and render draw calls (`drawArrays`).
  - `window.requestAnimationFrame` and `window.cancelAnimationFrame` frame stepping engine for background particle rendering verification.
  - Window `resize` event and mouse tracking (`mousemove`) listener simulation.

### 2. Test Execution Engine (`run-e2e-tests.js` / `tests/e2e.test.js`)
- Executable natively via:
  - `node run-e2e-tests.js`
  - `npm test`
- Organizes 43 test cases into 4 distinct tiers with detailed console output logging, timing, and pass/fail summary reporting.

---

## Feature Inventory & Test Tier Matrix

| Tier | Tier Name | Focus Area | Test Count | Description |
|------|-----------|------------|------------|-------------|
| **Tier 1** | Feature Coverage | Individual Feature Verification | 30 | 5 test cases per feature across 6 core features |
| **Tier 2** | Boundary & Corner Cases | Edge Cases & Error Boundaries | 5 | Empty submissions, invalid email formats, rapid tag switching, breakpoint resizing, missing asset fallbacks |
| **Tier 3** | Cross-Feature Combinations | Multi-Component Interaction | 5 | Project filter + modal state, form validation during 3D WebGL loop, navigation + canvas resize |
| **Tier 4** | Real-World Scenarios | End-to-End User Journeys | 3 | Full site navigation flow, stress test journey, 3D WebGL continuous frame audit |
| **TOTAL** | | | **43** | **100% Comprehensive E2E Coverage** |

---

## Detailed Test Case Inventory

### Tier 1: Feature Coverage (30 Tests)
#### Feature 1: Hero Section & Typing Effect (5 Tests)
- `T1_Hero_1`: Hero container `#hero` rendering headline, typing element, and CTAs.
- `T1_Hero_2`: Dynamic typing effect content updates on animation ticks.
- `T1_Hero_3`: Quick stats counter/cards rendering in Hero section.
- `T1_Hero_4`: Primary CTA button ("View Work") triggers navigation target to `#projects`.
- `T1_Hero_5`: Secondary CTA button ("Contact Me") triggers navigation target to `#contact`.

#### Feature 2: 3D WebGL Background Canvas (5 Tests)
- `T1_3D_1`: `#webgl-canvas` element creation and DOM attachment.
- `T1_3D_2`: WebGL context initialization (`canvas.getContext('webgl')`).
- `T1_3D_3`: `requestAnimationFrame` loop execution and render call incrementing.
- `T1_3D_4`: Mouse movement listener tracking cursor coordinates.
- `T1_3D_5`: Window resize listener updating canvas dimensions.

#### Feature 3: Projects Showcase & Tag Filter (5 Tests)
- `T1_Proj_1`: Projects grid `#projects-grid` initial card rendering.
- `T1_Proj_2`: Filter tag buttons rendering (`all`, `web`, `ai`, `mobile`).
- `T1_Proj_3`: Tag filtering ("web") updating card visibility and `.active` button class.
- `T1_Proj_4`: Tag filtering ("all") restoring visibility to all project cards.
- `T1_Proj_5`: Project card click opening modal overlay `#project-modal` with title and description.

#### Feature 4: Experience & Education Timeline (5 Tests)
- `T1_Exp_1`: Timeline container `#timeline` rendering chronological milestone nodes.
- `T1_Exp_2`: Milestone items containing role, company, date badge, and description.
- `T1_Exp_3`: Timeline items indexed via data attributes for chronological ordering.
- `T1_Exp_4`: `#experience` section container existing cleanly in DOM.
- `T1_Exp_5`: Date badges presenting correctly formatted period strings.

#### Feature 5: Skills Tech Stack Grid (5 Tests)
- `T1_Skills_1`: Skills grid `#skills-grid` rendering tech stack cards.
- `T1_Skills_2`: Skill card containing name, progress container, and percentage.
- `T1_Skills_3`: Progress bar width matching skill percentage data (`95%`, `98%`, etc.).
- `T1_Skills_4`: Skill cards assigned category metadata attributes (`data-category`).
- `T1_Skills_5`: `#skills` section container existing cleanly in DOM.

#### Feature 6: Contact Form & Validation (5 Tests)
- `T1_Contact_1`: `#contact-form` rendering name, email, subject, message inputs and submit button.
- `T1_Contact_2`: Empty form submission triggering required field validation error feedback.
- `T1_Contact_3`: Invalid email format submission triggering format warning.
- `T1_Contact_4`: Valid form submission displaying success feedback message UI.
- `T1_Contact_5`: Successful submission resetting form input values to empty.

---

### Tier 2: Boundary & Corner Cases (5 Tests)
- `T2_Boundary_1` (Empty Field Submission): Submitting blank form cancels submit event, leaves button enabled for correction, displays error message.
- `T2_Boundary_2` (Invalid Email Formats): Rejects malformed emails (`plainaddress`, `@missinguser.com`, `user@.com`, `user@domain..com`, `user@domain`).
- `T2_Boundary_3` (Rapid Tag Switching): Executes rapid clicks (`all` -> `web` -> `ai` -> `mobile` -> `all`) and confirms consistent final active button and card state.
- `T2_Boundary_4` (Screen Resizing Simulation): Resizes screen through mobile (320px), tablet (768px), desktop (1440px), and 4K (2560px), verifying canvas dimensions update.
- `T2_Boundary_5` (Missing Asset Fallbacks): Dispatches `error` event on project card image, verifying fallback image assignment without unhandled exceptions.

---

### Tier 3: Cross-Feature Combinations (5 Tests)
- `T3_Cross_1` (Project Filter + Modal Interaction): Filters to "ai", opens modal, closes modal, changes filter to "mobile" — verifies modal content syncs and grid updates.
- `T3_Cross_2` (Form Validation during Active 3D WebGL Loop): Steps 20 frames while submitting invalid form — verifies frame loop continues uninterrupted.
- `T3_Cross_3` (Responsive Nav + Active Modal & Canvas): Resizes window to mobile while modal is active and clicks CTA links — verifies modal state and navigation target.
- `T3_Cross_4` (Filter Tag Selection with Open Modal): Clicks filter tag while project modal is active — verifies modal remains visible while background grid updates.
- `T3_Cross_5` (Window Resize during Form Feedback): Resizes window while error message is displayed — verifies feedback message persists cleanly.

---

### Tier 4: Real-World Application Scenarios (3 Tests)
- `T4_RealWorld_1` (Full End-to-End User Journey): Simulates top-to-bottom user flow (Hero -> CTA -> Projects -> Filter -> Modal -> Timeline -> Skills -> Contact Form Submission -> Success State).
- `T4_RealWorld_2` (Heavy Interaction Stress Test): Performs 10 rapid filter clicks, 3 modal toggles, 3 invalid form submissions followed by correction, and screen resize.
- `T4_RealWorld_3` (3D WebGL Frame Audit): Audits WebGL render calls across full user interactive session, confirming continuous animation frame stepping (50 frames total).

---

## Verification & Execution Instructions
To execute the E2E test runner:
```bash
# Option 1: Direct Node execution
node run-e2e-tests.js

# Option 2: npm test script execution
npm test
```
Both commands report 100% test pass status.

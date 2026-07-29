/**
 * tier3_cross.test.js - Tier 3 Cross-Feature Combination Tests (5 tests)
 * Coverage: Project filtering + modal open/close, contact form during active WebGL loop,
 * responsive nav interaction with canvas & modal, filter tag change while modal open,
 * screen resize during contact form error feedback.
 */

import assert from 'node:assert';
import { createPortfolioDOMEnvironment, SimulatedEvent } from './setup-dom.js';

export function runTier3Tests() {
  const results = [];

  function test(name, fn) {
    try {
      const env = createPortfolioDOMEnvironment();
      fn(env);
      results.push({ name, passed: true });
    } catch (err) {
      results.push({ name, passed: false, error: err.message });
    }
  }

  // 1. Project filtering + modal opening/closing
  test('T3_Cross_1: Filtering to "webgl" category and opening modal displays correct project details, then closing modal restores UI state', ({ document, window }) => {
    // Step 1: Filter to webgl
    const webglBtn = document.querySelector('.filter-btn[data-category="webgl"]');
    webglBtn.click();
    window.flushTimeouts();

    // Step 2: Get visible card and click it
    const webglCard = document.querySelector('#projects-grid .project-card');
    const webglTitle = webglCard.querySelector('.project-title').textContent;
    webglCard.click();

    // Step 3: Verify Modal Overlay contains webgl title
    const modal = document.getElementById('project-modal');
    assert.strictEqual(modal.classList.contains('active'), true, 'Modal should be active');
    assert.strictEqual(modal.getAttribute('aria-hidden'), 'false', 'Modal aria-hidden should be false');
    const modalTitle = modal.querySelector('.modal-title').textContent;
    assert.strictEqual(modalTitle, webglTitle, 'Modal title should match clicked webgl project');

    // Step 4: Close modal
    const closeBtn = document.getElementById('modal-close');
    closeBtn.click();
    assert.strictEqual(modal.classList.contains('active'), false, 'Modal active class should be removed');
    assert.strictEqual(modal.getAttribute('aria-hidden'), 'true', 'Modal aria-hidden should be true');

    // Step 5: Change filter to ai
    const aiBtn = document.querySelector('.filter-btn[data-category="ai"]');
    aiBtn.click();
    window.flushTimeouts();
    const aiCards = document.querySelectorAll('#projects-grid .project-card');
    assert.ok(aiCards.length > 0, 'AI filter grid should render project cards');
  });

  // 2. Contact form validation during active WebGL background rendering loop
  test('T3_Cross_2: Contact form submission validation runs while WebGL animation frame loop is continuously stepping', ({ document, window, webglContext }) => {
    const initialRenderCalls = webglContext.renderCalls;

    // Step 5 frames
    window.stepFrames(5);

    // Perform form invalid submission
    const form = document.getElementById('contact-form');
    form.dispatchEvent(new SimulatedEvent('submit', { cancelable: true }));

    // Step another 15 frames
    window.stepFrames(15);

    assert.ok(webglContext.renderCalls >= initialRenderCalls + 20, 'WebGL render calls should continue throughout form interaction');

    const nameError = document.getElementById('name-error');
    assert.strictEqual(nameError.textContent, 'Name is required.', 'Form validation error feedback should be displayed');
  });

  // 3. Responsive navigation interaction with modal overlays and canvas sizing
  test('T3_Cross_3: Clicking navigation links while modal is active and resizing window preserves modal state and updates canvas', ({ document, window }) => {
    // Open modal
    const card = document.querySelector('#projects-grid .project-card');
    card.click();
    const modal = document.getElementById('project-modal');
    assert.strictEqual(modal.classList.contains('active'), true);

    // Resize window to mobile width
    window.resize(375, 812);
    const canvas = document.getElementById('bg-canvas');
    assert.strictEqual(canvas.width, 375);
    assert.strictEqual(canvas.height, 812);

    // Modal should remain active
    assert.strictEqual(modal.classList.contains('active'), true, 'Modal active state should persist across resize');

    // Click CTA Contact
    const ctaContact = document.querySelector('a[href="#contact"]');
    ctaContact.click();
    assert.strictEqual(window.lastNavTarget, '#contact');
  });

  // 4. Tag filtering triggering background grid update while modal is open
  test('T3_Cross_4: Clicking a filter tag while project modal is active updates background grid display without closing modal', ({ document, window }) => {
    // Open project modal
    const card = document.querySelector('#projects-grid .project-card');
    card.click();

    const modal = document.getElementById('project-modal');
    assert.strictEqual(modal.classList.contains('active'), true);

    // Programmatically click filter tag "ai"
    const aiBtn = document.querySelector('.filter-btn[data-category="ai"]');
    aiBtn.click();
    window.flushTimeouts();

    // Modal is still active
    assert.strictEqual(modal.classList.contains('active'), true, 'Modal overlay must stay active');

    // Background card grid has updated
    const aiCards = document.querySelectorAll('#projects-grid .project-card');
    assert.ok(aiCards.length > 0, 'Grid should re-render cards behind modal');
  });

  // 5. Canvas resize listener triggering while contact form feedback is displayed
  test('T3_Cross_5: Window resize event while contact form feedback is active preserves feedback content', ({ document, window }) => {
    const form = document.getElementById('contact-form');
    document.getElementById('contact-name').value = 'John Doe';
    document.getElementById('contact-email').value = 'invalid-email';
    form.dispatchEvent(new SimulatedEvent('submit', { cancelable: true }));

    const emailError = document.getElementById('email-error');
    const errText = emailError.textContent;
    assert.strictEqual(errText, 'Please enter a valid email address.');

    // Resize window
    window.resize(1024, 768);

    assert.strictEqual(emailError.textContent, errText, 'Error feedback text should remain unchanged after resize');
  });

  return results;
}

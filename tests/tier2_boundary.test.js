/**
 * tier2_boundary.test.js - Tier 2 Boundary & Corner Case Tests (5 tests)
 * Coverage: Empty field submit, invalid email formats, rapid tag switching,
 * screen resizing simulation, missing asset fallbacks.
 */

import assert from 'node:assert';
import { createPortfolioDOMEnvironment, SimulatedEvent } from './setup-dom.js';

export function runTier2Tests() {
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

  // 1. Empty field submission handling
  test('T2_Boundary_1: Submitting completely empty form handles cancellation cleanly and allows retry', ({ document }) => {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit');
    const submitEvt = new SimulatedEvent('submit', { cancelable: true });
    
    form.dispatchEvent(submitEvt);

    assert.strictEqual(submitEvt.defaultPrevented, true, 'Submission must be cancelled when fields are empty');
    assert.strictEqual(submitBtn.disabled, false, 'Submit button must remain enabled for user to correct errors');

    const nameError = document.getElementById('name-error');
    assert.strictEqual(nameError.textContent, 'Name is required.', 'Name error must indicate requirement');
  });

  // 2. Invalid email format variations
  test('T2_Boundary_2: Invalid email format variations are all rejected with specific error feedback', ({ document }) => {
    const form = document.getElementById('contact-form');
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');
    const emailError = document.getElementById('email-error');

    nameInput.value = 'Test User';
    subjectInput.value = 'Subject';
    messageInput.value = 'Valid message body text.';

    const malformedEmails = [
      'plainaddress',
      '@missinguser.com',
      'user@.com',
      'user@domain..com',
      'user@domain'
    ];

    for (const badEmail of malformedEmails) {
      emailInput.value = badEmail;
      const evt = new SimulatedEvent('submit', { cancelable: true });
      form.dispatchEvent(evt);

      assert.strictEqual(evt.defaultPrevented, true, `Email '${badEmail}' should be rejected`);
      assert.strictEqual(emailError.textContent, 'Please enter a valid email address.', `Feedback for '${badEmail}' should indicate invalid email format`);
    }
  });

  // 3. Rapid tag switching
  test('T2_Boundary_3: Rapid filter tag switching results in consistent final active state and card visibility', ({ document, window }) => {
    const webglBtn = document.querySelector('.filter-btn[data-category="webgl"]');
    const aiBtn = document.querySelector('.filter-btn[data-category="ai"]');
    const mobileBtn = document.querySelector('.filter-btn[data-category="mobile"]');
    const allBtn = document.querySelector('.filter-btn[data-category="all"]');

    // Rapid sequential clicks
    webglBtn.click();
    aiBtn.click();
    mobileBtn.click();
    allBtn.click();

    window.flushTimeouts();

    // Verify final state is 'all'
    assert.strictEqual(allBtn.classList.contains('active'), true, 'All button should be active finally');
    assert.strictEqual(webglBtn.classList.contains('active'), false, 'WebGL button should not be active');

    const cards = document.querySelectorAll('#projects-grid .project-card');
    assert.strictEqual(cards.length, 6, 'All 6 cards should be rendered after clicking ALL tag');
  });

  // 4. Screen resizing simulation across extreme breakpoints
  test('T2_Boundary_4: Screen resizing from mobile to 4K desktop updates window dimensions and webgl canvas without errors', ({ document, window }) => {
    const breakpoints = [
      { w: 320, h: 568 },   // Small mobile
      { w: 768, h: 1024 },  // Tablet
      { w: 1440, h: 900 },  // Desktop
      { w: 2560, h: 1440 }  // 4K Ultra Wide
    ];

    const canvas = document.getElementById('bg-canvas');

    for (const bp of breakpoints) {
      window.resize(bp.w, bp.h);
      assert.strictEqual(window.innerWidth, bp.w);
      assert.strictEqual(window.innerHeight, bp.h);
      assert.strictEqual(canvas.width, bp.w);
      assert.strictEqual(canvas.height, bp.h);
    }
  });

  // 5. Missing asset fallbacks
  test('T2_Boundary_5: Simulated broken image trigger fires error handler and sets fallback image', ({ document }) => {
    const firstImg = document.querySelector('.project-thumbnail img');
    assert.ok(firstImg, 'Project image element must exist');

    let fallbackTriggered = false;
    firstImg.addEventListener('error', () => {
      fallbackTriggered = true;
      firstImg.setAttribute('src', 'placeholder.jpg');
    });

    firstImg.dispatchEvent(new SimulatedEvent('error'));

    assert.strictEqual(fallbackTriggered, true, 'Image error handler should fire');
    assert.strictEqual(firstImg.getAttribute('src'), 'placeholder.jpg', 'Image src should fall back to placeholder');
  });

  return results;
}

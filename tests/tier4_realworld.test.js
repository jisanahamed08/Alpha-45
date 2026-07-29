/**
 * tier4_realworld.test.js - Tier 4 Real-World Application Scenario Tests (3 tests)
 * Coverage: Full end-to-end navigation flow, heavy interaction stress test,
 * continuous 3D WebGL background frame audit throughout full user session.
 */

import assert from 'node:assert';
import { createPortfolioDOMEnvironment, SimulatedEvent } from './setup-dom.js';

export function runTier4Tests() {
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

  // 1. Full end-to-end user navigation journey from top to bottom
  test('T4_RealWorld_1: Full End-to-End User Navigation Journey from Hero to Contact Success', ({ document, window }) => {
    // 1. Land on Hero & verify title & typing
    const heroTitle = document.querySelector('.hero-headline');
    assert.ok(heroTitle.textContent.includes('3D Digital Experiences'));
    window.flushTimeouts();

    // 2. Click Primary CTA "View Projects"
    const ctaProjects = document.querySelector('a[href="#projects"]');
    ctaProjects.click();
    assert.strictEqual(window.lastNavTarget, '#projects');

    // 3. Filter projects by "webgl"
    const webglFilterBtn = document.querySelector('.filter-btn[data-category="webgl"]');
    webglFilterBtn.click();
    window.flushTimeouts();
    assert.strictEqual(webglFilterBtn.classList.contains('active'), true);

    // 4. Open 1st webgl project modal
    const webglCard = document.querySelector('#projects-grid .project-card');
    const webglTitle = webglCard.querySelector('.project-title').textContent;
    webglCard.click();

    const modal = document.getElementById('project-modal');
    assert.strictEqual(modal.classList.contains('active'), true);
    assert.strictEqual(modal.querySelector('.modal-title').textContent, webglTitle);

    // 5. Close modal
    const closeBtn = document.getElementById('modal-close');
    closeBtn.click();
    assert.strictEqual(modal.classList.contains('active'), false);
    assert.strictEqual(modal.getAttribute('aria-hidden'), 'true');

    // 6. Inspect Experience Timeline
    const timeline = document.getElementById('timeline-container');
    const timelineItems = timeline.querySelectorAll('.timeline-item');
    assert.ok(timelineItems.length >= 4, 'Timeline should have milestone items');

    // 7. Inspect Skills Tech Stack
    const skillsGrid = document.getElementById('skills-container');
    const skillCards = skillsGrid.querySelectorAll('.skill-category-card');
    assert.ok(skillCards.length >= 4, 'Skills grid should have tech stack category cards');
    const firstFill = document.querySelector('.progress-bar-fill');
    assert.strictEqual(firstFill.style.width, `${firstFill.getAttribute('data-level')}%`);

    // 8. Navigate to Contact Section & Fill Form
    const form = document.getElementById('contact-form');
    document.getElementById('contact-name').value = 'Alice Recruiter';
    document.getElementById('contact-email').value = 'alice@techcorp.com';
    document.getElementById('contact-subject').value = 'Senior 3D Engineer Position';
    document.getElementById('contact-message').value = 'We loved your interactive portfolio. Let us schedule an interview!';

    // Submit form
    form.dispatchEvent(new SimulatedEvent('submit', { cancelable: true }));
    window.flushTimeouts();

    // Verify success UI state
    const successMsg = document.getElementById('contact-success');
    assert.strictEqual(successMsg.classList.contains('hidden'), false, 'Success message must be displayed on valid submit');
  });

  // 2. Heavy interaction stress test
  test('T4_RealWorld_2: Heavy Interaction Stress Test (10x rapid filters, multiple modals, form corrections, window resizes)', ({ document, window }) => {
    const filters = ['all', 'webgl', 'ai', 'fullstack', 'webgl', 'all', 'ai', 'mobile', 'all', 'webgl'];
    
    // Rapid filter switching loop
    for (const tag of filters) {
      const btn = document.querySelector(`.filter-btn[data-category="${tag}"]`);
      btn.click();
    }
    window.flushTimeouts();

    // Open and close 3 project modals in rapid sequence
    const cards = document.querySelectorAll('#projects-grid .project-card');
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('modal-close');

    for (let i = 0; i < Math.min(3, cards.length); i++) {
      cards[i].click();
      assert.strictEqual(modal.classList.contains('active'), true);
      closeBtn.click();
      assert.strictEqual(modal.classList.contains('active'), false);
    }

    // Attempt invalid form submit 3 times with bad inputs
    const form = document.getElementById('contact-form');
    const emailInput = document.getElementById('contact-email');
    
    emailInput.value = 'bad1';
    form.dispatchEvent(new SimulatedEvent('submit', { cancelable: true }));
    emailInput.value = 'bad2@';
    form.dispatchEvent(new SimulatedEvent('submit', { cancelable: true }));
    emailInput.value = 'bad3@domain';
    form.dispatchEvent(new SimulatedEvent('submit', { cancelable: true }));

    // Now correct email and submit
    document.getElementById('contact-name').value = 'Bob StressTester';
    emailInput.value = 'bob@stress.com';
    document.getElementById('contact-subject').value = 'Stress Test';
    document.getElementById('contact-message').value = 'System performance test message.';
    form.dispatchEvent(new SimulatedEvent('submit', { cancelable: true }));
    window.flushTimeouts();

    assert.strictEqual(document.getElementById('contact-success').classList.contains('hidden'), false);

    // Resize screen
    window.resize(800, 600);
    assert.strictEqual(window.innerWidth, 800);
  });

  // 3. Live 3D WebGL background animation frame audit across full interactive session
  test('T4_RealWorld_3: 3D WebGL Background Animation Frame Audit across continuous user session', ({ document, window, webglContext }) => {
    const startFrames = webglContext.renderCalls;

    // Simulate 30 animation frame ticks
    window.stepFrames(30);
    const midFrames = webglContext.renderCalls;
    assert.ok(midFrames >= startFrames + 30, 'WebGL frames should advance by at least 30 ticks');

    // User triggers pointer movement across canvas
    window.dispatchEvent(new SimulatedEvent('pointermove', { clientX: 450, clientY: 300 }));

    // User filters projects
    document.querySelector('.filter-btn[data-category="ai"]').click();
    window.flushTimeouts();

    // Step another 20 animation frame ticks
    window.stepFrames(20);
    const finalFrames = webglContext.renderCalls;

    assert.ok(finalFrames >= startFrames + 50, 'WebGL frames should continuously audit to at least 50 frame render calls');
  });

  return results;
}

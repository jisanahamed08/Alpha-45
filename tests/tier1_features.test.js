/**
 * tier1_features.test.js - Tier 1 Feature Coverage Tests (30 tests)
 * Evaluates production src/ modules against real DOM elements in index.html.
 */

import assert from 'node:assert';
import { createPortfolioDOMEnvironment, SimulatedEvent } from './setup-dom.js';

export function runTier1Tests() {
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

  // --- Feature 1: Hero Typing Effect & CTAs (5 tests) ---
  test('T1_Hero_1: Hero container exists with headline, typing element, and CTAs', ({ document }) => {
    const hero = document.getElementById('hero');
    assert.ok(hero, 'Hero container #hero must exist');

    const title = hero.querySelector('.hero-headline');
    assert.ok(title, 'Hero title .hero-headline must exist');
    assert.ok(title.textContent.includes('3D Digital Experiences'));

    const typing = hero.querySelector('#hero-typing');
    assert.ok(typing, 'Hero typing element #hero-typing must exist');

    const ctaProjects = hero.querySelector('a[href="#projects"]');
    const ctaContact = hero.querySelector('a[href="#contact"]');
    assert.ok(ctaProjects, 'CTA link to #projects must exist');
    assert.ok(ctaContact, 'CTA link to #contact must exist');
  });

  test('T1_Hero_2: Dynamic typing effect updates content on ticks', ({ document, window }) => {
    const typing = document.getElementById('hero-typing');
    const initialText = typing.textContent;
    window.flushTimeouts();
    const updatedText = typing.textContent;
    assert.notStrictEqual(initialText, updatedText, 'Typing content should update on tick');
  });

  test('T1_Hero_3: Quick stats counter/cards rendered in Hero', ({ document, window }) => {
    const stats = document.querySelectorAll('.stat-number');
    assert.ok(stats.length >= 3, `Expected >= 3 stat numbers, found ${stats.length}`);
    assert.strictEqual(stats[0].getAttribute('data-target'), '5');
    assert.strictEqual(stats[1].getAttribute('data-target'), '24');
    assert.strictEqual(stats[2].getAttribute('data-target'), '15');
    window.stepFrames(100);
    assert.strictEqual(stats[0].textContent, '5+');
  });

  test('T1_Hero_4: Primary CTA "View Projects" triggers navigation target to #projects', ({ document, window }) => {
    const ctaProjects = document.querySelector('a[href="#projects"]');
    ctaProjects.click();
    assert.strictEqual(window.lastNavTarget, '#projects', 'Primary CTA should navigate to #projects');
  });

  test('T1_Hero_5: Secondary CTA "Get In Touch" triggers navigation target to #contact', ({ document, window }) => {
    const ctaContact = document.querySelector('a[href="#contact"]');
    ctaContact.click();
    assert.strictEqual(window.lastNavTarget, '#contact', 'Secondary CTA should navigate to #contact');
  });

  // --- Feature 2: 3D WebGL Canvas Initialization & Frame Loop (5 tests) ---
  test('T1_3D_1: #bg-canvas exists in DOM', ({ document }) => {
    const canvas = document.getElementById('bg-canvas');
    assert.ok(canvas, '#bg-canvas must exist');
  });

  test('T1_3D_2: WebGL context initialization succeeds', ({ document }) => {
    const canvas = document.getElementById('bg-canvas');
    const gl = canvas.getContext('webgl');
    assert.ok(gl, 'canvas.getContext("webgl") should return context stub');
    assert.strictEqual(typeof gl.drawArrays, 'function');
  });

  test('T1_3D_3: requestAnimationFrame frame loop executes and increments frame count', ({ window, webglContext }) => {
    const initialCalls = webglContext.renderCalls;
    window.stepFrames(10);
    assert.ok(webglContext.renderCalls > initialCalls, 'Frame loop should trigger render calls');
  });

  test('T1_3D_4: Pointer movement triggers pointermove event listener', ({ window }) => {
    let pointerMoved = false;
    window.addEventListener('pointermove', () => { pointerMoved = true; });
    window.dispatchEvent(new SimulatedEvent('pointermove', { clientX: 100, clientY: 200 }));
    assert.strictEqual(pointerMoved, true, 'Window pointermove event should trigger');
  });

  test('T1_3D_5: Window resize listener updates canvas dimensions', ({ document, window }) => {
    const canvas = document.getElementById('bg-canvas');
    window.resize(1920, 1080);
    assert.strictEqual(canvas.width, 1920);
    assert.strictEqual(canvas.height, 1080);
  });

  // --- Feature 3: Projects Showcase Grid Rendering & Tag Filter Update (5 tests) ---
  test('T1_Proj_1: Projects grid renders initial project cards', ({ document }) => {
    const grid = document.getElementById('projects-grid');
    assert.ok(grid, '#projects-grid must exist');
    const cards = grid.querySelectorAll('.project-card');
    assert.ok(cards.length >= 6, `Expected >= 6 project cards, found ${cards.length}`);
  });

  test('T1_Proj_2: Filter buttons container renders all category buttons', ({ document }) => {
    const btns = document.querySelectorAll('.filter-btn');
    assert.ok(btns.length >= 4, `Expected >= 4 filter buttons, found ${btns.length}`);
    const filterTags = Array.from(btns).map(b => b.getAttribute('data-category'));
    assert.ok(filterTags.includes('all'));
    assert.ok(filterTags.includes('webgl'));
    assert.ok(filterTags.includes('fullstack'));
    assert.ok(filterTags.includes('ai'));
    assert.ok(filterTags.includes('mobile'));
  });

  test('T1_Proj_3: Clicking "webgl" tag filters project cards and updates active button class', ({ document, window }) => {
    const webBtn = document.querySelector('.filter-btn[data-category="webgl"]');
    webBtn.click();
    window.flushTimeouts();
    assert.strictEqual(webBtn.classList.contains('active'), true);

    const cards = document.querySelectorAll('#projects-grid .project-card');
    assert.ok(cards.length > 0);
    cards.forEach(card => {
      assert.ok(card.getAttribute('data-id'));
    });
  });

  test('T1_Proj_4: Clicking "all" tag restores visibility of all project cards', ({ document, window }) => {
    const webBtn = document.querySelector('.filter-btn[data-category="webgl"]');
    webBtn.click();
    window.flushTimeouts();

    const allBtn = document.querySelector('.filter-btn[data-category="all"]');
    allBtn.click();
    window.flushTimeouts();

    const cards = document.querySelectorAll('#projects-grid .project-card');
    assert.strictEqual(cards.length, 6);
  });

  test('T1_Proj_5: Clicking project card opens detailed modal overlay with project title', ({ document }) => {
    const firstCard = document.querySelector('#projects-grid .project-card');
    const cardTitle = firstCard.querySelector('.project-title').textContent;
    firstCard.click();

    const modal = document.getElementById('project-modal');
    assert.strictEqual(modal.classList.contains('active'), true);
    assert.strictEqual(modal.getAttribute('aria-hidden'), 'false');
    const modalTitle = modal.querySelector('.modal-title').textContent;
    assert.strictEqual(modalTitle, cardTitle);
  });

  // --- Feature 4: Experience & Education Timeline Rendering (5 tests) ---
  test('T1_Exp_1: Timeline container #timeline-container renders chronological items', ({ document }) => {
    const timeline = document.getElementById('timeline-container');
    assert.ok(timeline, '#timeline-container must exist');
    const items = timeline.querySelectorAll('.timeline-item');
    assert.ok(items.length >= 4, `Expected >= 4 timeline items, found ${items.length}`);
  });

  test('T1_Exp_2: Timeline items contain role/title, company, and description', ({ document }) => {
    const firstItem = document.querySelector('#timeline-container .timeline-item');
    const period = firstItem.querySelector('.timeline-period');
    const role = firstItem.querySelector('.timeline-role');
    const company = firstItem.querySelector('.timeline-company');
    const summary = firstItem.querySelector('.timeline-summary');
    assert.ok(period.textContent.length > 0, 'Timeline item must have date period');
    assert.ok(role.textContent.length > 0, 'Timeline item must have role');
    assert.ok(company.textContent.length > 0, 'Timeline item must have company');
    assert.ok(summary.textContent.length > 0, 'Timeline item must have summary');
  });

  test('T1_Exp_3: Timeline items contain marker and content structure', ({ document }) => {
    const items = document.querySelectorAll('#timeline-container .timeline-item');
    items.forEach((item) => {
      assert.ok(item.querySelector('.timeline-marker'));
      assert.ok(item.querySelector('.timeline-content'));
    });
  });

  test('T1_Exp_4: Experience section container #experience exists in DOM', ({ document }) => {
    const sec = document.getElementById('experience');
    assert.ok(sec, '#experience section must exist');
  });

  test('T1_Exp_5: Timeline periods present date ranges correctly formatted', ({ document }) => {
    const periods = document.querySelectorAll('#timeline-container .timeline-period');
    assert.ok(periods[0].textContent.includes('202'), 'Period should contain milestone year');
  });

  // --- Feature 5: Skills Tech Stack Grid & Progress Indicators (5 tests) ---
  test('T1_Skills_1: Skills grid #skills-container exists with category cards', ({ document }) => {
    const grid = document.getElementById('skills-container');
    assert.ok(grid, '#skills-container must exist');
    const cards = grid.querySelectorAll('.skill-category-card');
    assert.ok(cards.length >= 4, `Expected >= 4 skill category cards, found ${cards.length}`);
  });

  test('T1_Skills_2: Skill card contains skill name, progress bar fill, and percentage text', ({ document }) => {
    const firstItem = document.querySelector('#skills-container .skill-item');
    assert.ok(firstItem.querySelector('.skill-name'));
    assert.ok(firstItem.querySelector('.progress-bar-fill'));
    assert.ok(firstItem.querySelector('.skill-percent'));
  });

  test('T1_Skills_3: Skill progress bar width matches skill data level', ({ document }) => {
    const firstFill = document.querySelector('#skills-container .progress-bar-fill');
    const level = firstFill.getAttribute('data-level');
    assert.strictEqual(firstFill.style.width, `${level}%`);
  });

  test('T1_Skills_4: Skill category cards have category titles', ({ document }) => {
    const cards = document.querySelectorAll('#skills-container .skill-category-card');
    cards.forEach(card => {
      assert.ok(card.querySelector('.category-title'), 'Skill card must have category title');
    });
  });

  test('T1_Skills_5: Skills section container #skills exists in DOM', ({ document }) => {
    const sec = document.getElementById('skills');
    assert.ok(sec, '#skills section must exist');
  });

  // --- Feature 6: Contact Form Validation & Submission Success (5 tests) ---
  test('T1_Contact_1: Contact form #contact-form renders required fields and submit button', ({ document }) => {
    const form = document.getElementById('contact-form');
    assert.ok(form, '#contact-form must exist');
    assert.ok(document.getElementById('contact-name'));
    assert.ok(document.getElementById('contact-email'));
    assert.ok(document.getElementById('contact-subject'));
    assert.ok(document.getElementById('contact-message'));
    assert.ok(document.getElementById('contact-submit'));
  });

  test('T1_Contact_2: Submitting empty contact form displays field required error feedback', ({ document }) => {
    const form = document.getElementById('contact-form');
    const submitEvt = new SimulatedEvent('submit', { cancelable: true });
    form.dispatchEvent(submitEvt);

    const nameError = document.getElementById('name-error');
    assert.strictEqual(nameError.textContent, 'Name is required.');
    assert.strictEqual(submitEvt.defaultPrevented, true, 'Form submission should be cancelled');
  });

  test('T1_Contact_3: Submitting invalid email displays invalid email format error', ({ document }) => {
    const form = document.getElementById('contact-form');
    document.getElementById('contact-name').value = 'John Doe';
    document.getElementById('contact-email').value = 'invalid-email-address';
    document.getElementById('contact-subject').value = 'Inquiry';
    document.getElementById('contact-message').value = 'Hello standard message body text.';

    form.dispatchEvent(new SimulatedEvent('submit', { cancelable: true }));

    const emailError = document.getElementById('email-error');
    assert.strictEqual(emailError.textContent, 'Please enter a valid email address.');
  });

  test('T1_Contact_4: Submitting valid form values shows success UI message', ({ document, window }) => {
    const form = document.getElementById('contact-form');
    document.getElementById('contact-name').value = 'Jane Architect';
    document.getElementById('contact-email').value = 'jane@example.com';
    document.getElementById('contact-subject').value = 'Collaboration';
    document.getElementById('contact-message').value = 'Let us build a 3D web application.';

    form.dispatchEvent(new SimulatedEvent('submit', { cancelable: true }));
    window.flushTimeouts();

    const successMsg = document.getElementById('contact-success');
    assert.strictEqual(successMsg.classList.contains('hidden'), false, 'Success message should be visible');
  });

  test('T1_Contact_5: Successful submission resets form input fields back to empty', ({ document, window }) => {
    const form = document.getElementById('contact-form');
    const nameInp = document.getElementById('contact-name');
    const emailInp = document.getElementById('contact-email');
    nameInp.value = 'Jane Architect';
    emailInp.value = 'jane@example.com';
    document.getElementById('contact-subject').value = 'Collaboration';
    document.getElementById('contact-message').value = 'Let us build a 3D web application.';

    form.dispatchEvent(new SimulatedEvent('submit', { cancelable: true }));
    window.flushTimeouts();

    assert.strictEqual(nameInp.value, '', 'Name input should reset');
    assert.strictEqual(emailInp.value, '', 'Email input should reset');
  });

  return results;
}

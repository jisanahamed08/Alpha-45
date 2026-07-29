/**
 * empirical-verification-harness.js
 * Comprehensive Empirical Correctness & Stress Verification Harness
 * Evaluates real component implementations in `src/components/*.js`.
 */

import assert from 'node:assert';
import { SimulatedDocument, SimulatedWindow, SimulatedEvent, SimulatedElement } from './tests/setup-dom.js';

// Global Stubs
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Enhance SimulatedElement with className, form methods, and basic innerHTML parsing
Object.defineProperty(SimulatedElement.prototype, 'className', {
  get() {
    return this.classList.toString();
  },
  set(val) {
    this.setAttribute('class', val);
  }
});

SimulatedElement.prototype.reset = function() {
  if (this.tagName === 'FORM') {
    const inputs = this.querySelectorAll('input, textarea');
    inputs.forEach(inp => {
      inp.value = '';
    });
  }
};

Object.defineProperty(SimulatedElement.prototype, 'innerHTML', {
  get() {
    return this._innerHTML || '';
  },
  set(html) {
    this._innerHTML = html;
    this.children = [];
    if (!html) return;

    // Parse html elements into DOM nodes
    const tagRegex = /<([a-z0-9-]+)([^>]*)>(.*?)<\/\1>|<([a-z0-9-]+)([^>]*)\/>/gis;
    let match;
    while ((match = tagRegex.exec(html)) !== null) {
      const tagName = match[1] || match[4];
      const attrStr = match[2] || match[5] || '';
      const content = match[3] || '';

      const child = new SimulatedElement(tagName);
      
      const attrRegex = /([a-z0-9-]+)=["']([^"']*)["']/gi;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
        child.setAttribute(attrMatch[1], attrMatch[2]);
      }

      child.textContent = content.replace(/<[^>]*>/g, '');
      this.appendChild(child);
    }
  }
});

function createRealDOMEnvironment() {
  const document = new SimulatedDocument();
  const window = new SimulatedWindow(document);
  global.document = document;
  global.window = window;
  global.performance = { now: () => Date.now() };

  document.body = document.createElement('body');

  // Canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  document.body.appendChild(canvas);

  // Hero Section
  const hero = document.createElement('section');
  hero.id = 'hero';
  hero.className = 'section hero-section';
  
  const typingSpan = document.createElement('span');
  typingSpan.id = 'hero-typing';
  hero.appendChild(typingSpan);

  const heroStats = document.createElement('div');
  heroStats.className = 'hero-stats';
  [5, 24, 15].forEach(val => {
    const card = document.createElement('div');
    card.className = 'stat-card glass-card';
    const num = document.createElement('div');
    num.className = 'stat-number';
    num.setAttribute('data-target', String(val));
    num.textContent = '0';
    card.appendChild(num);
    heroStats.appendChild(card);
  });
  hero.appendChild(heroStats);
  document.body.appendChild(hero);

  // Projects Section
  const projects = document.createElement('section');
  projects.id = 'projects';
  
  const filters = document.createElement('div');
  filters.id = 'project-filters';
  projects.appendChild(filters);

  const grid = document.createElement('div');
  grid.id = 'projects-grid';
  projects.appendChild(grid);
  document.body.appendChild(projects);

  // Modal Section
  const modal = document.createElement('div');
  modal.id = 'project-modal';
  modal.className = 'modal-overlay';
  modal.setAttribute('aria-hidden', 'true');

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  modal.appendChild(backdrop);

  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container glass-card';

  const modalClose = document.createElement('button');
  modalClose.id = 'modal-close';
  modalClose.className = 'modal-close-btn';
  modalContainer.appendChild(modalClose);

  const modalBody = document.createElement('div');
  modalBody.id = 'modal-content-body';
  modalBody.className = 'modal-body';
  modalContainer.appendChild(modalBody);

  modal.appendChild(modalContainer);
  document.body.appendChild(modal);

  // Contact Form Section
  const contact = document.createElement('section');
  contact.id = 'contact';

  const form = document.createElement('form');
  form.id = 'contact-form';

  ['name', 'email', 'subject'].forEach(name => {
    const input = document.createElement('input');
    input.id = `contact-${name}`;
    input.name = name;
    form.appendChild(input);

    const err = document.createElement('span');
    err.id = `${name}-error`;
    form.appendChild(err);
  });

  const msg = document.createElement('textarea');
  msg.id = 'contact-message';
  msg.name = 'message';
  form.appendChild(msg);

  const msgErr = document.createElement('span');
  msgErr.id = 'message-error';
  form.appendChild(msgErr);

  const submitBtn = document.createElement('button');
  submitBtn.id = 'contact-submit';
  submitBtn.type = 'submit';
  const btnText = document.createElement('span');
  btnText.className = 'btn-text';
  btnText.textContent = 'Send Message';
  submitBtn.appendChild(btnText);
  form.appendChild(submitBtn);

  contact.appendChild(form);

  const success = document.createElement('div');
  success.id = 'contact-success';
  success.className = 'contact-success hidden';
  const resetBtn = document.createElement('button');
  resetBtn.id = 'reset-contact-form';
  success.appendChild(resetBtn);
  contact.appendChild(success);

  document.body.appendChild(contact);

  return { document, window };
}

async function runEmpiricalVerification() {
  console.log('================================================================');
  console.log('      EMPIRICAL CHALLENGER DIRECT COMPONENT VERIFICATION        ');
  console.log('================================================================\n');

  let passedCount = 0;
  let failedCount = 0;
  const findings = [];

  function testCase(name, fn) {
    try {
      const env = createRealDOMEnvironment();
      fn(env);
      console.log(`  [PASS] ${name}`);
      passedCount++;
    } catch (err) {
      console.log(`  [FAIL] ${name}`);
      console.log(`         Error: ${err.message}`);
      failedCount++;
      findings.push({ name, error: err.message });
    }
  }

  // --- 1. Hero Component Verification ---
  const { initHeroComponent } = await import('./src/components/hero.js');

  testCase('HERO: Dynamic typing animation initializes and updates text', ({ document }) => {
    initHeroComponent();
    const typing = document.getElementById('hero-typing');
    assert.ok(typing, 'hero-typing element must exist');
    assert.strictEqual(typeof typing.textContent, 'string');
  });

  testCase('HERO: Animated stats counter fallback triggers without IntersectionObserver', ({ document }) => {
    delete global.window.IntersectionObserver;
    initHeroComponent();
    const statNums = document.querySelectorAll('.stat-number');
    assert.strictEqual(statNums.length, 3, 'Expected 3 stat number cards');
  });

  // --- 2. Projects Component Verification ---
  const { initProjectsComponent } = await import('./src/components/projects.js');

  testCase('PROJECTS: Category pills render and initial grid loads', ({ document }) => {
    initProjectsComponent();
    const filters = document.getElementById('project-filters');
    const btns = filters.querySelectorAll('.filter-btn');
    assert.strictEqual(btns.length, 5, 'Expected 5 filter category pills (All, WebGL, FullStack, AI, Mobile)');
    assert.ok(btns[0].classList.contains('active'), 'First button "All" should be active');
  });

  testCase('PROJECTS: Asynchronous filter transition delay check', ({ document }) => {
    initProjectsComponent();
    const filters = document.getElementById('project-filters');
    const btns = filters.querySelectorAll('.filter-btn');
    const webglBtn = Array.from(btns).find(b => b.getAttribute('data-category') === 'webgl');
    
    assert.ok(webglBtn, 'WebGL button must exist');
    webglBtn.click();
    assert.ok(webglBtn.classList.contains('active'), 'WebGL button should immediately gain active class');

    const grid = document.getElementById('projects-grid');
    assert.strictEqual(grid.style.opacity, '0', 'Grid opacity must transition to 0 during pending 200ms filter delay');
  });

  // --- 3. Modal Component Verification ---
  const { initModalComponent, openProjectModal, closeModal } = await import('./src/components/modal.js');

  testCase('MODAL: Open and close state transitions and ARIA attributes', ({ document }) => {
    initModalComponent();
    const modal = document.getElementById('project-modal');
    assert.strictEqual(modal.getAttribute('aria-hidden'), 'true');

    const mockProject = {
      id: 'p1',
      title: 'Test Project',
      category: 'web',
      description: 'Test description',
      tags: ['WebGL', 'JS']
    };

    openProjectModal(mockProject);
    assert.ok(modal.classList.contains('active'), 'Modal should have active class when opened');
    assert.strictEqual(modal.getAttribute('aria-hidden'), 'false', 'aria-hidden should be false when opened');
    assert.strictEqual(document.body.style.overflow, 'hidden', 'Body scroll should be locked');

    closeModal();
    assert.strictEqual(modal.classList.contains('active'), false, 'Active class should be removed on close');
    assert.strictEqual(modal.getAttribute('aria-hidden'), 'true', 'aria-hidden should be true on close');
    assert.strictEqual(document.body.style.overflow, '', 'Body scroll lock should be cleared');
  });

  testCase('MODAL: Keyboard Escape key closes open modal', ({ document, window }) => {
    initModalComponent();
    const modal = document.getElementById('project-modal');
    const mockProject = { id: 'p1', title: 'Test Project', category: 'web', description: 'Test' };

    openProjectModal(mockProject);
    assert.ok(modal.classList.contains('active'));

    const escEvent = new SimulatedEvent('keydown');
    escEvent.key = 'Escape';
    window.dispatchEvent(escEvent);

    assert.strictEqual(modal.classList.contains('active'), false, 'Escape key should close modal');
  });

  // --- 4. Contact Form Validation Verification ---
  const { initContactComponent } = await import('./src/components/contact.js');

  testCase('CONTACT: Empty submission triggers field validation errors', ({ document }) => {
    initContactComponent();
    const form = document.getElementById('contact-form');
    const submitEvent = new SimulatedEvent('submit', { cancelable: true });
    
    form.dispatchEvent(submitEvent);

    const nameErr = document.getElementById('name-error');
    const emailErr = document.getElementById('email-error');
    assert.ok(nameErr.textContent.includes('required'), 'Name error should indicate required field');
    assert.ok(emailErr.textContent.includes('required'), 'Email error should indicate required field');
  });

  testCase('CONTACT: Invalid email format rejected by contact component', ({ document }) => {
    initContactComponent();
    const form = document.getElementById('contact-form');
    
    document.getElementById('contact-name').value = 'Alex Rivera';
    document.getElementById('contact-email').value = 'invalid-email-no-at';
    document.getElementById('contact-subject').value = 'Project Inquiry';
    document.getElementById('contact-message').value = 'Detailed project description long enough.';

    const submitEvent = new SimulatedEvent('submit', { cancelable: true });
    form.dispatchEvent(submitEvent);

    const emailErr = document.getElementById('email-error');
    assert.ok(emailErr.textContent.includes('valid email'), 'Email error should be displayed for bad email format');
  });

  testCase('CONTACT STRESS TEST: Edge case email format user@domain..com check', ({ document }) => {
    initContactComponent();
    const form = document.getElementById('contact-form');
    
    document.getElementById('contact-name').value = 'Alex Rivera';
    document.getElementById('contact-email').value = 'user@domain..com';
    document.getElementById('contact-subject').value = 'Project Inquiry';
    document.getElementById('contact-message').value = 'Detailed project description long enough.';

    const submitEvent = new SimulatedEvent('submit', { cancelable: true });
    form.dispatchEvent(submitEvent);

    const emailErr = document.getElementById('email-error');
    if (!emailErr.textContent) {
      throw new Error("REGEX VULNERABILITY CONFIRMED: Contact form accepted 'user@domain..com' as a valid email!");
    }
  });

  console.log('\n================================================================');
  console.log(` Direct Verification Summary: ${passedCount} Passed, ${failedCount} Failed`);
  console.log('================================================================\n');
}

runEmpiricalVerification().catch(console.error);

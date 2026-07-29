import './style.css';
import confetti from 'canvas-confetti';
import { initBackgroundScene } from './three/background.js';
import { initNavbarComponent } from './components/navbar.js';
import { initHeroComponent } from './components/hero.js';
import { initModalComponent } from './components/modal.js';
import { initProjectsComponent } from './components/projects.js';
import { initTimelineComponent } from './components/timeline.js';
import { initSkillsComponent } from './components/skills.js';
import { initContactComponent } from './components/contact.js';

import {
  createIcons,
  ArrowRight,
  Mail,
  ArrowUpRight,
  Github,
  Linkedin,
  Twitter,
  User,
  AtSign,
  FileText,
  MessageSquare,
  Send,
  CheckCircle2,
  MapPin,
  Code2,
  X,
  ArrowUp,
  ExternalLink,
  Eye,
  Atom,
  Grid,
  Sun,
  Sparkles,
  Terminal
} from 'lucide';

// 1. Theme-Aware Futuristic Sound Synthesizer via Web Audio API
function playCyberSound(frequency = 440, type = 'sine', duration = 0.08) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.6, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    // Ignore audio context autoplay restriction errors
  }
}

// 2. 3D Holographic Card Tilt Controller
function initCardTiltEffect() {
  const cards = document.querySelectorAll('.glass-card, .stat-card, .info-card');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

function initAudioInteractions() {
  document.querySelectorAll('a, button, .btn, .filter-btn').forEach((el) => {
    el.addEventListener('mouseenter', () => playCyberSound(520, 'sine', 0.05), { passive: true });
    el.addEventListener('click', () => playCyberSound(880, 'triangle', 0.09), { passive: true });
  });
}

// 3. Theme-Specific 3D Burst Explosions & Particle Effects
function initCyberClickExplosion() {
  const sparkCanvas = document.createElement('canvas');
  sparkCanvas.id = 'cyber-click-canvas';
  sparkCanvas.style.position = 'fixed';
  sparkCanvas.style.top = '0';
  sparkCanvas.style.left = '0';
  sparkCanvas.style.width = '100vw';
  sparkCanvas.style.height = '100vh';
  sparkCanvas.style.pointerEvents = 'none';
  sparkCanvas.style.zIndex = '99999';
  document.body.appendChild(sparkCanvas);

  const ctx = sparkCanvas.getContext('2d');
  let particles = [];

  function resizeSparkCanvas() {
    sparkCanvas.width = window.innerWidth;
    sparkCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeSparkCanvas);
  resizeSparkCanvas();

  window.addEventListener('pointerdown', (e) => {
    if (e.target.closest('header, nav, button, a, .btn, .filter-btn, .theme-btn, .modal-container, input, textarea')) {
      return;
    }

    const currentTheme = document.body.getAttribute('data-theme') || 'quantum';

    // Theme-specific audio synth sounds
    if (currentTheme === 'quantum') playCyberSound(440, 'sine', 0.1);
    else if (currentTheme === 'cyber') playCyberSound(220, 'sawtooth', 0.14);
    else if (currentTheme === 'plasma') playCyberSound(650, 'triangle', 0.12);
    else if (currentTheme === 'matrix') playCyberSound(950, 'square', 0.08);

    // Theme-specific professional particle colors
    let themeColors = ['#00f2fe', '#4facfe', '#7f00ff', '#ffffff'];
    let particleType = 'circle';

    if (currentTheme === 'cyber') {
      themeColors = ['#38bdf8', '#6366f1', '#8b5cf6', '#ffffff'];
      particleType = 'ring';
    } else if (currentTheme === 'plasma') {
      themeColors = ['#2dd4bf', '#0284c7', '#38bdf8', '#ffffff'];
      particleType = 'flame';
    } else if (currentTheme === 'matrix') {
      themeColors = ['#10b981', '#06b6d4', '#34d399', '#ffffff'];
      particleType = 'binary';
    }

    const count = currentTheme === 'matrix' ? 20 : 35;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 7.5;
      particles.push({
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 4,
        color: themeColors[Math.floor(Math.random() * themeColors.length)],
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.025,
        type: particleType,
        text: Math.random() > 0.5 ? '1' : '0'
      });
    }
  });

  function renderSparks() {
    ctx.clearRect(0, 0, sparkCanvas.width, sparkCanvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 14;

      if (p.type === 'binary') {
        ctx.fillStyle = p.color;
        ctx.font = 'bold 16px monospace';
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    requestAnimationFrame(renderSparks);
  }
  renderSparks();
}

// 4. Synth Keyboard Easter Egg (Shift + 1..7)
function initSynthKeyboardEasterEgg() {
  const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88];
  window.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key >= '1' && e.key <= '7') {
      const idx = parseInt(e.key, 10) - 1;
      playCyberSound(notes[idx], 'sawtooth', 0.22);
      confetti({
        particleCount: 15,
        spread: 45,
        origin: { x: 0.5, y: 0.15 },
        colors: ['#00f2fe', '#7f00ff']
      });
    }
  });
}

// 5. Scroll Reveal Card Entrance Animations Observer
function initScrollRevealObserver() {
  const revealElements = document.querySelectorAll('.timeline-item, .skill-category-card, .info-card, .contact-form-container');
  revealElements.forEach((el) => {
    el.classList.add('reveal-on-scroll');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  createIcons({
    icons: {
      ArrowRight,
      Mail,
      ArrowUpRight,
      Github,
      Linkedin,
      Twitter,
      User,
      AtSign,
      FileText,
      MessageSquare,
      Send,
      CheckCircle2,
      MapPin,
      Code2,
      X,
      ArrowUp,
      ExternalLink,
      Eye,
      Atom,
      Grid,
      Sun,
      Sparkles,
      Terminal
    }
  });

  // 2. Initialize 3D WebGL Background Scene
  const bgCanvas = document.getElementById('bg-canvas');
  if (bgCanvas) {
    initBackgroundScene(bgCanvas);
  }

  // 3. Initialize Components
  initNavbarComponent();
  initHeroComponent();
  initModalComponent();
  initProjectsComponent();
  initTimelineComponent();
  initSkillsComponent();
  initContactComponent();

  // 4. Initialize Interactive Crazy Effects
  setTimeout(() => {
    initCardTiltEffect();
    initAudioInteractions();
    initScrollRevealObserver();
    initCyberClickExplosion();
    initSynthKeyboardEasterEgg();
  }, 100);

  // 5. Active Nav Link Observer
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function activateNavOnScroll() {
    let scrollY = window.pageYOffset;

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', activateNavOnScroll, { passive: true });

  // 6. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinksContainer = document.querySelector('.nav-links');

  if (mobileToggle && navLinksContainer) {
    mobileToggle.addEventListener('click', () => {
      navLinksContainer.classList.toggle('active');
    });

    navLinksContainer.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navLinksContainer.classList.remove('active');
      });
    });
  }
});

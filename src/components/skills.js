import { skillsData } from '../data/skills.js';
import { createIcons, Box, Code, Server, Cpu } from 'lucide';

export function initSkillsComponent() {
  const container = document.getElementById('skills-container');
  if (!container) return;

  container.innerHTML = skillsData
    .map(
      (cat) => `
    <div class="skill-category-card glass-card reveal-on-scroll">
      <h3 class="category-title">
        <i data-lucide="${cat.icon}"></i>
        <span>${cat.category}</span>
      </h3>
      <div class="skill-items">
        ${cat.skills
          .map(
            (skill) => `
          <div class="skill-item">
            <div class="skill-info">
              <span class="skill-name">${skill.name}</span>
              <span class="skill-percent">${skill.level}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" data-level="${skill.level}"></div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `
    )
    .join('');

  // Render Category Icons
  createIcons({
    icons: {
      Box,
      Code,
      Server,
      Cpu
    }
  });

  // Animate Progress Bars on Intersection
  function triggerSkillAnimations() {
    const fills = container.querySelectorAll('.progress-bar-fill');
    fills.forEach((fill) => {
      const level = fill.getAttribute('data-level');
      fill.style.width = `${level}%`;
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerSkillAnimations();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(container);
  } else {
    triggerSkillAnimations();
  }
}

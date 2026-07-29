import { experienceData } from '../data/experience.js';

export function initTimelineComponent() {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  container.innerHTML = experienceData
    .map(
      (item, index) => `
    <div class="timeline-item reveal-on-scroll" style="transition-delay: ${index * 0.12}s;">
      <div class="timeline-marker"></div>
      <div class="timeline-content glass-card">
        <span class="timeline-period">${item.period}</span>
        <h3 class="timeline-role">${item.role}</h3>
        <div class="timeline-company">${item.company}</div>
        <p class="timeline-summary">${item.summary}</p>
        <ul class="timeline-bullets">
          ${item.bullets.map((b) => `<li>${b}</li>`).join('')}
        </ul>
        <div class="project-tech-stack" style="margin-top: 1rem;">
          ${item.tags.map((t) => `<span class="tech-tag">${t}</span>`).join('')}
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

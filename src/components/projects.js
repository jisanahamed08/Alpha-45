import { projectsData, projectCategories } from '../data/projects.js';
import { openProjectModal } from './modal.js';
import { createIcons, ExternalLink, Github, Eye } from 'lucide';

export function initProjectsComponent() {
  const filterContainer = document.getElementById('project-filters');
  const gridContainer = document.getElementById('projects-grid');

  if (!filterContainer || !gridContainer) return;

  let currentCategory = 'all';

  // 1. Render Category Filter Pills
  filterContainer.innerHTML = projectCategories
    .map(
      (cat) => `
    <button class="filter-btn ${cat.id === 'all' ? 'active' : ''}" data-category="${cat.id}">
      ${cat.label}
    </button>
  `
    )
    .join('');

  // 2. Render Project Cards
  function renderGrid(category = 'all') {
    const filteredProjects =
      category === 'all'
        ? projectsData
        : projectsData.filter((p) => p.category === category);

    gridContainer.style.opacity = '1';
    gridContainer.innerHTML = filteredProjects
      .map(
        (project) => `
      <article class="project-card glass-card" data-id="${project.id}">
        <div class="project-thumbnail">
          <img src="${project.image}" alt="${project.title}" loading="lazy" />
          <div class="project-overlay"></div>
          <span class="project-category-tag">${project.categoryName || project.category}</span>
        </div>
        <div class="project-content">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-description">${project.description}</p>
          <div class="project-tech-stack">
            ${project.tags.map((tag) => `<span class="tech-tag">${tag}</span>`).join('')}
          </div>
          <div class="project-footer">
            <span class="project-view-btn">
              <i data-lucide="eye"></i> View Details
            </span>
            <div class="project-links">
              ${
                project.demoUrl
                  ? `<a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer" class="project-link-icon" title="Live Demo" onclick="event.stopPropagation()">
                      <i data-lucide="external-link"></i>
                    </a>`
                  : ''
              }
              ${
                project.githubUrl
                  ? `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-link-icon" title="GitHub Repository" onclick="event.stopPropagation()">
                      <i data-lucide="github"></i>
                    </a>`
                : ''
              }
            </div>
          </div>
        </div>
      </article>
    `
      )
      .join('');

    // Refresh Lucide icons
    createIcons({
      icons: {
        ExternalLink,
        Github,
        Eye
      }
    });

    // Bind Click events to project cards
    const cards = gridContainer.querySelectorAll('.project-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const found = projectsData.find((p) => p.id === id);
        if (found) {
          openProjectModal(found);
        }
      });
    });
  }

  // Initial Grid Render
  renderGrid('all');

  // Filter Click Listener
  filterContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    filterContainer.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    currentCategory = btn.getAttribute('data-category');
    renderGrid(currentCategory);
  });
}

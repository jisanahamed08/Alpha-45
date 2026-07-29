import { createIcons, ArrowUpRight, Github, X } from 'lucide';

let modalOverlay = null;
let modalContainer = null;
let modalCloseBtn = null;
let modalBody = null;

export function initModalComponent() {
  modalOverlay = document.getElementById('project-modal');
  if (!modalOverlay) return;

  modalContainer = modalOverlay.querySelector('.modal-container');
  modalCloseBtn = document.getElementById('modal-close');
  modalBody = document.getElementById('modal-content-body');

  // Close handlers
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  const backdrop = modalOverlay.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', closeModal);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });
}

export function openProjectModal(project) {
  if (!modalOverlay || !modalBody || !project) return;

  const highlightsHtml = project.highlights
    ? `
      <div class="modal-highlights">
        <h4>Key Highlights</h4>
        <ul>
          ${project.highlights.map((h) => `<li>${h}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const techStackHtml = project.tags
    ? `
      <div class="project-tech-stack" style="margin-bottom: 1.5rem;">
        ${project.tags.map((t) => `<span class="tech-tag">${t}</span>`).join('')}
      </div>
    `
    : '';

  modalBody.innerHTML = `
    <img src="${project.image}" alt="${project.title}" class="modal-image" />
    <span class="modal-category">${project.categoryName || project.category}</span>
    <h3 class="modal-title">${project.title}</h3>
    <p class="modal-description">${project.longDescription || project.description}</p>
    ${techStackHtml}
    ${highlightsHtml}
    <div class="modal-ctas">
      ${
        project.demoUrl
          ? `<a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
              <span>Live Demo</span>
              <i data-lucide="arrow-up-right"></i>
            </a>`
          : ''
      }
      ${
        project.githubUrl
          ? `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-glass">
              <span>View Source</span>
              <i data-lucide="github"></i>
            </a>`
          : ''
      }
    </div>
  `;

  // Render Lucide icons inside modal
  createIcons({
    icons: {
      ArrowUpRight,
      Github,
      X
    }
  });

  modalOverlay.classList.add('active');
  modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Lock background scroll
}

export function closeModal() {
  if (!modalOverlay) return;

  modalOverlay.classList.remove('active');
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // Unlock background scroll
}

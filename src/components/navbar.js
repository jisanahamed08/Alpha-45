import { getState, setState, subscribe } from '../state/appState.js';

/**
 * Initializes the Navbar component and Theme Switcher UI
 */
export function initNavbarComponent() {
  const switcherContainer = document.getElementById('theme-switcher');
  if (!switcherContainer) return;

  const buttons = switcherContainer.querySelectorAll('.theme-btn');

  /**
   * Updates the active CSS class, body data-theme attribute, and aria attributes on theme buttons
   * @param {string} mode - Active shader mode ('quantum' | 'cyber' | 'plasma' | 'matrix')
   */
  function updateActiveButton(mode) {
    document.body.setAttribute('data-theme', mode);

    buttons.forEach((btn) => {
      const btnMode = btn.getAttribute('data-mode');
      if (btnMode === mode) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  // Handle click events on theme mode buttons
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      if (mode) {
        setState({ shaderMode: mode });
      }
    });
  });

  // Subscribe to central application state updates
  subscribe((state) => {
    if (state.shaderMode) {
      updateActiveButton(state.shaderMode);
    }
  });

  // Set initial active state
  const currentState = getState();
  const initialMode = currentState.shaderMode || 'quantum';
  updateActiveButton(initialMode);
}

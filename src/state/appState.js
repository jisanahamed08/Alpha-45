/**
 * Application State Store (Pub/Sub)
 * Manages central application state across Three.js 3D background modes,
 * UI navbar components, audio mute state, terminal palette, and project modals.
 */

const initialState = {
  shaderMode: 'quantum', // 'quantum' | 'cyber' | 'plasma'
  isMuted: false,
  isTerminalOpen: false,
  activeModalProjectId: null
};

let currentState = { ...initialState };
const listeners = new Set();

/**
 * Returns a shallow copy snapshot of current application state.
 * @returns {typeof initialState}
 */
export function getState() {
  return { ...currentState };
}

/**
 * Updates application state with partial state object and notifies all subscribers.
 * @param {Partial<typeof initialState>} partialState
 */
export function setState(partialState) {
  if (!partialState || typeof partialState !== 'object') return;

  const prevState = { ...currentState };
  let hasChanged = false;

  for (const [key, value] of Object.entries(partialState)) {
    if (currentState[key] !== value) {
      currentState[key] = value;
      hasChanged = true;
    }
  }

  if (hasChanged) {
    const stateSnapshot = { ...currentState };
    listeners.forEach((listener) => {
      try {
        listener(stateSnapshot, prevState);
      } catch (err) {
        console.error('Error in appState subscriber:', err);
      }
    });
  }
}

/**
 * Subscribes a listener callback to state updates.
 * @param {(state: typeof initialState, prevState: typeof initialState) => void} listener
 * @returns {() => void} Unsubscribe function
 */
export function subscribe(listener) {
  if (typeof listener !== 'function') return () => {};

  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const appState = {
  getState,
  setState,
  subscribe
};

export default appState;

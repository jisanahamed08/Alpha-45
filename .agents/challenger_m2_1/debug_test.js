import { createPortfolioDOMEnvironment } from '../../tests/setup-dom.js';
import { getState, setState } from '../../src/state/appState.js';
import { initNavbarComponent } from '../../src/components/navbar.js';
import { initBackgroundScene } from '../../src/three/background.js';

try {
  const env = createPortfolioDOMEnvironment();
  env.document.defaultView = env.window;
  env.window.cancelAnimationFrame = (id) => env.window.cancelAnimationFrame(id);

  console.log('Environment created successfully');
  
  // Test bgScene destroy
  const bgCanvas = env.document.getElementById('bg-canvas');
  const bgScene = initBackgroundScene(bgCanvas);
  bgScene.destroy();
  console.log('Destroy succeeded!');
} catch (err) {
  console.error('Captured exception:', err);
}

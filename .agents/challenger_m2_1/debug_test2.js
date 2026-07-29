import { SimulatedDocument, SimulatedWindow } from '../../tests/setup-dom.js';
import * as THREE from 'three';

const doc = new SimulatedDocument();
const win = new SimulatedWindow(doc);
doc.defaultView = win;
global.document = doc;
global.window = win;
global.cancelAnimationFrame = win.cancelAnimationFrame.bind(win);
global.requestAnimationFrame = win.requestAnimationFrame.bind(win);

const canvas = doc.createElement('canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
console.log('Renderer created');
renderer.dispose();
console.log('Renderer disposed successfully!');

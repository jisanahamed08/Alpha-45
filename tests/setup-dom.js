/**
 * setup-dom.js - Real Production DOM & WebGL Environment Integration Engine for E2E Testing.
 * Ingests real index.html, initializes real src/ components (hero, projects, modal, timeline, skills, contact, three/background),
 * and provides full event dispatching, WebGL 1.0/2.0 stubs, and timer flushing utilities.
 */

import fs from 'fs';
import path from 'path';
import { initNavbarComponent } from '../src/components/navbar.js';
import { initHeroComponent } from '../src/components/hero.js';
import { initProjectsComponent } from '../src/components/projects.js';
import { initModalComponent, openProjectModal, closeModal } from '../src/components/modal.js';
import { initTimelineComponent } from '../src/components/timeline.js';
import { initSkillsComponent } from '../src/components/skills.js';
import { initContactComponent } from '../src/components/contact.js';
import { initBackgroundScene } from '../src/three/background.js';

class SimulatedClassList {
  constructor(element) {
    this.element = element;
    this.classes = new Set();
  }

  add(...classNames) {
    classNames.forEach(c => {
      if (c && typeof c === 'string') {
        c.split(/\s+/).filter(Boolean).forEach(cls => this.classes.add(cls));
      }
    });
    this._sync();
  }

  remove(...classNames) {
    classNames.forEach(c => {
      if (c && typeof c === 'string') {
        c.split(/\s+/).filter(Boolean).forEach(cls => this.classes.delete(cls));
      }
    });
    this._sync();
  }

  toggle(className, force) {
    if (force === true) {
      this.add(className);
      return true;
    } else if (force === false) {
      this.remove(className);
      return false;
    }
    if (this.classes.has(className)) {
      this.classes.delete(className);
      this._sync();
      return false;
    } else {
      this.classes.add(className);
      this._sync();
      return true;
    }
  }

  contains(className) {
    return this.classes.has(className);
  }

  _sync() {
    this.element._attributes['class'] = Array.from(this.classes).join(' ');
  }

  toString() {
    return Array.from(this.classes).join(' ');
  }
}

export class SimulatedEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = options.bubbles !== undefined ? options.bubbles : true;
    this.cancelable = options.cancelable !== undefined ? options.cancelable : true;
    this.defaultPrevented = false;
    this.target = null;
    this.currentTarget = null;
    this.clientX = options.clientX || 0;
    this.clientY = options.clientY || 0;
    this.key = options.key || '';
  }

  preventDefault() {
    if (this.cancelable) {
      this.defaultPrevented = true;
    }
  }

  stopPropagation() {}
}

export class SimulatedTextNode {
  constructor(text = '') {
    this.nodeType = 3;
    this.nodeValue = String(text);
    this._textContent = String(text);
    this.parentNode = null;
    this.children = [];
  }

  get textContent() {
    return this._textContent;
  }

  set textContent(text) {
    this._textContent = String(text);
    this.nodeValue = String(text);
  }
}

export class SimulatedElement {
  constructor(tagName, id = '', classNames = '') {
    this.nodeType = 1;
    this.tagName = tagName ? tagName.toUpperCase() : 'DIV';
    this.id = id;
    this.children = [];
    this.parentNode = null;
    this.eventListeners = {};
    this._attributes = {};
    this.dataset = {};
    this.style = {};
    this.classList = new SimulatedClassList(this);
    
    if (id) {
      this._attributes['id'] = id;
    }
    if (classNames) {
      classNames.split(/\s+/).filter(Boolean).forEach(c => this.classList.add(c));
    }
    
    this._value = '';
    this._textContent = '';
    this.disabled = false;
    this.width = 0;
    this.height = 0;
  }

  get childNodes() {
    return this.children;
  }

  get attributes() {
    const list = [];
    if (this.id) list.push({ name: 'id', value: this.id });
    const clsStr = this.classList.toString();
    if (clsStr) list.push({ name: 'class', value: clsStr });
    for (const [k, v] of Object.entries(this._attributes)) {
      if (k !== 'id' && k !== 'class') {
        list.push({ name: k, value: String(v) });
      }
    }
    return list;
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = String(val);
  }

  get src() {
    return this.getAttribute('src') || '';
  }
  set src(val) {
    this.setAttribute('src', val);
  }

  get alt() {
    return this.getAttribute('alt') || '';
  }
  set alt(val) {
    this.setAttribute('alt', val);
  }

  get href() {
    return this.getAttribute('href') || '';
  }
  set href(val) {
    this.setAttribute('href', val);
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this.children
      .map(c => (c.nodeType === 3 ? c.textContent : c.textContent))
      .join('');
  }

  set textContent(text) {
    this.children = [];
    this._textContent = String(text);
    if (text !== '') {
      const tn = new SimulatedTextNode(text);
      tn.parentNode = this;
      this.children.push(tn);
    }
  }

  get innerHTML() {
    return this.children
      .map(c => {
        if (c.nodeType === 3) return c.textContent;
        const attrs = Object.entries(c._attributes)
          .map(([k, v]) => ` ${k}="${v}"`)
          .join('');
        return `<${c.tagName.toLowerCase()}${attrs}>${c.innerHTML}</${c.tagName.toLowerCase()}>`;
      })
      .join('');
  }

  set innerHTML(html) {
    this.children = [];
    this._textContent = '';
    if (typeof html === 'string' && html.trim().length > 0) {
      parseHTML(html, this, this.ownerDocument || global.document);
    }
  }

  setAttribute(name, val) {
    const strVal = String(val);
    this._attributes[name] = strVal;
    if (name === 'id') this.id = strVal;
    if (name === 'class') {
      this.classList.classes.clear();
      strVal.split(/\s+/).filter(Boolean).forEach(c => this.classList.classes.add(c));
    }
    if (name.startsWith('data-')) {
      const dataKey = name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      this.dataset[dataKey] = strVal;
    }
  }

  getAttribute(name) {
    if (name === 'class') return this.classList.toString();
    if (name === 'id') return this.id;
    if (name.startsWith('data-')) {
      const dataKey = name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      return this.dataset[dataKey] !== undefined ? this.dataset[dataKey] : null;
    }
    return this._attributes[name] !== undefined ? this._attributes[name] : null;
  }

  removeAttribute(name) {
    delete this._attributes[name];
    if (name === 'class') this.classList.classes.clear();
    if (name === 'id') this.id = '';
    if (name.startsWith('data-')) {
      const dataKey = name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      delete this.dataset[dataKey];
    }
  }

  hasAttribute(name) {
    if (name === 'class') return this.classList.classes.size > 0;
    if (name === 'id') return Boolean(this.id);
    if (name.startsWith('data-')) {
      const dataKey = name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      return dataKey in this.dataset;
    }
    return name in this._attributes;
  }

  appendChild(child) {
    if (!child) return child;
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  insertBefore(newChild, refChild) {
    if (!refChild) return this.appendChild(newChild);
    const idx = this.children.indexOf(refChild);
    if (idx !== -1) {
      newChild.parentNode = this;
      this.children.splice(idx, 0, newChild);
    } else {
      this.appendChild(newChild);
    }
    return newChild;
  }

  replaceChild(newChild, oldChild) {
    const idx = this.children.indexOf(oldChild);
    if (idx !== -1) {
      oldChild.parentNode = null;
      newChild.parentNode = this;
      this.children[idx] = newChild;
    }
    return oldChild;
  }

  replaceWith(...nodes) {
    if (!this.parentNode) return;
    const idx = this.parentNode.children.indexOf(this);
    if (idx !== -1) {
      this.parentNode.children.splice(idx, 1, ...nodes);
      nodes.forEach(n => { n.parentNode = this.parentNode; });
      this.parentNode = null;
    }
  }

  addEventListener(type, listener) {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = [];
    }
    this.eventListeners[type].push(listener);
  }

  removeEventListener(type, listener) {
    if (this.eventListeners[type]) {
      this.eventListeners[type] = this.eventListeners[type].filter(l => l !== listener);
    }
  }

  dispatchEvent(event) {
    event.target = event.target || this;
    event.currentTarget = this;
    if (this.eventListeners[event.type]) {
      for (const listener of [...this.eventListeners[event.type]]) {
        listener.call(this, event);
      }
    }
    if (event.bubbles && this.parentNode) {
      this.parentNode.dispatchEvent(event);
    }
    return !event.defaultPrevented;
  }

  click() {
    const evt = new SimulatedEvent('click', { bubbles: true, cancelable: true });
    this.dispatchEvent(evt);
    if (!evt.defaultPrevented && this.tagName === 'A' && this.hasAttribute('href')) {
      if (global.window) {
        global.window.lastNavTarget = this.getAttribute('href');
      }
    }
  }

  focus() {}
  blur() {
    const evt = new SimulatedEvent('blur', { bubbles: false, cancelable: false });
    this.dispatchEvent(evt);
  }

  reset() {
    const inputs = this.querySelectorAll('input, textarea, select');
    inputs.forEach(inp => {
      inp.value = '';
    });
  }

  closest(selector) {
    let curr = this;
    while (curr && curr.nodeType === 1) {
      if (matchesSelector(curr, selector)) return curr;
      curr = curr.parentNode;
    }
    return null;
  }

  querySelector(selector) {
    const results = this.querySelectorAll(selector);
    return results.length > 0 ? results[0] : null;
  }

  querySelectorAll(selector) {
    const results = [];
    const search = (node) => {
      for (const child of node.children) {
        if (child.nodeType === 1) {
          if (matchesSelector(child, selector)) {
            results.push(child);
          }
          search(child);
        }
      }
    };
    search(this);
    return results;
  }

  getContext(type) {
    if (this.tagName === 'CANVAS') {
      if (type === 'webgl2' || type === 'webgl' || type === 'experimental-webgl') {
        return this._webglContext || (this._webglContext = new SimulatedWebGLContext(this));
      }
      if (type === '2d') {
        return this._2dContext || (this._2dContext = new Simulated2DContext(this));
      }
    }
    return null;
  }
}

class Simulated2DContext {
  constructor(canvas) {
    this.canvas = canvas;
    this.fillStyle = '';
    this.strokeStyle = '';
  }
  createRadialGradient() {
    return { addColorStop: () => {} };
  }
  createLinearGradient() {
    return { addColorStop: () => {} };
  }
  fillRect() {}
  clearRect() {}
  strokeRect() {}
  beginPath() {}
  closePath() {}
  arc() {}
  fill() {}
  stroke() {}
  drawImage() {}
  getImageData() {
    return { data: new Uint8ClampedArray(4) };
  }
  putImageData() {}
}

class SimulatedWebGLContext {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderCalls = 0;
    this.clearColorValue = [0, 0, 0, 1];

    // WebGL / WebGL2 Constants
    this.DEPTH_BUFFER_BIT = 0x0100;
    this.STENCIL_BUFFER_BIT = 0x0400;
    this.COLOR_BUFFER_BIT = 0x4000;
    this.POINTS = 0x0000;
    this.LINES = 0x0001;
    this.LINE_LOOP = 0x0002;
    this.LINE_STRIP = 0x0003;
    this.TRIANGLES = 0x0004;
    this.TRIANGLE_STRIP = 0x0005;
    this.TRIANGLE_FAN = 0x0006;
    this.ZERO = 0;
    this.ONE = 1;
    this.SRC_COLOR = 0x0300;
    this.ONE_MINUS_SRC_COLOR = 0x0301;
    this.SRC_ALPHA = 0x0302;
    this.ONE_MINUS_SRC_ALPHA = 0x0303;
    this.DST_ALPHA = 0x0304;
    this.ONE_MINUS_DST_ALPHA = 0x0305;
    this.DST_COLOR = 0x0306;
    this.ONE_MINUS_DST_COLOR = 0x0307;
    this.SRC_ALPHA_SATURATE = 0x0308;
    this.FUNC_ADD = 0x8006;
    this.BLEND_EQUATION = 0x8009;
    this.BLEND_EQUATION_RGB = 0x8009;
    this.BLEND_EQUATION_ALPHA = 0x883d;
    this.FUNC_SUBTRACT = 0x800a;
    this.FUNC_REVERSE_SUBTRACT = 0x800b;
    this.ARRAY_BUFFER = 0x8892;
    this.ELEMENT_ARRAY_BUFFER = 0x8893;
    this.STREAM_DRAW = 0x88e0;
    this.STATIC_DRAW = 0x88e4;
    this.DYNAMIC_DRAW = 0x88e8;
    this.FRAGMENT_SHADER = 0x8b30;
    this.VERTEX_SHADER = 0x8b31;
    this.COMPILE_STATUS = 0x8b81;
    this.LINK_STATUS = 0x8b82;
    this.VALIDATE_STATUS = 0x8b83;
    this.ACTIVE_UNIFORMS = 0x8b86;
    this.ACTIVE_ATTRIBUTES = 0x8b89;
    this.FLOAT = 0x1406;
    this.FLOAT_VEC2 = 0x8b50;
    this.FLOAT_VEC3 = 0x8b51;
    this.FLOAT_VEC4 = 0x8b52;
    this.INT = 0x1404;
    this.UNSIGNED_BYTE = 0x1401;
    this.UNSIGNED_SHORT = 0x1403;
    this.TEXTURE_2D = 0x0de1;
    this.TEXTURE_CUBE_MAP = 0x8513;
    this.TEXTURE0 = 0x84c0;
    this.ACTIVE_TEXTURE = 0x84e0;
    this.REPEAT = 0x2901;
    this.CLAMP_TO_EDGE = 0x812f;
    this.NEAREST = 0x2600;
    this.LINEAR = 0x2601;
    this.RGBA = 0x1908;
    this.RGB = 0x1907;
    this.ALPHA = 0x1906;
    this.UNPACK_FLIP_Y_WEBGL = 0x9240;
    this.UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
    this.MAX_TEXTURE_SIZE = 0x0d33;
    this.MAX_CUBE_MAP_TEXTURE_SIZE = 0x851c;
    this.MAX_VERTEX_ATTRIBS = 0x8869;
    this.MAX_VERTEX_UNIFORM_VECTORS = 0x8dfb;
    this.MAX_VARYING_VECTORS = 0x8dfc;
    this.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8b4d;
    this.MAX_VERTEX_TEXTURE_IMAGE_UNITS = 0x8b4c;
    this.MAX_TEXTURE_IMAGE_UNITS = 0x8872;
    this.MAX_FRAGMENT_UNIFORM_VECTORS = 0x8dfd;
    this.MAX_RENDERBUFFER_SIZE = 0x84e8;
    this.MAX_VIEWPORT_DIMS = 0x0d3a;
    this.SHADING_LANGUAGE_VERSION = 0x8b8c;
    this.VENDOR = 0x1f00;
    this.RENDERER = 0x1f01;
    this.VERSION = 0x1f02;
    this.HIGH_FLOAT = 0x8df0;
    this.MEDIUM_FLOAT = 0x8df1;
    this.LOW_FLOAT = 0x8df2;
    this.DEPTH_TEST = 0x0b71;
    this.BLEND = 0x0be2;
    this.SCISSOR_TEST = 0x0c11;
    this.CULL_FACE = 0x0b44;
    this.ADDITIVE_BLENDING = 2;
    this.MAX_3D_TEXTURE_SIZE = 0x8073;
    this.MAX_ARRAY_TEXTURE_LAYERS = 0x889f;
    this.UNIFORM_BUFFER = 0x8a53;

    return new Proxy(this, {
      get(target, prop) {
        if (prop in target) {
          return target[prop];
        }
        if (typeof prop === 'string' && !prop.startsWith('_')) {
          if (prop === 'getActiveUniform') {
            return (p, idx) => ({ name: `u_${idx}`, type: 0x1406, size: 1 });
          }
          if (prop === 'getActiveAttrib') {
            return (p, idx) => ({ name: `a_${idx}`, type: 0x1406, size: 1 });
          }
          if (prop.startsWith('draw')) {
            return (...args) => {
              target.renderCalls++;
            };
          }
          if (prop === 'createBuffer' || prop === 'createShader' || prop === 'createProgram' || prop === 'createTexture' || prop === 'createFramebuffer' || prop === 'createRenderbuffer' || prop === 'createVertexArray' || prop === 'createTransformFeedback') {
            return () => ({});
          }
          if (prop === 'getShaderParameter' || prop === 'getProgramParameter') {
            return (prog, pname) => {
              if (pname === target.ACTIVE_UNIFORMS || pname === target.ACTIVE_ATTRIBUTES) return 0;
              return true;
            };
          }
          if (prop === 'getShaderInfoLog' || prop === 'getProgramInfoLog') {
            return () => '';
          }
          if (prop === 'getAttribLocation') {
            return () => 0;
          }
          if (prop === 'getUniformLocation') {
            return (p, name) => ({ name });
          }
          return () => {};
        }
        return undefined;
      }
    });
  }

  isContextLost() {
    return false;
  }

  getContextAttributes() {
    return {
      alpha: true,
      depth: true,
      stencil: true,
      antialias: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'default',
      failIfMajorPerformanceCaveat: false
    };
  }

  getExtension(name) {
    if (name === 'ANGLE_instanced_arrays') {
      return {
        drawArraysInstancedANGLE: () => { this.renderCalls++; },
        drawElementsInstancedANGLE: () => { this.renderCalls++; },
        vertexAttribDivisorANGLE: () => {}
      };
    }
    return { MAX_TEXTURE_MAX_ANISOTROPY_EXT: 0x84fe };
  }

  getParameter(pname) {
    if (pname === this.MAX_TEXTURE_IMAGE_UNITS) return 16;
    if (pname === this.MAX_COMBINED_TEXTURE_IMAGE_UNITS) return 32;
    if (pname === this.MAX_TEXTURE_SIZE) return 16384;
    if (pname === this.MAX_CUBE_MAP_TEXTURE_SIZE) return 16384;
    if (pname === this.MAX_VERTEX_ATTRIBS) return 16;
    if (pname === this.MAX_VERTEX_UNIFORM_VECTORS) return 1024;
    if (pname === this.MAX_VARYING_VECTORS) return 30;
    if (pname === this.MAX_FRAGMENT_UNIFORM_VECTORS) return 1024;
    if (pname === this.MAX_VERTEX_TEXTURE_IMAGE_UNITS) return 16;
    if (pname === this.MAX_VIEWPORT_DIMS) return [16384, 16384];
    if (pname === this.VERSION) return 'WebGL 2.0';
    if (pname === this.SHADING_LANGUAGE_VERSION) return 'WebGL GLSL ES 3.00';
    if (pname === this.VENDOR) return 'WebKit';
    if (pname === this.RENDERER) return 'WebKit WebGL';
    return 0;
  }

  getShaderPrecisionFormat() {
    return { rangeMin: 127, rangeMax: 127, precision: 23 };
  }
}

function matchesCompound(el, compound) {
  if (!el || el.nodeType !== 1) return false;
  let remaining = compound.trim();
  if (!remaining) return false;

  const tagMatch = remaining.match(/^([a-zA-Z0-9]+)/);
  if (tagMatch) {
    if (el.tagName.toLowerCase() !== tagMatch[1].toLowerCase()) return false;
    remaining = remaining.slice(tagMatch[1].length);
  }

  while (remaining.length > 0) {
    if (remaining.startsWith('#')) {
      const m = remaining.match(/^#([a-zA-Z0-9_-]+)/);
      if (!m || el.id !== m[1]) return false;
      remaining = remaining.slice(m[0].length);
    } else if (remaining.startsWith('.')) {
      const m = remaining.match(/^\.([a-zA-Z0-9_-]+)/);
      if (!m || !el.classList.contains(m[1])) return false;
      remaining = remaining.slice(m[0].length);
    } else if (remaining.startsWith('[')) {
      const m = remaining.match(/^\[([a-zA-Z0-9_-]+)(?:=["']?([^"']*)["']?)?\]/);
      if (!m) return false;
      const attrName = m[1];
      const attrVal = m[2];
      if (!el.hasAttribute(attrName)) return false;
      if (attrVal !== undefined && el.getAttribute(attrName) !== attrVal) return false;
      remaining = remaining.slice(m[0].length);
    } else {
      break;
    }
  }
  return true;
}

function matchesSingleSelector(el, selector) {
  if (!el || el.nodeType !== 1) return false;
  const parts = selector.trim().split(/\s+/);
  if (parts.length === 1) {
    return matchesCompound(el, parts[0]);
  }
  
  if (!matchesCompound(el, parts[parts.length - 1])) return false;

  let currentEl = el.parentNode;
  let partIdx = parts.length - 2;
  while (currentEl && partIdx >= 0) {
    if (currentEl.nodeType === 1 && matchesCompound(currentEl, parts[partIdx])) {
      partIdx--;
    }
    currentEl = currentEl.parentNode;
  }
  return partIdx < 0;
}

function matchesSelector(el, selector) {
  if (!el || el.nodeType !== 1) return false;
  const groups = selector.split(',');
  for (const group of groups) {
    if (matchesSingleSelector(el, group.trim())) return true;
  }
  return false;
}

export class SimulatedDocument {
  constructor() {
    this.body = new SimulatedElement('body');
    this.head = new SimulatedElement('head');
    this.documentElement = new SimulatedElement('html');
    this.body.ownerDocument = this;
    this.head.ownerDocument = this;
    this.documentElement.ownerDocument = this;
    this.eventListeners = {};
  }

  createElement(tagName) {
    const el = new SimulatedElement(tagName);
    el.ownerDocument = this;
    return el;
  }

  createElementNS(ns, tagName) {
    return this.createElement(tagName);
  }

  createTextNode(text) {
    return new SimulatedTextNode(text);
  }

  getElementById(id) {
    return this.querySelector(`#${id}`);
  }

  getElementsByClassName(className) {
    return this.querySelectorAll(`.${className}`);
  }

  getElementsByTagName(tagName) {
    return this.querySelectorAll(tagName);
  }

  querySelector(selector) {
    if (matchesSelector(this.body, selector)) return this.body;
    return this.body.querySelector(selector);
  }

  querySelectorAll(selector) {
    const results = [];
    if (matchesSelector(this.body, selector)) results.push(this.body);
    results.push(...this.body.querySelectorAll(selector));
    return results;
  }

  addEventListener(type, listener) {
    if (!this.eventListeners[type]) this.eventListeners[type] = [];
    this.eventListeners[type].push(listener);
  }

  removeEventListener(type, listener) {
    if (this.eventListeners[type]) {
      this.eventListeners[type] = this.eventListeners[type].filter(l => l !== listener);
    }
  }

  dispatchEvent(event) {
    if (this.eventListeners[event.type]) {
      for (const listener of [...this.eventListeners[event.type]]) {
        listener.call(this, event);
      }
    }
  }
}

export class SimulatedWindow {
  constructor(document) {
    this.document = document;
    this.innerWidth = 1440;
    this.innerHeight = 900;
    this.devicePixelRatio = 1.0;
    this.eventListeners = {};
    this.animationFrameCallbacks = new Map();
    this.nextFrameId = 1;
    this.frameCount = 0;
    this.timeouts = new Map();
    this.nextTimeoutId = 1;
    this.lastNavTarget = null;
  }

  addEventListener(type, listener) {
    if (!this.eventListeners[type]) this.eventListeners[type] = [];
    this.eventListeners[type].push(listener);
  }

  removeEventListener(type, listener) {
    if (this.eventListeners[type]) {
      this.eventListeners[type] = this.eventListeners[type].filter(l => l !== listener);
    }
  }

  dispatchEvent(event) {
    if (this.eventListeners[event.type]) {
      for (const listener of [...this.eventListeners[event.type]]) {
        listener.call(this, event);
      }
    }
  }

  requestAnimationFrame(callback) {
    const id = this.nextFrameId++;
    this.animationFrameCallbacks.set(id, callback);
    return id;
  }

  cancelAnimationFrame(id) {
    this.animationFrameCallbacks.delete(id);
  }

  setTimeout(fn, delay, ...args) {
    const id = this.nextTimeoutId++;
    this.timeouts.set(id, { fn, delay, args });
    return id;
  }

  clearTimeout(id) {
    this.timeouts.delete(id);
  }

  flushTimeouts() {
    const pending = Array.from(this.timeouts.entries());
    this.timeouts.clear();
    for (const [, item] of pending) {
      if (typeof item.fn === 'function') {
        item.fn(...item.args);
      }
    }
  }

  stepFrames(count = 1) {
    for (let i = 0; i < count; i++) {
      if (global.performance && typeof global.performance.advance === 'function') {
        global.performance.advance(20);
      }
      this.frameCount++;
      const callbacks = Array.from(this.animationFrameCallbacks.entries());
      this.animationFrameCallbacks.clear();
      for (const [, cb] of callbacks) {
        cb(global.performance ? global.performance.now() : Date.now());
      }
    }
  }

  resize(width, height) {
    this.innerWidth = width;
    this.innerHeight = height;
    const evt = new SimulatedEvent('resize');
    this.dispatchEvent(evt);
  }
}

class MockIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.observedElements = [];
  }

  observe(element) {
    this.observedElements.push(element);
    if (this.callback) {
      this.callback(
        [{ isIntersecting: true, target: element }],
        this
      );
    }
  }

  unobserve(element) {
    this.observedElements = this.observedElements.filter(e => e !== element);
  }

  disconnect() {
    this.observedElements = [];
  }
}

function parseHTML(htmlString, parentElement, doc) {
  const cleanHtml = htmlString.replace(/<!--[\s\S]*?-->/g, '');
  const tagRegex = /<(\/)?([a-zA-Z0-9:-]+)([^>]*?)(\/)?>|([^<]+)/g;
  const stack = [parentElement];
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

  let match;
  while ((match = tagRegex.exec(cleanHtml)) !== null) {
    const [, isClosing, rawTagName, attrString, isSelfClosing, textContent] = match;

    if (textContent) {
      const trimmed = textContent;
      if (trimmed.length > 0) {
        const currentParent = stack[stack.length - 1];
        if (currentParent) {
          const textNode = doc ? doc.createTextNode(trimmed) : new SimulatedTextNode(trimmed);
          currentParent.appendChild(textNode);
        }
      }
      continue;
    }

    const tagName = rawTagName.toLowerCase();

    if (isClosing) {
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tagName && stack[i].tagName.toLowerCase() === tagName) {
          stack.length = i;
          break;
        }
      }
    } else {
      const el = doc ? doc.createElement(tagName) : new SimulatedElement(tagName);

      if (attrString) {
        const attrRegex = /([a-zA-Z0-9_:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(attrString)) !== null) {
          const attrName = attrMatch[1];
          const attrVal = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';
          el.setAttribute(attrName, attrVal);
        }
      }

      const currentParent = stack[stack.length - 1];
      if (currentParent) {
        currentParent.appendChild(el);
      }

      if (!isSelfClosing && !voidTags.has(tagName)) {
        stack.push(el);
      }
    }
  }
}

/**
 * Loads real index.html and initializes real production src/ components.
 */
export function createPortfolioDOMEnvironment() {
  const document = new SimulatedDocument();
  const window = new SimulatedWindow(document);
  
  let perfTime = 1000;
  global.document = document;
  global.window = window;
  global.IntersectionObserver = MockIntersectionObserver;
  global.performance = {
    now: () => perfTime,
    advance: (ms = 20) => { perfTime += ms; }
  };
  global.requestAnimationFrame = window.requestAnimationFrame.bind(window);
  global.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
  global.setTimeout = window.setTimeout.bind(window);
  global.clearTimeout = window.clearTimeout.bind(window);

  // Ingest real index.html
  const htmlPath = path.resolve(process.cwd(), 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');

  // Extract body contents from index.html and parse into document.body
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : html;
  parseHTML(bodyHtml, document.body, document);

  // Initialize production JS modules
  initNavbarComponent();
  initHeroComponent();
  initModalComponent();
  initProjectsComponent();
  initTimelineComponent();
  initSkillsComponent();
  initContactComponent();

  // Initialize WebGL scene on #bg-canvas
  const bgCanvas = document.getElementById('bg-canvas');
  if (bgCanvas) {
    initBackgroundScene(bgCanvas);
  }

  // Flush initial render timers (e.g. initial renderGrid call in projects.js)
  window.flushTimeouts();

  return {
    document,
    window,
    webglContext: bgCanvas ? bgCanvas.getContext('webgl') : null,
    openProjectModal,
    closeModal
  };
}

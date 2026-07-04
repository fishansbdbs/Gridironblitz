import * as THREE from 'three';
export function ps1Material(color, options = {}) { return new THREE.MeshLambertMaterial({ color, flatShading: true, fog: true, ...options }); }
export function createRenderer(canvas) { return new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' }); }

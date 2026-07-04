export class InputManager { constructor() { this.keys = new Set(); } down(code) { return this.keys.has(code); } }

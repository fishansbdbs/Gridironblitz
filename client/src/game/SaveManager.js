export class SaveManager { load() { return {}; } save(data) { localStorage.setItem('gridiron-blitz-97-save', JSON.stringify(data)); } }

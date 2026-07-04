import { THREE } from './GameShared.js';

export const gameRuntimeCameraMethods = {
  updateMarkers() {
    if (!this.los || !this.first || !this.match) return;
    this.los.position.set(0, 0.42, this.snapZ);
    this.first.position.set(0, 0.45, this.snapZ + this.dir * this.match.toGo);
  },
  cameraUpdate(dt) {
    const focus = this.ballMode === 'air' ? this.ballMesh.position : (this.carrier?.mesh.position ?? new THREE.Vector3(0, 0, 50));
    let target;
    if (this.settings.camera === 'Broadcast') {
      target = new THREE.Vector3(46, 38, focus.z - 8);
    } else if (this.settings.camera === 'Ball Cam') {
      target = new THREE.Vector3(focus.x * 0.55, 24, focus.z - this.dir * 16);
    } else {
      target = new THREE.Vector3(focus.x * 0.35, this.phase === 'live' ? 27 : 36, focus.z - this.dir * (this.phase === 'live' ? 20 : 31));
    }
    if (this.shake > 0 && this.settings.shake) {
      this.shake -= dt;
      target.x += (Math.random() - 0.5) * 1.8;
      target.y += (Math.random() - 0.5) * 0.9;
    }
    this.camera.position.lerp(target, 1 - Math.pow(0.001, dt));
    this.camera.lookAt(focus.x * 0.25, 1.5, focus.z + this.dir * 7);
    this.updateMarkers();
    this.updateMarkerMeshes();
  },
  updateMarkerMeshes() {
    const selected = this.players.find((player) => player === this.carrier) ?? this.players.find((player) => player.role === 'QB' && player.side === this.offense);
    const target = this.players.find((player) => player.role === this.target && player.side === this.offense);
    if (selected) {
      this.selectedMarker.visible = true;
      this.selectedMarker.position.set(selected.mesh.position.x, 0.12, selected.mesh.position.z);
    }
    if (target) {
      this.targetMarker.visible = true;
      this.targetMarker.position.set(target.mesh.position.x, 0.15, target.mesh.position.z);
    }
  }
};

import {
  FIELD,
  distanceXZ,
  resolveTackleOutcome,
  tackleAngle,
  withDifficulty
} from './GameShared.js';

export const gameRuntimeContactMethods = {
  checkTackle() {
    if (!this.carrier || this.phase !== 'live' || this.ballMode === 'air') return;
    const tacklers = this.players.filter((player) => player.side !== this.carrier.side && distanceXZ(player, this.carrier) < player.ratings.radius + this.carrier.ratings.radius + 0.28);
    if (!tacklers.length) return;
    const tackler = tacklers[0];
    const angle = tackleAngle(tackler, this.carrier, this.dir);
    const speed = Math.min(1.2, Math.hypot(this.carrier.vx ?? 0, this.carrier.vz ?? 0) / 12);
    const outcome = resolveTackleOutcome({
      tackler: withDifficulty(tackler, this.settings.difficulty),
      carrier: this.carrier,
      angle,
      speed,
      helpers: tacklers.length - 1,
      roll: Math.random()
    });
    if (outcome.result === 'broken') {
      this.status = outcome.message;
      this.banner = 'BROKEN TACKLE';
      this.sound('bump');
      this.carrier.mesh.position.z += this.dir * 1.2;
      tackler.mesh.position.z -= this.dir * 1.3;
      this.shake = 0.08;
      this.renderHud();
      return;
    }
    this.endPlay({ type: 'tackle', yards: this.yardsFrom(this.carrier), pass: this.passDone, message: outcome.message });
  },
  checkBounds() {
    if (!this.carrier || this.ballMode === 'air') return;
    if (Math.abs(this.carrier.mesh.position.x) > FIELD.rightBound) {
      this.endPlay({ type: 'out', yards: this.yardsFrom(this.carrier), pass: this.passDone, message: 'Out of Bounds' });
    }
    if (this.dir === 1 ? this.carrier.mesh.position.z >= 100 : this.carrier.mesh.position.z <= 0) {
      this.endPlay({ type: 'touchdown', yards: 100, pass: this.passDone, message: 'TOUCHDOWN' });
    }
  }
};

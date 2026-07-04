import {
  THREE,
  clamp,
  distanceXZ,
  nearestDefender,
  resolvePassOutcome
} from './GameShared.js';

export const gameRuntimePassingMethods = {
  throwPass(role) {
    if (!this.carrier || this.carrier.role !== 'QB' || this.ballMode === 'air') return;
    const target = this.players.find((player) => player.role === role && player.side === this.offense);
    if (!target) return;
    const read = this.setDefensiveRead?.(this.currentPlay, role) ?? this.readModifier ?? {};
    const pressure = clamp(this.qbPressure() + (read.pressure ?? 0), 0, 1);
    const lead = new THREE.Vector3(target.mesh.position.x, 1.6, target.mesh.position.z + this.dir * (5 + target.ratings.routeRunning / 25));
    const defender = nearestDefender(target, this.players);
    const separation = defender ? Math.max(0.5, distanceXZ(target, defender) + (read.separation ?? 0)) : 8 + (read.separation ?? 0);
    const adjustedDefender = defender
      ? { ...defender, ratings: { ...defender.ratings, coverage: defender.ratings.coverage + (read.coverage ?? 0) * 40 } }
      : defender;
    this.passOutcome = resolvePassOutcome({
      qb: this.carrier,
      receiver: target,
      defender: adjustedDefender,
      distance: this.carrier.mesh.position.distanceTo(lead),
      separation,
      pressure,
      roll: Math.random()
    });
    if (['overthrown', 'underthrown'].includes(this.passOutcome.result)) lead.z += this.dir * 6;
    if (this.passOutcome.result === 'deflected') lead.x += defender ? (defender.mesh.position.x - target.mesh.position.x) * 0.3 : 2;
    this.ballMode = 'air';
    this.passTarget = target;
    this.passDefender = defender;
    this.passT = 0;
    this.passStart = this.carrier.mesh.position.clone().add(new THREE.Vector3(0.3, 2.6, 0));
    this.passEnd = lead;
    this.target = role;
    this.lastReadFeedback = read.feedback ?? '';
    this.status = this.lastReadFeedback ? `${this.passOutcome.feedback} - ${this.lastReadFeedback}` : this.passOutcome.feedback;
    this.banner = pressure > 0.55 ? 'UNDER PRESSURE' : 'PASS';
    this.sound('throw');
    this.renderHud();
  },
  updatePass(dt) {
    this.passT += dt / Math.max(0.5, this.passStart.distanceTo(this.passEnd) / 38);
    const t = Math.min(1, this.passT);
    this.ballMesh.position.lerpVectors(this.passStart, this.passEnd, t);
    this.ballMesh.position.y += Math.sin(t * Math.PI) * 8;
    this.ballMesh.rotation.x += dt * 18;
    this.ballMesh.rotation.z += dt * 10;
    if (Math.random() < 0.35) this.addTrail(this.ballMesh.position);
    if (t >= 1) this.finishPass();
  },
  finishPass() {
    const outcome = this.passOutcome?.result ?? 'incomplete';
    this.ballMode = 'held';
    if (outcome === 'caught') {
      this.carrier = this.passTarget;
      this.passDone = true;
      this.status = this.passOutcome.feedback;
      this.banner = this.passOutcome.feedback.toUpperCase();
      this.sound('catch');
      this.renderHud();
      return;
    }
    if (outcome === 'intercepted' && this.passDefender) {
      this.carrier = this.passDefender;
      this.endPlay({ type: 'interception', yards: this.yardsFrom(this.passDefender), pass: true, message: 'INTERCEPTION' });
      return;
    }
    this.endPlay({ type: 'incomplete', yards: 0, pass: true, message: this.passOutcome?.feedback ?? 'Incomplete pass' });
  }
};

import {
  DIFFICULTY,
  FIELD,
  clamp,
  distanceXZ
} from './GameShared.js';

export const gameRuntimeMovementMethods = {
  juke() {
    if (!this.carrier) return;
    this.carrier.mesh.position.x = clamp(this.carrier.mesh.position.x + (Math.random() > 0.5 ? 1 : -1) * (1.5 + this.carrier.ratings.agility / 50), FIELD.leftBound, FIELD.rightBound);
    this.status = 'Cut move!';
    this.addDust(this.carrier.mesh.position, '#d9f99d');
    this.renderHud();
  },
  routeSpeed(player) {
    return 4.8 + player.ratings.speed * 0.085 + player.ratings.routeRunning * 0.035;
  },
  defenderSpeed(player) {
    const difficulty = DIFFICULTY[this.settings.difficulty] ?? DIFFICULTY.Pro;
    return (4.7 + player.ratings.speed * 0.09 + (player.ratings.coverage + difficulty.coverage) * 0.025);
  },
  blockSlow(player) {
    return player.blockTimer > 0 ? 0.27 : 1;
  },
  coverageTarget(player) {
    const map = { CB1: 'WR1', CB2: 'WR2', LB: 'TE', S1: 'WR1', S2: 'WR2' };
    return this.players.find((item) => item.side === this.offense && item.role === map[player.role]);
  },
  qbPressure() {
    const qb = this.players.find((player) => player.side === this.offense && player.role === 'QB');
    if (!qb) return 0;
    const rushers = this.players.filter((player) => player.side !== this.offense && ['DL1', 'DL2', 'LB'].includes(player.role));
    const nearestDistance = Math.min(...rushers.map((player) => distanceXZ(player, qb)));
    return clamp((6 - nearestDistance) / 5, 0, 1);
  },
  yardsFrom(player) {
    if (!player) return 0;
    return Math.round((player.mesh.position.z - this.snapZ) * this.dir);
  }
};

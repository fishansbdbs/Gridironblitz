import {
  THREE,
  TEAMS,
  STADIUMS,
  PLAYS,
  FIELD,
  ROLES,
  SETTINGS_DEFAULTS,
  UPDATE_NAME,
  VERSION,
  createMatchState,
  applyPlayResult,
  displayYardLine,
  ordinal,
  archetypeForRole,
  buildPlayerRatings,
  resolveBlockMatchup,
  resolvePassOutcome,
  resolvePlayerCollisions,
  resolveTackleOutcome,
  FORMATIONS,
  DEFENSE,
  DIFFICULTY,
  teamCard,
  playCard,
  selectSetting,
  routePreview,
  logoHtml,
  logoSvg,
  logoPlane,
  textPlane,
  makeTextTexture,
  footballMesh,
  playerMesh,
  markerMesh,
  addBox,
  mat,
  box,
  moveToward,
  nearest,
  nearestDefender,
  distanceXZ,
  midpoint,
  tackleAngle,
  withDifficulty,
  bannerFor,
  approach,
  clamp,
  loadSettings
} from './GameShared.js';

export const gameRuntimeControlMethods = {
    callPlay(play) {
    if (!play) return;
    this.currentPlay = play;
    this.playIndex = PLAYS.indexOf(play);
    this.target = play.recommendedTarget || 'WR1';
    this.lineup();
    this.phase = 'pre-snap';
    this.status = `${play.formation} - ${play.name}. Space snaps the ball.`;
    this.banner = '';
    this.renderHud();
  },
    snap() {
    if (this.phase !== 'pre-snap') return;
    this.phase = 'live';
    this.liveTime = 0;
    this.status = 'Ball snapped!';
    this.banner = '';
    this.sound('snap');
    if (this.currentPlay.type === 'run') {
      this.carrier = this.players.find((player) => player.role === 'RB' && player.side === this.offense);
    }
    this.renderHud();
  },
    resetPracticePlay() {
    if (!this.match) return;
    this.phase = 'play-select';
    this.status = 'Practice reset. Choose another rep.';
    this.lineup();
    this.renderHud();
  },
    update(dt) {
    if (!this.match || !['live', 'result', 'play-select', 'pre-snap'].includes(this.phase)) return;
    if (this.phase === 'live') {
      this.liveTime += dt;
      this.gameClock = this.gameClock == null ? null : Math.max(0, this.gameClock - dt);
      this.updatePlayers(dt);
      this.resolveContacts(dt);
      if (this.ballMode === 'air') this.updatePass(dt);
      this.checkTackle();
      this.checkBounds();
      if (this.liveTime > 10) this.endPlay({ type: 'tackle', yards: this.yardsFrom(this.carrier), pass: this.passDone, message: 'Forward progress stopped.' });
      if (this.gameClock === 0) this.match.winner = this.match.score.home >= this.match.score.away ? this.match.homeTeam.name : this.match.awayTeam.name;
    }
    if (this.carrier && this.ballMode === 'held') this.ballMesh.position.set(this.carrier.mesh.position.x + 0.35, 2.45, this.carrier.mesh.position.z + 0.22);
    this.updateEffects(dt);
    this.cameraUpdate(dt);
    this.animatePlayers(dt);
  },
    updatePlayers(dt) {
    const carrier = this.carrier;
    if (carrier && this.offense === 'home') this.updateHumanCarrier(carrier, dt);
    if (carrier && this.offense !== 'home') this.updateCpuCarrier(carrier, dt);
    this.updateRoutesAndCoverage(dt);
    this.updateBlocking(dt);
  },
    updateHumanCarrier(player, dt) {
    const x = (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0);
    const z = (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0);
    const length = Math.hypot(x, z) || 1;
    const sprint = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    this.drivePlayer(player, x / length, (z / length) * this.dir, sprint, dt);
  },
    updateCpuCarrier(player, dt) {
    const lane = Math.sin(this.elapsed * 1.7) * 0.45;
    this.drivePlayer(player, lane, this.dir, false, dt);
    if (player.role === 'QB' && this.liveTime > 1.1 && this.currentPlay.type !== 'run') this.throwPass(this.currentPlay.recommendedTarget ?? 'WR1');
  },
    drivePlayer(player, x, z, sprint, dt) {
    const max = (7.5 + player.ratings.speed * 0.16) * (sprint ? 1.2 : 1);
    const accel = 9 + player.ratings.acceleration * 0.12;
    player.vx = approach(player.vx, x * max, accel * dt);
    player.vz = approach(player.vz, z * max, accel * dt);
    player.mesh.position.x = clamp(player.mesh.position.x + player.vx * dt, FIELD.leftBound - 1, FIELD.rightBound + 1);
    player.mesh.position.z = clamp(player.mesh.position.z + player.vz * dt, -1, 101);
    if (Math.hypot(player.vx, player.vz) > 0.2) player.mesh.rotation.y = Math.atan2(player.vx, player.vz);
    if (sprint && Math.random() < 0.25) this.addDust(player.mesh.position, '#d9f99d');
  },
};

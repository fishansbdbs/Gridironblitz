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

export const gameRuntimeFlowMethods = {
    updateRoutesAndCoverage(dt) {
    const difficulty = DIFFICULTY[this.settings.difficulty] ?? DIFFICULTY.Pro;
    const catchPoint = this.ballMode === 'air' ? this.passEnd : null;
    for (const player of this.players) {
      if (player === this.carrier) continue;
      if (player.side === this.offense) {
        if (player.role.startsWith('OL')) continue;
        const lastPoint = player.route[player.route.length - 1];
        const point = player.route[player.routeIndex] ?? lastPoint;
        if (point && moveToward(player, point, this.routeSpeed(player), dt)) {
          player.routeIndex = Math.min(player.routeIndex + 1, Math.max(0, player.route.length - 1));
        } else if (lastPoint && player.routeIndex >= player.route.length - 1 && this.phase === 'live') {
          const drift = nearestDefender(player, this.players)?.mesh.position.x > player.mesh.position.x ? -1 : 1;
          this.drivePlayer(player, drift * 0.25, this.dir * 0.65, false, dt);
        }
      } else {
        const assignment = this.coverageTarget(player);
        if (catchPoint && this.ballMode === 'air') {
          moveToward(player, catchPoint, this.defenderSpeed(player) * difficulty.reaction, dt);
        } else if (['DL1', 'DL2', 'LB'].includes(player.role) && this.carrier) {
          const lane = player.role === 'LB' ? 0 : (player.role === 'DL1' ? -2 : 2);
          moveToward(player, { x: this.carrier.mesh.position.x + lane, z: this.carrier.mesh.position.z }, this.defenderSpeed(player) * this.blockSlow(player) * difficulty.reaction, dt);
        } else if (assignment) {
          const cushion = player.role.startsWith('S') ? 7 : 3.2;
          moveToward(player, { x: assignment.mesh.position.x, z: assignment.mesh.position.z + this.dir * cushion }, this.defenderSpeed(player) * 0.82 * difficulty.reaction, dt);
        }
      }
    }
  },
    updateBlocking(dt) {
    const blockers = this.players.filter((player) => player.side === this.offense && ['OL1', 'OL2', 'TE', 'RB'].includes(player.role));
    const rushers = this.players.filter((player) => player.side !== this.offense && ['DL1', 'DL2', 'LB'].includes(player.role));
    for (const player of [...blockers, ...rushers]) {
      player.blockTimer = Math.max(0, (player.blockTimer ?? 0) - dt);
      if (player.blockTimer <= 0 && player.blockState === 'engaged_block') player.blockState = 'released';
    }
    for (const blocker of blockers) {
      const rusher = nearest(blocker, rushers);
      if (!rusher) continue;
      if (distanceXZ(blocker, rusher) < 4.2) {
        const result = resolveBlockMatchup(blocker, rusher, dt);
        blocker.blockState = result.state;
        rusher.blockState = result.state;
        moveToward(blocker, rusher.mesh.position, this.routeSpeed(blocker) * 0.55, dt);
        blocker.mesh.rotation.x = -0.12;
        rusher.mesh.rotation.x = 0.1;
        if (Math.random() < 0.08) this.addDust(midpoint(blocker.mesh.position, rusher.mesh.position), '#cbd5e1');
      } else if (this.phase === 'live' && rusher.mesh.position.z * this.dir > blocker.mesh.position.z * this.dir) {
        moveToward(blocker, { x: rusher.mesh.position.x, z: rusher.mesh.position.z - this.dir * 1.4 }, this.routeSpeed(blocker) * 0.7, dt);
      }
    }
  },
    resolveContacts(dt) {
    const bodies = this.players.map((player) => ({
      x: player.mesh.position.x,
      z: player.mesh.position.z,
      radius: player.ratings.radius,
      mass: player.ratings.mass,
      player
    }));
    const contacts = resolvePlayerCollisions(bodies, dt);
    for (const body of bodies) {
      body.player.mesh.position.x = clamp(body.x, FIELD.leftBound - 1.2, FIELD.rightBound + 1.2);
      body.player.mesh.position.z = clamp(body.z, -1, 101);
    }
    for (const contact of contacts) {
      contact.a.player.contactTimer = 0.16;
      contact.b.player.contactTimer = 0.16;
      const a = contact.a.player;
      const b = contact.b.player;
      if ((a === this.carrier || b === this.carrier) && Math.random() < 0.2) this.addDust(midpoint(a.mesh.position, b.mesh.position), '#fef3c7');
    }
  },
};

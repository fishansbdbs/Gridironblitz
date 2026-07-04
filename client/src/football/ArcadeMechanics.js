export const POSITION_ARCHETYPES = {
  QB: { speed: -2, acceleration: 0, strength: 0, blocking: -28, tackling: -25, catching: -12, throwAccuracy: 28, throwPower: 24, coverage: -24, agility: 4, mass: 1.15, radius: 1.02 },
  RB: { speed: 4, acceleration: 8, strength: 10, blocking: 2, tackling: -14, catching: 6, throwAccuracy: -24, throwPower: -20, coverage: -12, agility: 12, mass: 1.2, radius: 1.04 },
  WR: { speed: 10, acceleration: 8, strength: -4, blocking: -8, tackling: -15, catching: 16, throwAccuracy: -22, throwPower: -22, coverage: -8, agility: 14, mass: 0.92, radius: 0.92 },
  TE: { speed: 2, acceleration: 2, strength: 10, blocking: 12, tackling: -8, catching: 11, throwAccuracy: -24, throwPower: -18, coverage: -4, agility: 4, mass: 1.35, radius: 1.08 },
  OL: { speed: -8, acceleration: -8, strength: 24, blocking: 28, tackling: -10, catching: -18, throwAccuracy: -28, throwPower: -18, coverage: -22, agility: -10, mass: 1.85, radius: 1.22 },
  DL: { speed: -4, acceleration: -4, strength: 22, blocking: -8, tackling: 18, catching: -16, throwAccuracy: -24, throwPower: -16, coverage: -12, agility: -4, mass: 1.7, radius: 1.18 },
  LB: { speed: 1, acceleration: 0, strength: 14, blocking: -4, tackling: 20, catching: -4, throwAccuracy: -22, throwPower: -16, coverage: 7, agility: 2, mass: 1.35, radius: 1.08 },
  DB: { speed: 9, acceleration: 8, strength: -2, blocking: -12, tackling: 12, catching: 4, throwAccuracy: -24, throwPower: -20, coverage: 22, agility: 12, mass: 0.96, radius: 0.94 }
};

export function archetypeForRole(role) {
  if (role === 'QB') return 'QB';
  if (role === 'RB') return 'RB';
  if (role?.startsWith('WR')) return 'WR';
  if (role === 'TE') return 'TE';
  if (role?.startsWith('OL')) return 'OL';
  if (role?.startsWith('DL')) return 'DL';
  if (role === 'LB') return 'LB';
  return 'DB';
}

export function buildPlayerRatings(team, role, rosterPlayer = {}) {
  const base = team.gameplay ?? {};
  const type = archetypeForRole(role);
  const arch = POSITION_ARCHETYPES[type];
  const ratings = {
    position: role,
    archetype: type,
    speed: stat(base.speed ?? team.stats?.speed * 10, arch.speed, rosterPlayer.speed),
    acceleration: stat(base.acceleration ?? base.speed ?? 60, arch.acceleration, rosterPlayer.acceleration),
    strength: stat(base.strength ?? team.stats?.power * 10, arch.strength, rosterPlayer.strength),
    blocking: stat(base.blocking ?? team.stats?.power * 9, arch.blocking, rosterPlayer.blocking),
    tackling: stat(base.tackling ?? team.stats?.defense * 10, arch.tackling, rosterPlayer.tackling),
    catching: stat(base.catching ?? team.stats?.passing * 9, arch.catching, rosterPlayer.catching),
    throwAccuracy: stat(base.throwAccuracy ?? team.stats?.passing * 10, arch.throwAccuracy, rosterPlayer.throwAccuracy),
    throwPower: stat(base.throwPower ?? (team.stats?.passing + team.stats?.power) * 5, arch.throwPower, rosterPlayer.throwPower),
    routeRunning: stat(base.routeRunning ?? team.stats?.passing * 10, arch.agility, rosterPlayer.routeRunning),
    coverage: stat(base.coverage ?? team.stats?.defense * 10, arch.coverage, rosterPlayer.coverage),
    agility: stat(base.agility ?? team.stats?.speed * 9, arch.agility, rosterPlayer.agility),
    mass: Number((arch.mass + ((base.strength ?? 60) - 60) / 90).toFixed(2)),
    radius: arch.radius
  };
  return ratings;
}

function stat(base = 60, bonus = 0, explicit) {
  return Math.max(25, Math.min(99, Math.round(explicit ?? base + bonus)));
}

export function resolvePlayerCollisions(players, dt = 1 / 60) {
  const contacts = [];
  const relaxation = Math.min(1, Math.max(0.45, dt * 60));
  for (let i = 0; i < players.length; i += 1) {
    for (let j = i + 1; j < players.length; j += 1) {
      const a = players[i];
      const b = players[j];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const distance = Math.hypot(dx, dz) || 0.0001;
      const minDistance = (a.radius ?? 1) + (b.radius ?? 1);
      if (distance >= minDistance) continue;
      const overlap = (minDistance - distance) * relaxation;
      const nx = dx / distance;
      const nz = dz / distance;
      const aMass = a.fixed ? Infinity : (a.mass ?? 1);
      const bMass = b.fixed ? Infinity : (b.mass ?? 1);
      const total = (Number.isFinite(aMass) ? 1 / aMass : 0) + (Number.isFinite(bMass) ? 1 / bMass : 0) || 1;
      const aShare = Number.isFinite(aMass) ? (1 / aMass) / total : 0;
      const bShare = Number.isFinite(bMass) ? (1 / bMass) / total : 0;
      a.x -= nx * overlap * aShare;
      a.z -= nz * overlap * aShare;
      b.x += nx * overlap * bShare;
      b.z += nz * overlap * bShare;
      contacts.push({ a, b, overlap, nx, nz });
    }
  }
  return contacts;
}

export function resolveBlockMatchup(blocker, rusher, dt = 1 / 60) {
  const blockerPower = blocker.ratings.blocking * 0.7 + blocker.ratings.strength * 0.45;
  const rusherPower = rusher.ratings.strength * 0.55 + rusher.ratings.speed * 0.35;
  const edge = blockerPower - rusherPower;
  const hold = Math.max(0.28, Math.min(1.5, 0.55 + edge / 95));
  rusher.blockTimer = Math.max(rusher.blockTimer ?? 0, hold);
  blocker.blockTimer = Math.max(blocker.blockTimer ?? 0, hold * 0.7);
  rusher.shedTimer = Math.max(0, (rusher.shedTimer ?? 0) - dt);
  const slowMultiplier = Math.max(0.18, Math.min(0.72, 0.42 - edge / 240));
  return {
    state: edge >= -18 ? 'engaged_block' : 'shed_block',
    hold,
    slowMultiplier
  };
}

export function resolvePassOutcome({ qb, receiver, defender, distance, separation, pressure, roll = Math.random() }) {
  const powerPenalty = Math.max(0, distance - qb.ratings.throwPower * 0.55) * 0.9;
  const pressurePenalty = pressure * 32;
  const contestPenalty = Math.max(0, 4 - separation) * 8;
  const accuracy = qb.ratings.throwAccuracy + qb.ratings.throwPower * 0.2 - powerPenalty - pressurePenalty;
  const catchScore = receiver.ratings.catching + receiver.ratings.routeRunning * 0.2 + separation * 5;
  const defenseScore = (defender?.ratings.coverage ?? 55) + contestPenalty + pressure * 10;
  const quality = accuracy * 0.44 + catchScore * 0.38 - defenseScore * 0.28;
  const threshold = roll * 100;

  if (pressure > 0.75 && threshold > accuracy * 0.7) return { result: 'overthrown', feedback: 'Under pressure - overthrown' };
  if (separation < 2 && threshold < defenseScore * 0.25) return { result: 'intercepted', feedback: 'Intercepted in tight coverage' };
  if (separation < 2.8 && threshold < defenseScore * 0.48) return { result: 'deflected', feedback: 'Deflected by coverage' };
  if (quality > threshold + 4) {
    return { result: 'caught', feedback: separation > 4 ? 'Open target - accurate throw' : 'Contested catch' };
  }
  if (receiver.ratings.catching < threshold * 0.8) return { result: 'dropped', feedback: 'Dropped after contact' };
  return { result: 'incomplete', feedback: pressure > 0.4 ? 'Under pressure - incomplete' : 'Incomplete pass' };
}

export function resolveTackleOutcome({ tackler, carrier, angle, speed, helpers = 0, roll = Math.random() }) {
  const tackleScore = tackler.ratings.tackling * 0.65 + tackler.ratings.strength * 0.25 + angle * 18 + helpers * 10;
  const breakScore = carrier.ratings.strength * 0.45 + carrier.ratings.agility * 0.25 + speed * 14;
  const chance = Math.max(0.18, Math.min(0.9, (tackleScore - breakScore + 58) / 100));
  if (roll > chance + 0.12) return { result: 'broken', message: 'Broken tackle!', chance };
  if (helpers >= 1) return { result: 'tackle', message: 'Gang tackle!', chance };
  if (angle > 0.82 && speed > 0.75) return { result: 'tackle', message: 'Big hit!', chance };
  return { result: 'tackle', message: 'Tackle!', chance };
}

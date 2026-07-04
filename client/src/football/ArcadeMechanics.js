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

export const DEFENSIVE_LOOKS = [
  {
    id: 'edge-heat',
    label: 'Edge Heat',
    pressure: 0.22,
    coverage: -0.04,
    runFit: 0.04,
    disguise: 0.02,
    hint: 'Quick inside throws can punish the heat.',
    risk: 'Slow-developing routes invite pressure.'
  },
  {
    id: 'deep-lantern',
    label: 'Deep Lantern',
    pressure: -0.04,
    coverage: 0.18,
    runFit: -0.2,
    disguise: 0.03,
    hint: 'Light box gives runs and underneath routes room.',
    risk: 'Deep shots meet extra help.'
  },
  {
    id: 'stone-box',
    label: 'Stone Box',
    pressure: 0.02,
    coverage: -0.02,
    runFit: 0.24,
    disguise: 0.01,
    hint: 'Perimeter or quick passes attack the crowd.',
    risk: 'Inside runs hit a packed lane.'
  },
  {
    id: 'mirror-press',
    label: 'Mirror Press',
    pressure: 0.08,
    coverage: 0.12,
    runFit: 0.02,
    disguise: 0.08,
    hint: 'Backfield releases and misdirection can shake leverage.',
    risk: 'Wide receivers fight tight coverage.'
  }
];

export function chooseDefensiveLook({ down = 1, toGo = 10, yardLine = 25, scoreMargin = 0, playType = 'pass', defenseTeam, roll = Math.random() } = {}) {
  const identity = defenseTeam?.gameplay ?? {};
  const speed = identity.speed ?? ((defenseTeam?.stats?.speed ?? 6) * 10);
  const power = identity.strength ?? ((defenseTeam?.stats?.power ?? 6) * 10);
  const coverage = identity.coverage ?? ((defenseTeam?.stats?.defense ?? 6) * 10);
  const nearGoal = yardLine >= 78 || yardLine <= 12;
  const thirdAndLong = down >= 3 && toGo >= 6;
  const shortYardage = toGo <= 2;

  const scores = DEFENSIVE_LOOKS.map((look, index) => {
    let score = 0.2 + (((roll + index * 0.17) % 1) * 0.08);
    if (look.id === 'edge-heat') {
      score += thirdAndLong ? 0.34 : 0;
      score += playType === 'pass' ? 0.16 : 0;
      score += speed > 74 ? 0.1 : 0;
      score += scoreMargin < -6 ? 0.06 : 0;
    }
    if (look.id === 'deep-lantern') {
      score += toGo >= 8 ? 0.22 : 0;
      score += playType === 'pass' ? 0.08 : 0;
      score += coverage > 75 ? 0.08 : 0;
      score += scoreMargin > 6 ? 0.06 : 0;
    }
    if (look.id === 'stone-box') {
      score += shortYardage ? 0.38 : 0;
      score += playType === 'run' ? 0.18 : 0;
      score += power > 80 ? 0.1 : 0;
      score += nearGoal ? 0.06 : 0;
    }
    if (look.id === 'mirror-press') {
      score += toGo > 2 && toGo < 7 ? 0.18 : 0;
      score += coverage > 68 ? 0.08 : 0;
      score += playType === 'option' ? 0.08 : 0;
    }
    return { ...look, score };
  });

  scores.sort((a, b) => b.score - a.score);
  const selected = scores[0];
  return { ...selected, score: Number(selected.score.toFixed(3)) };
}

export function resolveReadModifier({ play, look, targetRole } = {}) {
  const activeLook = look ?? DEFENSIVE_LOOKS[1];
  const playId = play?.id ?? '';
  const playType = play?.type ?? 'pass';
  const quickInside = /quick|drag|slants/.test(playId) || ['TE', 'RB'].includes(targetRole);
  const perimeter = /sweep|flood|rollout/.test(playId);
  const deep = /deep|posts/.test(playId);
  const insideRun = playType === 'run' && /dive/.test(playId);
  const outsideRun = playType === 'run' && perimeter;
  const modifier = {
    pressure: activeLook.pressure ?? 0,
    coverage: activeLook.coverage ?? 0,
    separation: 0,
    runLane: 0,
    feedback: ''
  };

  if (activeLook.id === 'edge-heat') {
    modifier.separation += quickInside ? 1.15 : -0.55;
    modifier.runLane += outsideRun ? 0.08 : -0.05;
    modifier.feedback = quickInside ? 'Edge heat punished by the quick read.' : 'Edge heat cracked the pocket.';
  } else if (activeLook.id === 'deep-lantern') {
    modifier.separation += deep ? -0.75 : 0.65;
    modifier.runLane += 0.28;
    modifier.feedback = playType === 'run' ? 'Deep lantern left a light run box.' : 'Deep lantern protected the roof.';
  } else if (activeLook.id === 'stone-box') {
    modifier.separation += quickInside || perimeter ? 0.55 : -0.25;
    modifier.runLane += insideRun ? -0.34 : outsideRun ? 0.14 : -0.18;
    modifier.feedback = insideRun ? 'Stone box packed the run lane.' : 'Stone box crowded the middle.';
  } else {
    modifier.separation += targetRole === 'RB' || perimeter ? 0.55 : -0.45;
    modifier.runLane += perimeter ? 0.12 : -0.03;
    modifier.feedback = perimeter ? 'Mirror press lost leverage to misdirection.' : 'Mirror press squeezed the release.';
  }

  modifier.pressure += activeLook.disguise ?? 0;
  modifier.coverage += activeLook.disguise ?? 0;
  modifier.separation = Number(modifier.separation.toFixed(2));
  modifier.runLane = Number(modifier.runLane.toFixed(2));
  modifier.pressure = Number(modifier.pressure.toFixed(2));
  modifier.coverage = Number(modifier.coverage.toFixed(2));
  return modifier;
}

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

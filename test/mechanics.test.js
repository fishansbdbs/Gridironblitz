import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPlayerRatings,
  chooseDefensiveLook,
  resolveBlockMatchup,
  resolvePassOutcome,
  resolvePlayerCollisions,
  resolveReadModifier,
  resolveTackleOutcome
} from '../client/src/football/ArcadeMechanics.js';
import { TEAMS } from '../client/src/data/teams.js';

test('player ratings expand team identity into position stats', () => {
  const qb = buildPlayerRatings(TEAMS[2], 'QB');
  const rb = buildPlayerRatings(TEAMS[3], 'RB');
  const lineman = buildPlayerRatings(TEAMS[3], 'OL1');

  assert.ok(qb.throwAccuracy > rb.throwAccuracy);
  assert.ok(lineman.blocking > qb.blocking);
  assert.ok(rb.strength >= qb.strength);
  assert.equal(qb.position, 'QB');
});

test('collision resolution separates overlapping players without moving fixed players', () => {
  const players = [
    { x: 0, z: 0, radius: 1, mass: 3, fixed: true },
    { x: 0.75, z: 0, radius: 1, mass: 1 }
  ];

  const contacts = resolvePlayerCollisions(players, 1 / 60);

  assert.equal(contacts.length, 1);
  assert.equal(players[0].x, 0);
  assert.ok(players[1].x > 1.65);
});

test('blocking matchup creates temporary pocket protection', () => {
  const blocker = { ratings: { blocking: 78, strength: 82 }, blockTimer: 0 };
  const rusher = { ratings: { strength: 66, speed: 72 }, blockTimer: 0, shedTimer: 0 };

  const result = resolveBlockMatchup(blocker, rusher, 0.016);

  assert.equal(result.state, 'engaged_block');
  assert.ok(rusher.blockTimer > 0.35);
  assert.ok(result.slowMultiplier < 0.45);
});

test('passing outcome explains open accurate throws and pressure misses', () => {
  const accurate = resolvePassOutcome({
    qb: { ratings: { throwAccuracy: 88, throwPower: 80 } },
    receiver: { ratings: { catching: 82, routeRunning: 86 } },
    defender: { ratings: { coverage: 52 } },
    distance: 22,
    separation: 7,
    pressure: 0.05,
    roll: 0.2
  });
  const pressured = resolvePassOutcome({
    qb: { ratings: { throwAccuracy: 60, throwPower: 58 } },
    receiver: { ratings: { catching: 60, routeRunning: 58 } },
    defender: { ratings: { coverage: 86 } },
    distance: 38,
    separation: 1,
    pressure: 0.9,
    roll: 0.82
  });

  assert.equal(accurate.result, 'caught');
  assert.match(accurate.feedback, /Accurate|Open/);
  assert.ok(['deflected', 'intercepted', 'overthrown', 'dropped', 'incomplete'].includes(pressured.result));
  assert.match(pressured.feedback, /pressure|Contested|Deflected|Intercepted|Overthrown|Dropped/i);
});

test('tackle outcome rewards angle and strength but allows rare broken tackles', () => {
  const clean = resolveTackleOutcome({
    tackler: { ratings: { tackling: 84, strength: 76 } },
    carrier: { ratings: { strength: 60, agility: 65 } },
    angle: 0.9,
    speed: 0.7,
    helpers: 1,
    roll: 0.2
  });
  const broken = resolveTackleOutcome({
    tackler: { ratings: { tackling: 45, strength: 48 } },
    carrier: { ratings: { strength: 88, agility: 82 } },
    angle: 0.2,
    speed: 1,
    helpers: 0,
    roll: 0.95
  });

  assert.equal(clean.result, 'tackle');
  assert.equal(clean.message, 'Gang tackle!');
  assert.equal(broken.result, 'broken');
  assert.equal(broken.message, 'Broken tackle!');
});

test('defensive look selection responds to down distance and identity', () => {
  const passLook = chooseDefensiveLook({
    down: 3,
    toGo: 9,
    yardLine: 42,
    scoreMargin: -7,
    playType: 'pass',
    defenseTeam: TEAMS[1],
    roll: 0.18
  });
  const runLook = chooseDefensiveLook({
    down: 3,
    toGo: 1,
    yardLine: 62,
    scoreMargin: 4,
    playType: 'run',
    defenseTeam: TEAMS[3],
    roll: 0.18
  });

  assert.equal(passLook.id, 'edge-heat');
  assert.equal(runLook.id, 'stone-box');
  assert.match(passLook.hint, /quick/i);
  assert.match(runLook.hint, /perimeter|quick/i);
});

test('read modifiers create original risk reward feedback', () => {
  const quickPass = resolveReadModifier({
    play: { type: 'pass', id: 'quick-slants', recommendedTarget: 'WR1' },
    look: { id: 'edge-heat', pressure: 0.22, coverage: -0.04, runFit: 0.04, disguise: 0.02 },
    targetRole: 'WR1'
  });
  const stuffedRun = resolveReadModifier({
    play: { type: 'run', id: 'hb-dive', recommendedTarget: 'RB' },
    look: { id: 'stone-box', pressure: 0.02, coverage: -0.02, runFit: 0.24, disguise: 0.01 },
    targetRole: 'RB'
  });
  const lightRun = resolveReadModifier({
    play: { type: 'run', id: 'sweep-left', recommendedTarget: 'RB' },
    look: { id: 'deep-lantern', pressure: -0.04, coverage: 0.18, runFit: -0.2, disguise: 0.03 },
    targetRole: 'RB'
  });

  assert.ok(quickPass.pressure > 0);
  assert.ok(quickPass.separation > 0);
  assert.match(quickPass.feedback, /heat|quick/i);
  assert.ok(stuffedRun.runLane < 0);
  assert.match(stuffedRun.feedback, /box|lane/i);
  assert.ok(lightRun.runLane > 0);
  assert.match(lightRun.feedback, /deep|light/i);
});

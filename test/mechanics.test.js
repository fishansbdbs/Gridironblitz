import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPlayerRatings,
  resolveBlockMatchup,
  resolvePassOutcome,
  resolvePlayerCollisions,
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

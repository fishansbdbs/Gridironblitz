import test from 'node:test';
import assert from 'node:assert/strict';
import { createMatchState, applyPlayResult } from '../client/src/football/FootballRules.js';
import { PLAYS } from '../client/src/data/plays.js';
import { TEAMS } from '../client/src/data/teams.js';
import { STADIUMS } from '../client/src/data/stadiums.js';

test('playbook contains the eight required offensive plays', () => {
  assert.deepEqual(PLAYS.map((play) => play.name), ['Quick Slants', 'Deep Posts', 'Flood Right', 'Smash', 'HB Dive', 'Sweep Left', 'QB Rollout', 'TE Drag']);
});

test('fictional teams and stadiums are available for exhibition setup', () => {
  assert.equal(TEAMS.length, 4); assert.equal(STADIUMS.length, 4); assert.ok(TEAMS.every((team) => team.name && team.colors.primary && team.stats.speed)); assert.ok(STADIUMS.every((stadium) => stadium.name && stadium.vibe));
});

test('rules advance downs, award first downs, switch on downs, and end at 14', () => {
  const state = createMatchState({ homeTeam: TEAMS[0], awayTeam: TEAMS[1], stadium: STADIUMS[0], mode: 'exhibition' });
  applyPlayResult(state, { yards: 4, type: 'run' }); assert.equal(state.down, 2); assert.equal(state.toGo, 6); assert.equal(state.yardLine, 29);
  applyPlayResult(state, { yards: 6, type: 'catch' }); assert.equal(state.down, 1); assert.equal(state.toGo, 10); assert.equal(state.yardLine, 35);
  applyPlayResult(state, { yards: 65, type: 'touchdown' }); assert.equal(state.score.home, 7); assert.equal(state.possession, 'away');
  applyPlayResult(state, { yards: 75, type: 'touchdown' }); applyPlayResult(state, { yards: 75, type: 'touchdown' }); assert.equal(state.winner, TEAMS[0].name);
});

import { BALANCE } from '../data/balance.js';

export function createMatchState({ homeTeam, awayTeam, stadium, mode = 'exhibition' }) {
  return { mode, homeTeam, awayTeam, stadium, possession: 'home', score: { home: 0, away: 0 }, down: 1, toGo: 10, yardLine: 25, lineOfScrimmage: 25, firstDownLine: 35, winner: null, playClock: mode === 'practice' ? null : 180, stats: { home: { touchdowns: 0, passingYards: 0, rushingYards: 0, interceptions: 0, sacks: 0, tackles: 0 }, away: { touchdowns: 0, passingYards: 0, rushingYards: 0, interceptions: 0, sacks: 0, tackles: 0 } }, history: [] };
}
export function offenseTeam(state) { return state.possession === 'home' ? state.homeTeam : state.awayTeam; }
export function defenseTeam(state) { return state.possession === 'home' ? state.awayTeam : state.homeTeam; }
export function directionFor(possession) { return possession === 'home' ? 1 : -1; }
export function displayYardLine(state) { const own = state.yardLine <= 50; const team = own ? offenseTeam(state).shortName : defenseTeam(state).shortName; const yard = own ? state.yardLine : 100 - state.yardLine; return `${team} ${Math.max(1, Math.min(50, Math.round(yard)))}`; }
export function resetDrive(state, possession = state.possession) { state.possession = possession; state.down = 1; state.toGo = 10; state.yardLine = 25; state.lineOfScrimmage = 25; state.firstDownLine = 35; }
export function applyPlayResult(state, result) {
  if (state.winner && state.mode !== 'practice') return state;
  const side = state.possession;
  const opponent = side === 'home' ? 'away' : 'home';
  const yards = Math.max(-20, Math.min(100, Math.round(result.yards ?? 0)));
  const start = state.yardLine;
  const end = Math.max(1, Math.min(100, start + yards));
  const entry = { ...result, yards, side, start, end };
  if (result.type === 'interception') {
    state.stats[opponent].interceptions += 1; resetDrive(state, opponent); state.yardLine = Math.max(20, 100 - end); state.lineOfScrimmage = state.yardLine; entry.message = 'Interception!';
  } else if (result.type === 'touchdown' || end >= 100) {
    state.score[side] += 7; state.stats[side].touchdowns += 1; if (result.pass) state.stats[side].passingYards += Math.max(0, 100 - start); else state.stats[side].rushingYards += Math.max(0, 100 - start); entry.message = 'Touchdown!'; if (state.score[side] >= BALANCE.firstScoreWins && state.mode !== 'practice') state.winner = side === 'home' ? state.homeTeam.name : state.awayTeam.name; resetDrive(state, opponent);
  } else if (result.type === 'incomplete') {
    state.down += 1; entry.message = 'Incomplete pass.';
  } else {
    if (result.pass) state.stats[side].passingYards += Math.max(0, yards); else state.stats[side].rushingYards += Math.max(0, yards); state.yardLine = end;
    if (yards >= state.toGo || end >= state.firstDownLine) { state.down = 1; state.toGo = Math.min(10, 100 - end); state.firstDownLine = Math.min(100, end + 10); entry.message = 'First down!'; }
    else { state.toGo = Math.max(1, state.toGo - Math.max(0, yards)); state.down += 1; }
  }
  if (state.down > 4) { resetDrive(state, opponent); entry.message = 'Turnover on downs.'; }
  state.lineOfScrimmage = state.yardLine; state.history.unshift(entry); state.history = state.history.slice(0, 12); return state;
}
export function ordinal(value) { return ['0th', '1st', '2nd', '3rd'][value] ?? `${value}th`; }

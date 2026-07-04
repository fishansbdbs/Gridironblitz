import * as THREE from 'three';
import { TEAMS } from '../data/teams.js';
import { STADIUMS } from '../data/stadiums.js';
import { PLAYS } from '../data/plays.js';
import { FIELD, ROLES, SETTINGS_DEFAULTS, UPDATE_NAME, VERSION } from '../../../shared/constants.js';
import { createMatchState, applyPlayResult, displayYardLine, ordinal } from '../football/FootballRules.js';
import {
  archetypeForRole,
  buildPlayerRatings,
  resolveBlockMatchup,
  resolvePassOutcome,
  resolvePlayerCollisions,
  resolveTackleOutcome
} from '../football/ArcadeMechanics.js';

export {
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
  resolveTackleOutcome
};

export const FORMATIONS = {
  'I-Form': { QB: [0, -5], RB: [0, -10], WR1: [-23, 0], WR2: [21, 0], TE: [6, -1], OL1: [-2.2, -0.5], OL2: [2.2, -0.5] },
  Shotgun: { QB: [0, -8], RB: [-6, -9], WR1: [-23, 0], WR2: [23, 0], TE: [8, -1], OL1: [-2.2, -0.5], OL2: [2.2, -0.5] },
  Trips: { QB: [0, -7], RB: [-5, -9], WR1: [-22, 0], WR2: [17, 0], TE: [10, -1], OL1: [-2.2, -0.5], OL2: [2.2, -0.5] },
  'Split Back': { QB: [0, -6], RB: [-6, -8], WR1: [-22, 0], WR2: [22, 0], TE: [7, -1], OL1: [-2.2, -0.5], OL2: [2.2, -0.5] },
  'Goal Line': { QB: [0, -4.8], RB: [0, -8], WR1: [-16, 0], WR2: [16, 0], TE: [5, -1], OL1: [-2.2, -0.4], OL2: [2.2, -0.4] }
};

export const DEFENSE = {
  DL1: [-3.2, 2.4],
  DL2: [3.2, 2.4],
  LB: [0, 7.5],
  CB1: [-22, 7],
  CB2: [22, 7],
  S1: [-10, 16],
  S2: [10, 16]
};

export const DIFFICULTY = {
  Rookie: { reaction: 0.8, coverage: -8, tackle: -8 },
  Pro: { reaction: 1, coverage: 0, tackle: 0 },
  Blitz: { reaction: 1.18, coverage: 8, tackle: 8 }
};

export function teamCard(team, selected, cpu) {
  const star = team.roster.QB?.name ?? Object.values(team.roster)[0]?.name;
  return `
    <button class="team-card ${selected ? 'selected' : ''}" data-team="${team.id}" data-cpu="${cpu ? '1' : '0'}">
      <span class="logo-mark" style="--team:${team.colors.primary};--accent:${team.colors.accent}">${logoSvg(team)}</span>
      <strong>${team.name}</strong>
      <small>${team.identity}</small>
      <span>Star: ${star}</span>
      <span>SPD ${team.stats.speed} / POW ${team.stats.power} / PAS ${team.stats.passing} / DEF ${team.stats.defense}</span>
    </button>
  `;
}

export function playCard(play, selected) {
  const icon = play.type === 'run' ? 'RUN' : play.type === 'option' ? 'OPT' : 'PAS';
  return `<button class="play-card ${selected ? 'selected' : ''}" data-play="${play.id}"><span>${icon} - ${play.formation}</span><strong>${play.name}</strong><small>${play.description}</small></button>`;
}

export function selectSetting(key, label, values, selected) {
  return `<label>${label}<select data-setting="${key}">${values.map((value) => `<option value="${value}" ${String(value) === String(selected) ? 'selected' : ''}>${value}</option>`).join('')}</select></label>`;
}

export function routePreview(play) {
  const colors = { WR1: '#38bdf8', WR2: '#facc15', TE: '#f472b6', RB: '#86efac' };
  const routes = Object.entries(play.routes ?? {}).map(([role, points]) => {
    const start = points[0] ?? [0, 0];
    const line = points.map(([x, y]) => `${110 + x * 3},${95 - y * 1.8}`).join(' ');
    return `<polyline points="${110 + start[0] * 3},95 ${line}" fill="none" stroke="${colors[role] ?? '#fff'}" stroke-width="3"/><text x="${110 + start[0] * 3}" y="110" fill="${colors[role] ?? '#fff'}">${role}</text>`;
  }).join('');
  return `<svg viewBox="0 0 220 120" role="img" aria-label="${play.name} route preview"><rect x="0" y="0" width="220" height="120" fill="#13203a"/><line x1="12" x2="208" y1="94" y2="94" stroke="#dff8df" stroke-width="2"/><line x1="12" x2="208" y1="64" y2="64" stroke="#dff8df" stroke-width="1"/>${routes}</svg>`;
}

export function logoHtml(team) {
  return `<span class="mini-logo" style="--team:${team.colors.primary};--accent:${team.colors.accent}">${logoSvg(team)}</span>`;
}

export function logoSvg(team) {
  if (team.logo.mark === 'tusk') return `<svg viewBox="0 0 64 64"><path d="M12 42 C24 10 48 10 52 28 C44 24 34 26 24 44 Z" fill="var(--accent)"/><path d="M20 48 C28 30 44 26 54 34" stroke="var(--team)" stroke-width="7" fill="none"/></svg>`;
  if (team.logo.mark === 'fang') return `<svg viewBox="0 0 64 64"><path d="M18 10 L34 54 L46 10 L36 20 L30 40 L24 20 Z" fill="var(--accent)"/><path d="M14 14 L50 50" stroke="var(--team)" stroke-width="8"/></svg>`;
  if (team.logo.mark === 'eyes') return `<svg viewBox="0 0 64 64"><path d="M8 24 L28 12 L56 24 L44 50 L32 38 L20 50 Z" fill="var(--team)"/><circle cx="25" cy="28" r="7" fill="var(--accent)"/><circle cx="41" cy="28" r="7" fill="var(--accent)"/></svg>`;
  return `<svg viewBox="0 0 64 64"><path d="M10 20 C18 8 25 14 30 24 C35 14 46 8 54 20 C45 20 42 28 42 38 L22 38 C22 28 19 20 10 20 Z" fill="var(--accent)"/><path d="M20 36 L44 36 L38 54 L26 54 Z" fill="var(--team)"/></svg>`;
}

export function logoPlane(team, size, midfield) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = midfield ? team.colors.dark : team.colors.primary;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = team.colors.accent;
  ctx.font = 'bold 150px Impact';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(team.logo.letter, 128, 135);
  const texture = new THREE.CanvasTexture(canvas);
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: midfield ? 0.8 : 0.6 }));
  return plane;
}

export function textPlane(text, color, width, height) {
  const texture = makeTextTexture(text, color, 512, 256);
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture, transparent: true }));
}

export function makeTextTexture(text, color, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = color;
  ctx.font = `bold ${Math.floor(height * 0.55)}px Impact`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  return new THREE.CanvasTexture(canvas);
}

export function footballMesh() {
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 6), mat('#7a3d1c'));
  ball.scale.set(0.72, 0.45, 1.25);
  const lace = box(0.08, 0.08, 0.75, '#f8f1dc');
  lace.position.set(0, 0.06, -0.12);
  ball.add(lace);
  return ball;
}

export function playerMesh(team, uniform, role, number) {
  const type = archetypeForRole(role);
  const scale = {
    QB: [1.05, 1, 1],
    RB: [1, 0.92, 1.1],
    WR: [0.86, 1.05, 0.88],
    TE: [1.12, 1.08, 1],
    OL: [1.35, 1.12, 1.25],
    DL: [1.28, 1.1, 1.18],
    LB: [1.12, 1.03, 1.05],
    DB: [0.9, 1.02, 0.9]
  }[type];
  const root = new THREE.Group();
  const torso = addBox(root, [1.05 * scale[0], 1.45 * scale[1], 0.7 * scale[2]], [0, 2.35, 0], uniform.jersey);
  addBox(root, [1.55 * scale[0], 0.45, 0.86], [0, 3.02, 0], uniform.jersey);
  addBox(root, [0.16, 1.55, 0.08], [-0.58 * scale[0], 2.4, -0.37], uniform.stripe);
  addBox(root, [0.16, 1.55, 0.08], [0.58 * scale[0], 2.4, -0.37], uniform.stripe);
  const leftArm = addBox(root, [0.34, 0.95, 0.34], [-0.9 * scale[0], 2.18, 0], uniform.jersey);
  const rightArm = addBox(root, [0.34, 0.95, 0.34], [0.9 * scale[0], 2.18, 0], uniform.jersey);
  addBox(root, [0.38, 0.22, 0.38], [-0.9 * scale[0], 1.58, 0], '#f8fafc');
  addBox(root, [0.38, 0.22, 0.38], [0.9 * scale[0], 1.58, 0], '#f8fafc');
  const leftLeg = addBox(root, [0.42 * scale[0], 1.1 * scale[1], 0.42], [-0.34 * scale[0], 0.98, 0], uniform.pants);
  const rightLeg = addBox(root, [0.42 * scale[0], 1.1 * scale[1], 0.42], [0.34 * scale[0], 0.98, 0], uniform.pants);
  addBox(root, [0.42, 0.24, 0.42], [-0.34 * scale[0], 0.48, 0], uniform.stripe);
  addBox(root, [0.42, 0.24, 0.42], [0.34 * scale[0], 0.48, 0], uniform.stripe);
  addBox(root, [0.56, 0.22, 0.75], [-0.34 * scale[0], 0.25, 0.05], '#0b0b0b');
  addBox(root, [0.56, 0.22, 0.75], [0.34 * scale[0], 0.25, 0.05], '#0b0b0b');
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.54 * scale[0], 9, 6), mat(uniform.helmet));
  helmet.scale.z = 0.82;
  helmet.position.y = 3.74 * scale[1];
  root.add(helmet);
  addBox(root, [0.75, 0.08, 0.1], [0, 3.73 * scale[1], -0.46], '#111827');
  addBox(root, [0.65, 0.08, 0.08], [0, 3.58 * scale[1], -0.48], '#111827');
  const numberPlane = textPlane(String(number || role.replace(/\D/g, '') || 1), uniform.number, 0.68, 0.42);
  numberPlane.position.set(0, 2.45, -0.38);
  numberPlane.rotation.y = Math.PI;
  torso.add(numberPlane);
  root.userData = { leftArm, rightArm, leftLeg, rightLeg };
  return root;
}

export function markerMesh(color, radius) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.05, 5, 18), mat(color, { transparent: true, opacity: 0.78 }));
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

export function addBox(root, size, position, color) {
  const mesh = box(size[0], size[1], size[2], color);
  mesh.position.set(position[0], position[1], position[2]);
  root.add(mesh);
  return mesh;
}

export function mat(color, options = {}) {
  return new THREE.MeshLambertMaterial({ color, flatShading: true, fog: true, ...options });
}

export function box(x, y, z, color) {
  return new THREE.Mesh(new THREE.BoxGeometry(x, y, z), mat(color));
}

export function moveToward(player, target, speed, dt) {
  if (!target) return false;
  const pos = player.mesh.position;
  const tx = target.x ?? target.mesh?.position.x ?? 0;
  const tz = target.z ?? target.mesh?.position.z ?? 0;
  const dx = tx - pos.x;
  const dz = tz - pos.z;
  const dist = Math.hypot(dx, dz);
  if (dist < 0.35) return true;
  const step = Math.min(dist, speed * dt);
  player.vx = (dx / dist) * speed;
  player.vz = (dz / dist) * speed;
  pos.x += (dx / dist) * step;
  pos.z += (dz / dist) * step;
  player.mesh.rotation.y = Math.atan2(dx, dz);
  return dist < step + 0.4;
}

export function nearest(player, players) {
  return players.reduce((best, item) => !best || distanceXZ(player, item) < distanceXZ(player, best) ? item : best, null);
}

export function nearestDefender(player, players) {
  return nearest(player, players.filter((item) => item.side !== player.side));
}

export function distanceXZ(a, b) {
  return Math.hypot(a.mesh.position.x - b.mesh.position.x, a.mesh.position.z - b.mesh.position.z);
}

export function midpoint(a, b) {
  return new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
}

export function tackleAngle(tackler, carrier, dir) {
  const dz = (carrier.mesh.position.z - tackler.mesh.position.z) * dir;
  return clamp((dz + 2) / 5, 0, 1);
}

export function withDifficulty(player, difficultyName) {
  const difficulty = DIFFICULTY[difficultyName] ?? DIFFICULTY.Pro;
  return { ...player, ratings: { ...player.ratings, tackling: player.ratings.tackling + difficulty.tackle, coverage: player.ratings.coverage + difficulty.coverage } };
}

export function bannerFor(result, status) {
  if (result.type === 'touchdown') return 'TOUCHDOWN';
  if (result.type === 'interception') return 'INTERCEPTION';
  if (/first down/i.test(status)) return 'FIRST DOWN';
  if (/big hit/i.test(status)) return 'BIG HIT';
  if (/sack/i.test(status)) return 'SACK';
  if (/turnover/i.test(status)) return 'TURNOVER';
  if (/out of bounds/i.test(status)) return 'OUT OF BOUNDS';
  return status.toUpperCase();
}

export function approach(value, target, delta) {
  if (value < target) return Math.min(target, value + delta);
  return Math.max(target, value - delta);
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function loadSettings() {
  try {
    return { ...SETTINGS_DEFAULTS, ...JSON.parse(localStorage.getItem('gridiron-blitz-97-save') || '{}').settings };
  } catch {
    return { ...SETTINGS_DEFAULTS };
  }
}

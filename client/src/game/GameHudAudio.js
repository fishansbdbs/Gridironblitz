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

export const gameHudAudioMethods = {
    renderHud() {
    if (!this.match) return;
    const home = this.match.homeTeam;
    const away = this.match.awayTeam;
    const clock = this.gameClock == null ? 'Practice' : `${Math.floor(this.gameClock / 60)}:${String(Math.floor(this.gameClock % 60)).padStart(2, '0')}`;
    const selectedPlay = PLAYS[this.playIndex] ?? this.currentPlay;
    const read = this.defensiveLook;
    const readLine = read
      ? `<div class="hud-read"><span class="read-chip">${read.label}</span><span>${read.hint}</span></div>`
      : '';
    let html = `
      <div class="hud scoreboard">
        <div class="team-chip">${logoHtml(home)} <strong>${home.shortName}</strong> ${this.match.score.home}</div>
        <div class="score-mid">${clock}<span>${this.match.possession === 'home' ? '<' : '>'}</span></div>
        <div class="team-chip away">${logoHtml(away)} <strong>${away.shortName}</strong> ${this.match.score.away}</div>
        <div class="hud-line">${ordinal(this.match.down)} &amp; ${this.match.toGo} | Ball on ${displayYardLine(this.match)} | Target ${this.settings.scoreTarget}</div>
        <div class="hud-line">Play: ${this.currentPlay?.formation ?? ''} ${this.currentPlay?.name ?? 'Pick a play'} | Target: ${this.target} | ${this.settings.camera}</div>
        ${readLine}
        <div class="hud-status">${this.status}</div>
      </div>
      ${this.banner ? `<div class="banner">${this.banner}</div>` : ''}
      <div class="controls">WASD move | Shift sprint | Space snap/juke | 1-4 pass/select | Esc menu</div>
    `;
    if (this.phase === 'play-select' && (this.match.possession === 'home' || this.mode === 'practice')) {
      html += `
        <section class="play-select">
          <div class="play-header">
            <strong>${selectedPlay.formation}</strong>
            <span>${ordinal(this.match.down)} &amp; ${this.match.toGo} - ${selectedPlay.situation}</span>
          </div>
          <div class="route-preview">${routePreview(selectedPlay)}</div>
          ${read ? `<div class="read-panel"><span class="read-chip">Read: ${read.label}</span><strong>${read.hint}</strong><small>Risk: ${read.risk}</small></div>` : ''}
          <div class="play-grid">${PLAYS.map((play, index) => playCard(play, index === this.playIndex)).join('')}</div>
          ${this.mode === 'practice' ? '<button data-action="practice-reset">Reset Play</button>' : ''}
        </section>
      `;
    }
    this.uiRoot.innerHTML = html;
    this.updatePhysicalScoreboard();
  },

    updatePhysicalScoreboard() {
    if (!this.stadiumScoreText) return;
    this.stadiumScoreText.material.map?.dispose();
    const texture = makeTextTexture(`${this.match.homeTeam.shortName} ${this.match.score.home}  ${this.match.awayTeam.shortName} ${this.match.score.away}`, '#facc15', 1024, 256);
    this.stadiumScoreText.material.map = texture;
    this.stadiumScoreText.material.needsUpdate = true;
  },

    ensureAudio() {
    if (!this.audio) this.audio = new AudioContext();
  },

    startCrowd() {
    if (this.crowdStarted || !this.audio) return;
    this.crowdStarted = true;
    const buffer = this.audio.createBuffer(1, this.audio.sampleRate * 2, this.audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * 0.18;
    const source = this.audio.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = this.audio.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    const gain = this.audio.createGain();
    gain.gain.value = this.settings.crowdVolume * this.settings.masterVolume * 0.18;
    source.connect(filter).connect(gain).connect(this.audio.destination);
    source.start();
  },

    sound(name) {
    if (!this.audio) return;
    const map = { select: 420, snap: 180, throw: 620, catch: 760, tackle: 82, touchdown: 330, turnover: 120, whistle: 1400, bump: 95 };
    const duration = name === 'touchdown' ? 0.35 : name === 'whistle' ? 0.2 : 0.15;
    const osc = this.audio.createOscillator();
    const gain = this.audio.createGain();
    osc.type = name === 'whistle' ? 'sine' : 'square';
    osc.frequency.value = map[name] || 300;
    gain.gain.value = this.settings.sfxVolume * this.settings.masterVolume * 0.09;
    gain.gain.exponentialRampToValueAtTime(0.001, this.audio.currentTime + duration);
    osc.connect(gain).connect(this.audio.destination);
    osc.start();
    osc.stop(this.audio.currentTime + duration);
  },

    toast(message) {
    this.toastRoot.textContent = message;
    this.toastRoot.classList.add('show');
    setTimeout(() => this.toastRoot.classList.remove('show'), 1800);
  },

    loop() {
    requestAnimationFrame(() => this.loop());
    const now = performance.now();
    const dt = Math.min(0.04, (now - this.last) / 1000);
    this.last = now;
    this.elapsed += dt;
    this.update(dt);
    this.renderer.render(this.scene, this.camera);
  }
};

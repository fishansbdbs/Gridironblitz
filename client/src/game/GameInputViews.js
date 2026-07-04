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

export const gameInputViewsMethods = {
    start() {
    this.resize();
    addEventListener('resize', () => this.resize());
    addEventListener('keydown', (event) => this.onKey(event));
    addEventListener('keyup', (event) => this.keys.delete(event.code));
    this.uiRoot.addEventListener('click', (event) => this.onClick(event));
    this.uiRoot.addEventListener('change', (event) => this.onSetting(event));
    this.showMenu();
    this.loop();
  },

    resize() {
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.settings.graphics === 'Sharp' ? 1.5 : 1.15));
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  },

    onClick(event) {
    const button = event.target.closest('button');
    if (!button) return;
    this.ensureAudio();
    this.sound('select');
    const action = button.dataset.action;
    if (action === 'exhibition') { this.mode = 'exhibition'; this.showTeams(); }
    if (action === 'practice') { this.mode = 'practice'; this.showTeams(); }
    if (action === 'settings') this.showSettings();
    if (action === 'patch') this.showPatch();
    if (action === 'credits') this.toast('Original fictional teams, players, and stadiums only.');
    if (action === 'main-menu') this.showMenu();
    if (action === 'continue-stadium') this.showStadiums();
    if (action === 'random-cpu') this.randomCpu();
    if (action === 'start-game') this.startMatch();
    if (action === 'rematch') this.startMatch();
    if (action === 'practice-reset') this.resetPracticePlay();
    if (button.dataset.team) this.selectTeam(button.dataset.team, button.dataset.cpu === '1');
    if (button.dataset.stadium) this.selectStadium(button.dataset.stadium);
    if (button.dataset.play) this.callPlay(PLAYS.find((play) => play.id === button.dataset.play));
  },

    onSetting(input) {
    const key = input.target?.dataset?.setting;
    if (!key) return;
    const value = input.target.type === 'checkbox' ? input.target.checked : input.target.value;
    this.settings[key] = key === 'scoreTarget' ? Number(value) : value;
    localStorage.setItem('gridiron-blitz-97-save', JSON.stringify({ settings: this.settings }));
    document.body.classList.toggle('scanlines-off', !this.settings.scanlines);
    this.resize();
    this.renderHud();
  },

    onKey(event) {
    this.keys.add(event.code);
    if (event.code === 'Escape') {
      if (this.phase === 'menu') return;
      this.showMenu();
      return;
    }
    if (this.phase === 'play-select') {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') this.playIndex = (this.playIndex + PLAYS.length - 1) % PLAYS.length;
      if (event.code === 'ArrowRight' || event.code === 'KeyD') this.playIndex = (this.playIndex + 1) % PLAYS.length;
      this.currentPlay = PLAYS[this.playIndex];
      if (event.code === 'Enter' || event.code === 'Space') this.callPlay(this.currentPlay);
      else this.renderHud();
    } else if (this.phase === 'pre-snap' && event.code === 'Space') {
      this.snap();
    } else if (this.phase === 'live') {
      const targets = { Digit1: 'WR1', Digit2: 'WR2', Digit3: 'TE', Digit4: 'RB' };
      if (targets[event.code]) {
        this.target = targets[event.code];
        this.throwPass(this.target);
      }
      if (event.code === 'Space') this.juke();
    }
  },

    showMenu() {
    this.phase = 'menu';
    this.banner = '';
    this.uiRoot.innerHTML = `
      <section class="screen menu-screen">
        <div>
          <p class="eyebrow">${VERSION}</p>
          <h1>GRIDIRON BLITZ 97</h1>
          <p class="subtitle">${UPDATE_NAME}</p>
        </div>
        <nav class="menu-actions">
          <button data-action="exhibition">Exhibition</button>
          <button data-action="practice">Practice</button>
          <button data-action="settings">Settings</button>
          <button data-action="patch">Patch Notes</button>
          <button data-action="credits">Credits</button>
        </nav>
      </section>
    `;
  },

    showTeams() {
    this.phase = 'team-select';
    this.uiRoot.innerHTML = `
      <section class="screen select-screen">
        <h2>Team Select</h2>
        <div class="select-columns">
          <div><h3>Player Team</h3>${TEAMS.map((team) => teamCard(team, team.id === this.homeId, false)).join('')}</div>
          <div><h3>CPU Team</h3>${TEAMS.map((team) => teamCard(team, team.id === this.awayId, true)).join('')}</div>
        </div>
        <div class="row-actions">
          <button data-action="random-cpu">Random CPU</button>
          <button data-action="continue-stadium">Continue</button>
          <button data-action="main-menu">Back</button>
        </div>
      </section>
    `;
  },

    showStadiums() {
    this.phase = 'stadium-select';
    this.uiRoot.innerHTML = `
      <section class="screen select-screen">
        <h2>Stadium Select</h2>
        <div class="stadium-grid">
          ${STADIUMS.map((stadium) => `
            <button class="stadium-card ${stadium.id === this.stadiumId ? 'selected' : ''}" data-stadium="${stadium.id}" style="--sky:${stadium.sky};--wall:${stadium.wall};--light:${stadium.light};--accent:${stadium.accent}">
              <span class="stadium-preview"></span>
              <strong>${stadium.name}</strong>
              <small>${stadium.vibe}</small>
            </button>
          `).join('')}
        </div>
        <div class="row-actions">
          <button data-action="start-game">Kick Off</button>
          <button data-action="main-menu">Main Menu</button>
        </div>
      </section>
    `;
  },

    showSettings() {
    this.phase = 'settings';
    this.uiRoot.innerHTML = `
      <section class="screen compact-screen">
        <h2>Settings</h2>
        ${selectSetting('camera', 'Camera', ['Classic', 'Broadcast', 'Ball Cam'], this.settings.camera)}
        ${selectSetting('difficulty', 'Difficulty', ['Rookie', 'Pro', 'Blitz'], this.settings.difficulty)}
        ${selectSetting('scoreTarget', 'Score Target', [14, 21], this.settings.scoreTarget)}
        ${selectSetting('graphics', 'Graphics', ['Performance', 'Sharp'], this.settings.graphics)}
        <label class="check"><input type="checkbox" data-setting="scanlines" ${this.settings.scanlines ? 'checked' : ''}> Scanlines</label>
        <label class="check"><input type="checkbox" data-setting="shake" ${this.settings.shake ? 'checked' : ''}> Screen shake</label>
        <button data-action="main-menu">Back</button>
      </section>
    `;
  },

    showPatch() {
    this.phase = 'patch';
    this.uiRoot.innerHTML = `
      <section class="screen compact-screen">
        <h2>Patch Notes</h2>
        <h3>${VERSION} - ${UPDATE_NAME}</h3>
        <ul>
          <li>Upgraded player models, uniforms, position body types, and transform animations.</li>
          <li>Added collision separation, blocking engagement, tackle outcomes, and anti-stuck play whistles.</li>
          <li>Improved passing feedback, receiver routes, AI pursuit, camera modes, stadiums, field logos, and scoreboard presentation.</li>
          <li>Added fictional player rosters and stat-driven gameplay.</li>
        </ul>
        <button data-action="main-menu">Back</button>
      </section>
    `;
  },

    selectTeam(id, cpu) {
    if (cpu) this.awayId = id;
    else this.homeId = id;
    localStorage.setItem('gb97-home', this.homeId);
    localStorage.setItem('gb97-away', this.awayId);
    this.showTeams();
  },

    randomCpu() {
    const pool = TEAMS.filter((team) => team.id !== this.homeId);
    this.awayId = pool[Math.floor(Math.random() * pool.length)].id;
    localStorage.setItem('gb97-away', this.awayId);
    this.showTeams();
  },

    selectStadium(id) {
    this.stadiumId = id;
    localStorage.setItem('gb97-stadium', id);
    this.showStadiums();
  },

    startMatch() {
    const homeTeam = TEAMS.find((team) => team.id === this.homeId) ?? TEAMS[0];
    const awayTeam = TEAMS.find((team) => team.id === this.awayId) ?? TEAMS[1];
    const stadium = STADIUMS.find((item) => item.id === this.stadiumId) ?? STADIUMS[0];
    this.match = createMatchState({ homeTeam, awayTeam, stadium, mode: this.mode });
    this.match.scoreTarget = this.mode === 'practice' ? Infinity : this.settings.scoreTarget;
    this.gameClock = this.mode === 'practice' ? null : 180;
    this.buildScene(stadium);
    this.lineup();
    this.phase = 'play-select';
    this.status = this.mode === 'practice' ? 'Practice field loaded. Choose a play.' : 'Exhibition kickoff.';
    this.banner = '';
    this.ensureAudio();
    this.startCrowd();
    this.renderHud();
  }
};

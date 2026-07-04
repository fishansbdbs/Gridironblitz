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

export const gameSceneMethods = {
    buildScene(stadium) {
    this.scene.clear();
    this.effects = [];
    this.scene.background = new THREE.Color(stadium.sky);
    this.scene.fog = new THREE.Fog(stadium.sky, 85, 180);
    this.scene.add(new THREE.HemisphereLight('#dbeafe', stadium.props === 'bayou' ? '#173d2c' : '#172554', 1.35));
    const sun = new THREE.DirectionalLight(stadium.light, 1.65);
    sun.position.set(stadium.props === 'desert' ? -30 : 24, 60, 20);
    this.scene.add(sun);
    this.field = new THREE.Group();
    this.scene.add(this.field);
    this.addField(stadium);
    this.addStadium(stadium);
    this.ballMesh = footballMesh();
    this.scene.add(this.ballMesh);
    this.selectedMarker = markerMesh('#facc15', 1.3);
    this.targetMarker = markerMesh('#38bdf8', 1.1);
    this.scene.add(this.selectedMarker, this.targetMarker);
  },

    addField(stadium) {
    const home = this.match.homeTeam;
    const away = this.match.awayTeam;
    const turf = box(FIELD.width, 0.18, 120, stadium.turf);
    turf.position.z = 50;
    this.field.add(turf);
    for (let z = 0; z <= 100; z += 2.5) {
      const stripe = box(FIELD.width, 0.02, 0.06, z % 5 === 0 ? '#dff8df' : '#2f8a49');
      stripe.position.set(0, 0.15, z);
      this.field.add(stripe);
    }
    this.addEndZone(5, home, home.colors.dark);
    this.addEndZone(105, away, away.colors.dark);
    for (let z = 0; z <= 100; z += 5) {
      const line = box(FIELD.width + 0.4, 0.06, z % 10 === 0 ? 0.32 : 0.16, '#f5fff0');
      line.position.set(0, 0.28, z);
      this.field.add(line);
    }
    for (let z = 10; z <= 90; z += 10) {
      this.addYardNumber(-20, z, z <= 50 ? z : 100 - z);
      this.addYardNumber(20, z, z <= 50 ? z : 100 - z, Math.PI);
    }
    for (let z = 5; z < 100; z += 5) {
      for (const x of [-10, 10, -25, 25]) {
        const hash = box(1.6, 0.05, 0.16, '#f5fff0');
        hash.position.set(x, 0.32, z);
        this.field.add(hash);
      }
    }
    this.addLogoPlane(0, 50, 8, home, true);
    this.addSidelines();
    this.los = box(FIELD.width + 1, 0.08, 0.42, '#3bd7ff');
    this.first = box(FIELD.width + 1, 0.08, 0.42, '#facc15');
    this.field.add(this.los, this.first);
  },

    addEndZone(z, team, color) {
    const zone = box(FIELD.width, 0.22, 10, color);
    zone.position.set(0, 0.2, z);
    this.field.add(zone);
    this.addLogoPlane(-17, z, 5, team, false);
    this.addLogoPlane(17, z, 5, team, false);
  },

    addYardNumber(x, z, value, rotation = 0) {
    const plane = textPlane(String(value), '#f7fff2', 4, 2.4);
    plane.position.set(x, 0.36, z);
    plane.rotation.x = -Math.PI / 2;
    plane.rotation.z = rotation;
    this.field.add(plane);
  },

    addLogoPlane(x, z, size, team, midfield) {
    const plane = logoPlane(team, size, midfield);
    plane.position.set(x, 0.38, z);
    plane.rotation.x = -Math.PI / 2;
    this.field.add(plane);
  },

    addSidelines() {
    for (const x of [FIELD.leftBound - 1.2, FIELD.rightBound + 1.2]) {
      const line = box(0.28, 0.1, 115, '#f8fafc');
      line.position.set(x, 0.34, 50);
      this.field.add(line);
      for (let z = 0; z <= 100; z += 10) {
        const pylon = box(0.6, 1.2, 0.6, '#fb923c');
        pylon.position.set(x, 0.8, z);
        this.field.add(pylon);
      }
    }
  },

    addStadium(stadium) {
    const crowdColors = [this.match.homeTeam.colors.primary, this.match.awayTeam.colors.primary, '#f8fafc', stadium.accent];
    for (const side of [-1, 1]) {
      const stand = new THREE.Group();
      stand.position.set(side * 43, 0, 50);
      stand.rotation.z = side * -0.08;
      this.scene.add(stand);
      for (let tier = 0; tier < 4; tier += 1) {
        const deck = box(98, 1.2, 12, stadium.wall);
        deck.position.set(0, 4 + tier * 2.2, tier * 3);
        stand.add(deck);
      }
      for (let i = 0; i < 84; i += 1) {
        const crowd = box(1.5, 1.2, 1.3, crowdColors[i % crowdColors.length]);
        crowd.position.set(-47 + (i % 14) * 7, 7 + Math.floor(i / 14) * 1.25, -8 + (i % 6) * 4);
        stand.add(crowd);
      }
    }
    this.addScoreboardObject(stadium);
    this.addGoalposts();
    this.addThemeProps(stadium);
  },

    addScoreboardObject(stadium) {
    const board = new THREE.Group();
    board.position.set(0, 18, 113);
    const backing = box(26, 10, 1.1, '#0b1220');
    board.add(backing);
    const label = textPlane(`${this.match.homeTeam.shortName} ${this.match.score.home}   ${this.match.awayTeam.shortName} ${this.match.score.away}`, stadium.light, 15, 4);
    label.position.set(0, 0.8, -0.62);
    board.add(label);
    this.stadiumScoreText = label;
    this.scene.add(board);
    const glow = new THREE.PointLight(stadium.light, 1.15, 90);
    glow.position.set(0, 21, 104);
    this.scene.add(glow);
  },

    addGoalposts() {
    for (const z of [-2, 112]) {
      const post = new THREE.Group();
      post.position.set(0, 0, z);
      const base = box(0.5, 8, 0.5, '#facc15');
      base.position.y = 4;
      const cross = box(10, 0.4, 0.4, '#facc15');
      cross.position.y = 8;
      const left = box(0.4, 6, 0.4, '#facc15');
      left.position.set(-5, 10.8, 0);
      const right = box(0.4, 6, 0.4, '#facc15');
      right.position.set(5, 10.8, 0);
      post.add(base, cross, left, right);
      this.scene.add(post);
    }
  },

    addThemeProps(stadium) {
    if (stadium.props === 'dome') {
      const roof = new THREE.Mesh(new THREE.SphereGeometry(66, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), mat('#12203d', { transparent: true, opacity: 0.42 }));
      roof.position.set(0, 10, 50);
      roof.scale.z = 1.28;
      this.scene.add(roof);
      for (let z = 8; z < 100; z += 18) {
        const ribbon = box(78, 0.5, 0.7, stadium.accent);
        ribbon.position.set(0, 13, z);
        this.scene.add(ribbon);
      }
    }
    if (stadium.props === 'canyon') {
      for (let i = 0; i < 10; i += 1) {
        const rock = new THREE.Mesh(new THREE.ConeGeometry(5 + (i % 3), 16 + (i % 4) * 3, 5), mat('#8c4e2e'));
        rock.position.set(-55 + i * 12, 7, 123 + (i % 2) * 6);
        this.scene.add(rock);
      }
    }
    if (stadium.props === 'industrial') {
      for (const x of [-34, 34]) {
        const stack = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.5, 21, 6), mat('#353b42'));
        stack.position.set(x, 11, 119);
        this.scene.add(stack);
        const smoke = new THREE.Mesh(new THREE.SphereGeometry(3, 7, 5), mat('#6b7280', { transparent: true, opacity: 0.38 }));
        smoke.position.set(x + 2, 24, 117);
        this.scene.add(smoke);
      }
    }
    if (stadium.props === 'bayou') {
      const water = box(120, 0.08, 18, '#0e4a45');
      water.position.set(0, 0.04, 121);
      this.scene.add(water);
      for (let i = 0; i < 18; i += 1) {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 6, 5), mat('#4d3422'));
        trunk.position.set(-58 + i * 7, 3, i % 2 ? -9 : 118);
        const top = new THREE.Mesh(new THREE.ConeGeometry(3.2, 7, 6), mat('#1d5d37'));
        top.position.set(trunk.position.x, 8, trunk.position.z);
        this.scene.add(trunk, top);
      }
    }
  },

    lineup() {
    this.players.forEach((player) => this.scene.remove(player.mesh));
    this.players = [];
    this.offense = this.match.possession;
    this.dir = this.offense === 'home' ? 1 : -1;
    this.snapZ = this.dir === 1 ? this.match.yardLine : 100 - this.match.yardLine;
    const offenseTeam = this.offense === 'home' ? this.match.homeTeam : this.match.awayTeam;
    const defenseTeam = this.offense === 'home' ? this.match.awayTeam : this.match.homeTeam;
    const formation = FORMATIONS[this.currentPlay.formation] ?? FORMATIONS.Shotgun;
    ROLES.offense.forEach((role) => this.addPlayer(role, this.offense, offenseTeam, formation[role], true));
    ROLES.defense.forEach((role) => this.addPlayer(role, this.offense === 'home' ? 'away' : 'home', defenseTeam, DEFENSE[role], false));
    this.carrier = this.players.find((player) => player.role === 'QB' && player.side === this.offense);
    this.ballMode = 'held';
    this.target = this.currentPlay.recommendedTarget || 'WR1';
    this.passDone = false;
    this.forwardProgressTimer = 0;
    this.assignRoutes();
    this.updateMarkers();
  },

    addPlayer(role, side, team, offset, offense) {
    const roster = team.roster?.[role] ?? {};
    const ratings = buildPlayerRatings(team, role, roster);
    const uniform = side === 'home' ? team.uniforms.home : team.uniforms.away;
    const mesh = playerMesh(team, uniform, role, roster.number ?? 0);
    const player = {
      role,
      side,
      team,
      mesh,
      ratings,
      name: roster.name ?? `${team.shortName} ${role}`,
      number: roster.number ?? 0,
      offense,
      route: [],
      routeIndex: 0,
      vx: 0,
      vz: 0,
      blockState: 'released',
      blockTimer: 0,
      shedTimer: 0,
      contactTimer: 0,
      reaction: Math.random() * 0.2
    };
    mesh.position.set(offset[0], 0, this.snapZ + this.dir * offset[1]);
    this.scene.add(mesh);
    this.players.push(player);
  },

    assignRoutes() {
    for (const player of this.players.filter((item) => item.side === this.offense)) {
      const route = this.currentPlay.routes[player.role] ?? [];
      player.route = route.map(([x, y]) => ({ x, z: this.snapZ + this.dir * y }));
      player.routeIndex = 0;
    }
  }
};

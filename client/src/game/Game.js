import { THREE, TEAMS, STADIUMS, PLAYS, loadSettings } from './GameShared.js';
import { gameInputViewsMethods } from './GameInputViews.js';
import { gameSceneMethods } from './GameScene.js';
import { gameRuntimeMethods } from './GameRuntime.js';
import { gameHudAudioMethods } from './GameHudAudio.js';

export class Game {
  constructor({ canvas, uiRoot, toastRoot }) {
    this.canvas = canvas;
    this.uiRoot = uiRoot;
    this.toastRoot = toastRoot;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor('#07111f');
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(56, 1, 0.1, 600);
    this.keys = new Set();
    this.players = [];
    this.effects = [];
    this.settings = loadSettings();
    this.homeId = localStorage.getItem('gb97-home') || TEAMS[0].id;
    this.awayId = localStorage.getItem('gb97-away') || TEAMS[1].id;
    this.stadiumId = localStorage.getItem('gb97-stadium') || STADIUMS[0].id;
    this.mode = 'exhibition';
    this.phase = 'menu';
    this.currentPlay = PLAYS[0];
    this.playIndex = 0;
    this.target = 'WR1';
    this.defensiveLook = null;
    this.readModifier = null;
    this.lastReadFeedback = '';
    this.status = 'Pick a mode.';
    this.banner = '';
    this.last = performance.now();
    this.elapsed = 0;
    this.audio = null;
    this.shake = 0;
    this.cpuSnapTimer = 0;
    this.forwardProgressTimer = 0;
    this.routePreviewId = 0;
  }
}

Object.assign(
  Game.prototype,
  gameInputViewsMethods,
  gameSceneMethods,
  gameRuntimeMethods,
  gameHudAudioMethods
);

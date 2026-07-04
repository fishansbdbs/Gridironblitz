import './styles/main.css';
import './styles/ui.css';
import './styles/game.css';
import { Game } from './game/Game.js';

const game = new Game({
  canvas: document.querySelector('#game-canvas'),
  uiRoot: document.querySelector('#ui-root'),
  toastRoot: document.querySelector('#toast-root')
});
game.start();
window.gridironBlitz97 = game;

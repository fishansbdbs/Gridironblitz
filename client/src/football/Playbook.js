import { PLAYS } from '../data/plays.js';
export function getPlay(index) { return PLAYS[((index % PLAYS.length) + PLAYS.length) % PLAYS.length]; }
export function randomPlay() { return PLAYS[Math.floor(Math.random() * PLAYS.length)]; }

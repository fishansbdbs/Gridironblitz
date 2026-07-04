import { gameRuntimeControlMethods } from './GameRuntimeControl.js';
import { gameRuntimeFlowMethods } from './GameRuntimeFlow.js';
import { gameRuntimeContactMethods } from './GameRuntimeResolutionContact.js';
import { gameRuntimePassingMethods } from './GameRuntimeResolutionPass.js';
import { gameRuntimeScoringMethods } from './GameRuntimeResolutionScoring.js';
import { gameRuntimeMovementMethods } from './GameRuntimeEffectsMovement.js';
import { gameRuntimeCameraMethods } from './GameRuntimeEffectsCamera.js';
import { gameRuntimeAnimationMethods } from './GameRuntimeEffectsAnimation.js';

export const gameRuntimeMethods = {
  ...gameRuntimeControlMethods,
  ...gameRuntimeFlowMethods,
  ...gameRuntimeContactMethods,
  ...gameRuntimePassingMethods,
  ...gameRuntimeScoringMethods,
  ...gameRuntimeMovementMethods,
  ...gameRuntimeCameraMethods,
  ...gameRuntimeAnimationMethods
};

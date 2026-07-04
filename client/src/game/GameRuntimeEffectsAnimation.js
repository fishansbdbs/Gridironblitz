import {
  THREE,
  mat
} from './GameShared.js';

export const gameRuntimeAnimationMethods = {
  animatePlayers(dt) {
    for (const player of this.players) {
      const speed = Math.hypot(player.vx ?? 0, player.vz ?? 0);
      const run = this.phase === 'live' ? speed : 0.6;
      const swing = Math.sin(this.elapsed * (run > 5 ? 16 : 6) + player.mesh.position.x) * (run > 5 ? 0.28 : 0.08);
      player.mesh.rotation.z = player.contactTimer > 0 ? Math.sin(this.elapsed * 30) * 0.08 : 0;
      player.mesh.rotation.x = player.blockTimer > 0 ? -0.12 : (this.phase === 'pre-snap' && ['OL', 'DL'].includes(player.ratings.archetype) ? -0.18 : 0);
      const leftArm = player.mesh.userData.leftArm;
      const rightArm = player.mesh.userData.rightArm;
      const leftLeg = player.mesh.userData.leftLeg;
      const rightLeg = player.mesh.userData.rightLeg;
      if (leftArm && rightArm && leftLeg && rightLeg) {
        leftArm.rotation.x = swing;
        rightArm.rotation.x = -swing;
        leftLeg.rotation.x = -swing;
        rightLeg.rotation.x = swing;
        if (player.blockTimer > 0) {
          leftArm.rotation.x = -0.7;
          rightArm.rotation.x = -0.7;
        }
        if (this.ballMode === 'air' && player === this.passTarget) {
          leftArm.rotation.x = -1.2;
          rightArm.rotation.x = -1.2;
        }
        if (player === this.carrier && player.role === 'QB' && this.ballMode === 'air') rightArm.rotation.x = -1.4;
      }
      player.contactTimer = Math.max(0, (player.contactTimer ?? 0) - dt);
    }
  },
  updateEffects(dt) {
    for (const effect of this.effects) {
      effect.life -= dt;
      effect.mesh.material.opacity = Math.max(0, effect.life / effect.maxLife);
      effect.mesh.position.y += dt * 0.8;
      if (effect.life <= 0) {
        this.scene.remove(effect.mesh);
      }
    }
    this.effects = this.effects.filter((effect) => effect.life > 0);
  },
  addDust(position, color) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 4), mat(color, { transparent: true, opacity: 0.55 }));
    puff.position.copy(position);
    puff.position.y = 0.4;
    this.scene.add(puff);
    this.effects.push({ mesh: puff, life: 0.45, maxLife: 0.45 });
  },
  addTrail(position) {
    const trail = new THREE.Mesh(new THREE.SphereGeometry(0.18, 5, 4), mat('#fef3c7', { transparent: true, opacity: 0.5 }));
    trail.position.copy(position);
    this.scene.add(trail);
    this.effects.push({ mesh: trail, life: 0.28, maxLife: 0.28 });
  }
};

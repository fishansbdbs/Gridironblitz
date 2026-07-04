# GRIDIRON BLITZ 97

v0.4.0 - Pre-Snap Chess Update

Gridiron Blitz 97 is an original low-poly 3D arcade American football game built with Vite, Three.js, HTML, CSS, LocalStorage, and the Web Audio API. It uses fictional teams, fictional players, procedural models, generated sounds, and local-only play.

## Play Locally On Windows

1. Install Node.js.
2. Download the ZIP from GitHub.
3. Extract the ZIP.
4. Open the folder.
5. Click the address bar.
6. Type `cmd`.
7. Run:

```bash
npm run install:all
```

8. Run:

```bash
npm run play
```

9. Open:

```text
http://localhost:5173
```

## Scripts

```bash
npm run install:all
npm run dev:client
npm run build:client
npm run preview:client
npm run play
npm run check
```

## Controls

- `A/D` or arrow keys: cycle plays when the play menu is open.
- `Enter` or `Space`: select play or snap the ball.
- `WASD`: move the ball carrier.
- `Shift`: sprint.
- `Space` after snap: juke/cut.
- `1`: throw/select WR1.
- `2`: throw/select WR2.
- `3`: throw/select TE.
- `4`: throw/select RB.
- `Esc`: return to main menu.

## Camera Modes

- Classic: behind-offense retro football camera.
- Broadcast: side/diagonal wide football view.
- Ball Cam: follows the ball or current ball carrier more tightly.

Camera mode, difficulty, score target, graphics, scanlines, and screen shake are saved locally from Settings.

## Rules

- 7-on-7 arcade football.
- 4 downs to gain 10 yards.
- Touchdowns are worth 7 points.
- No extra points, field goals, punts, penalties, injuries, trades, or online play.
- Turnover on downs after failing on 4th down.
- Interceptions switch possession.
- Out of bounds stops the play.
- Exhibition ends at the selected score target, 14 by default.
- Practice mode does not end the game.

## Teams And Stars

- Metro Mammoths: balanced pocket team. Star QB: Atlas Reed.
- Desert Vipers: speed and pressure team. Star WR: Jax Venom.
- Iron Owls: passing and route-running team. Star QB: Orion Vale.
- Bayou Bulls: power running and blocking team. Star RB: Bronco Moss.

Each team has fictional rosters, procedural logos, home uniforms, away uniforms, and stat identities.

## Stadiums

- Metro Dome: indoor city dome with blue lighting and ribbon boards.
- Desert Bowl: sunset stadium with canyon silhouettes and dusty edges.
- Iron Yard: industrial night stadium with factory props.
- Bayou Field: swamp stadium with fog, water, trees, and wooden-stand atmosphere.

Every stadium uses a grass field, yard lines, hash marks, end zones, midfield logo, crowd blocks, goalposts, and a physical scoreboard.

## Gameplay Systems

Collision uses simple XZ circle bodies. Players push apart based on radius and mass, so defenders and blockers no longer freely phase through each other.

Blocking is arcade-style: offensive linemen identify rushers, engage on contact, slow rushers, and create a pocket. Blocking duration depends on blocking and strength against rusher strength and speed.

Tackling is collision-triggered. Tackle outcomes consider tackling, strength, carrier strength, speed, angle, and nearby helpers. Outcomes include tackle, big hit, gang tackle, and broken tackle.

Passing uses QB accuracy/power, receiver catching/route running, defender coverage, distance, separation, and pressure. Feedback includes open target, under pressure, deflected, intercepted, dropped, and incomplete.

Pre-snap defensive reads add original arcade strategy. The defense can show Edge Heat, Deep Lantern, Stone Box, or Mirror Press based on down, distance, field position, score, team identity, and the selected play type. Each read adds small pressure, coverage, separation, or run-lane modifiers and shows a compact hint in the HUD.

## Player Stats

Players use:

- Speed
- Acceleration
- Strength
- Blocking
- Tackling
- Catching
- Throw Accuracy
- Throw Power
- Route Running
- Coverage
- Agility
- Mass

Team identity expands into position-based player ratings. Linemen are heavier blockers, WR/DB players are faster and lighter, QBs pass better, and RBs cut with more power.

## Add Content

Add teams in `client/src/data/teams.js`. Keep all names, logos, colors, and players fictional.

Add stadiums in `client/src/data/stadiums.js`. Stadium props are selected by the `props` field and rendered procedurally in `client/src/game/Game.js`.

Add plays in `client/src/data/plays.js`. Each play includes a formation, type, situation, description, recommended target, and route points for eligible receivers.

Add animations by extending the transform animation logic in `client/src/game/Game.js`. The current system is bone-less: arms, legs, torso lean, block push, catch pose, and contact lean are simple mesh transforms.

## Known Limitations

- This is still an arcade prototype, not a full football simulation.
- AI is readable and functional, but not deeply strategic.
- The physical scoreboard uses simplified text.
- There are no punts, field goals, penalties, extra points, franchise mode, season mode, roster management, or online multiplayer.
- Browser bundle size includes Three.js and may trigger Vite's chunk-size warning even when the build succeeds.

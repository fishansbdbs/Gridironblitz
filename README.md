# GRIDIRON BLITZ 97

v0.1.0 - PS1 Arcade Football Prototype

Gridiron Blitz 97 is an original low-poly 3D arcade American football game built with Vite, Three.js, HTML, CSS, LocalStorage, and the Web Audio API. It uses fictional teams, procedural models, generated sounds, and local-only play.

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

The play command prints:

```text
Open this URL: http://localhost:5173
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
- `Space` after snap: juke.
- `1`: throw/select WR1.
- `2`: throw/select WR2.
- `3`: throw/select TE.
- `4`: throw/select RB.
- `Esc`: return to main menu.

Defense is mostly CPU-controlled in v0.1.0. During CPU possessions, the player can influence the linebacker while the CPU offense runs a simple play.

## Rules

- 7-on-7 arcade football.
- 4 downs to gain 10 yards.
- Touchdowns are worth 7 points.
- No extra points, field goals, punts, penalties, injuries, trades, or online play.
- Turnover on downs after failing on 4th down.
- Interceptions can happen on contested passes.
- First to 14 wins in Exhibition.
- Practice mode has no score limit.
- Drives start at the offense's 25-yard line.

## Teams

- Metro Mammoths: balanced blue, white, and silver team.
- Desert Vipers: fast red, black, and gold team.
- Iron Owls: passing-focused purple, steel, and white team.
- Bayou Bulls: physical green, cream, and bronze team.

Edit `client/src/data/teams.js` to add teams. Use fictional names, colors, logos, and player identities only.

## Stadiums

- Metro Dome: closed roof, blue lights, digital scoreboard.
- Desert Bowl: sunset desert stadium with canyon props.
- Iron Yard: industrial night stadium with steel accents.
- Bayou Field: swampy outdoor field with foggy green lighting.

Edit `client/src/data/stadiums.js` to add stadiums. Stadium visuals are procedural and read by `client/src/football/Stadium.js`.

## Plays

The playbook lives in `client/src/data/plays.js` and includes Quick Slants, Deep Posts, Flood Right, Smash, HB Dive, Sweep Left, QB Rollout, and TE Drag.

## Known Limitations

- This is an arcade prototype, not a simulation.
- Defense is intentionally simple.
- CPU offense is functional but basic.
- Animations are chunky procedural motion rather than authored clips.
- No roster management, season mode, franchise mode, online multiplayer, punts, field goals, or penalties.
- Mouse passing is not the primary input; number-key passing is the reliable v0.1.0 method.

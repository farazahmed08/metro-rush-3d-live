# Metro Rush 3D

An original browser-based endless runner inspired by the rail-corridor composition in the provided
reference image: three lanes, trains, barriers, coins, dense side scenery, and a centered chase
camera.

## Run it

From this folder:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Controls

- `←` / `→` or `A` / `D`: switch lanes
- `↑`, `W`, or `Space`: jump
- `↓` or `S`: slide
- On mobile: swipe left/right to switch lanes, swipe up to jump, swipe down to slide

## Included

- Procedural 3D rail district
- Compact start-screen drawers for choosing among three runner styles and four weather presets
- Trains, barricades, cones, low signs, coins, lamps, trees, buildings, and overhead structures
- Magnet power-ups that pull nearby coins from every lane for 5–10 seconds
- x2 coin power-ups that double each coin collected for 5–10 seconds
- Shared power-up spacing so boosts arrive with breathing room instead of clustering together
- Train-roof routes with climbable ramps and rooftop coin lines
- Randomized opening layouts so every new run begins differently
- Lane switching, jumping, sliding, pause/resume countdowns, collisions, scoring, and increasing speed
- Procedural jump, coin, and crash sound effects with matching visual bursts
- Game-over actions for restarting immediately or returning home
- Responsive HUD and touch controls

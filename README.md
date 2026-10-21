# Wizard's Chess — Garden Courtyard & Classic Staunton Edition

An interactive 3D WebGL chess game set in an atmospheric garden courtyard, featuring custom procedural Staunton-inspired marble and obsidian pieces, dramatic shatter capture physics, procedural Web Audio sound effects, and an integrated tactical AI engine.

## Features

- **3D Garden Courtyard & Classic Staunton Pieces:** Built with Three.js (`r128`), featuring procedurally generated stone, marble, obsidian, rune, and courtyard textures with dynamic shadows and lighting.
- **Shatter Capture Physics:** Captured pieces fracture into physical stone and obsidian shards that bounce and scatter across the board.
- **Tactical Chess AI:** Play against a built-in engine with 4 difficulty levels:
  - **Easy:** 1-ply search with high variance
  - **Medium:** 2-ply Minimax search
  - **Hard:** 3-ply Alpha-Beta pruning with Piece-Square Tables (PST)
  - **Expert:** 4-ply Alpha-Beta pruning with Quiescence search and king safety evaluation
- **Two-Player Pass & Play:** Switch seamlessly between single-player (`AI`) and local two-player (`2P`) modes.
- **Complete Chess Rules:** Powered by `chess.js` for 100% legal move validation, check/checkmate/stalemate detection, castling, en passant, and pawn promotion.
- **Interactive Camera & Controls:** Smooth orbital camera controls (drag to orbit, scroll/pinch to zoom) plus quick camera presets (`Garden`, `White`, `Black`, `Top`), move undo, and synthesized acoustic sound effects.

## Getting Started

No build step or bundler is required. You can open `index.html` directly in a modern browser or serve the directory with any static HTTP server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js (npx)
npx serve .
```

Then open `http://localhost:8000` in your browser.

## Project Structure

```text
├── index.html              # Application entry point & architectural toolbar UI
├── styles/
│   └── main.css            # Custom UI styling and responsive rules
└── src/
    ├── main.js             # Bootstrap & global control bindings
    ├── core/               # Namespace, constants, and shared game state
    ├── ai/                 # Minimax / Alpha-Beta engine & AI turn controller
    ├── audio/              # Procedural Web Audio API sound synthesis
    ├── game/               # Input handling, move animations, shatter effects, highlights
    ├── pieces/             # 3D Staunton piece geometries & board piece manager
    ├── render/             # Main requestAnimationFrame render loop
    ├── scene/              # Three.js scene setup, camera presets, chessboard, & garden
    ├── textures/           # Procedural canvas textures (marble, stone, soil, runes)
    └── ui/                 # HUD telemetry and endgame modal updates
```

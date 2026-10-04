# p5.js + Matter.js Snooker Game

A browser-based snooker simulation built with **JavaScript, p5.js and Matter.js** for the **CM2030 Graphics Programming** module in the University of London BSc Computer Science programme.

The project combines 2D graphics with a physics engine to simulate ball motion, collisions, cushions, potting, cue interaction, scoring and game-state features.

## Features

- Physics-based snooker ball movement with Matter.js
- Cue-ball placement and aiming
- Mouse-driven cue control and shot-power feedback
- Cushion and ball collision handling
- Pot detection and scoring
- Red and coloured-ball management
- Solo and multiplayer game modes
- Turn switching and foul detection
- Cue-ball spin controls
- Collision and aiming guides
- Shot replay by restoring ball position and velocity state
- Game timer
- Saved game state and game history using browser storage
- Sound effects for collisions and potting
- Visual feedback for shots, pots and collisions

## Technologies

- JavaScript
- p5.js
- Matter.js
- HTML5
- CSS3
- Web Audio assets

## Project Structure

```text
.
├── index.html
├── main.js
├── ballManager.js
├── cueStick.js
├── cushion.js
├── collision.js
├── gameMode.js
├── gameRules.js
├── keyboardControls.js
├── mouseControls.js
├── replay.js
├── score.js
├── sound.js
├── spinControl.js
├── table.js
├── timer.js
├── visuals.js
├── libraries/
├── audio files
└── .gitignore
```

## Running Locally

Open `index.html` in a browser, or run a local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Controls

The game supports mouse-based aiming and shooting together with keyboard controls for cue-ball spin. On-screen prompts and the game menu provide the available controls and mode options.

## Coursework Context

This repository is a cleaned portfolio version of a CM2030 Graphics Programming project. It demonstrates interactive graphics, modular JavaScript design, physics simulation, collision handling, game-state management and event-driven user input.

## Author

**Abdullah Humayun**  
BSc Computer Science – University of London / Goldsmiths

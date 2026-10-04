// KeyboardControls handles all key-based interactions in the snooker game,
// including ball setup modes, cue control, aiming, shot power, and spin.
class KeyboardControls {
  constructor(ballManager, spinControl, saveLastShotState, replayLastShot) {
    this.ballManager = ballManager;             // Access to all ball states and actions
    this.spinControl = spinControl;             // Handles spin direction settings
    this.saveLastShotState = saveLastShotState; // Captures state before shooting (for replay)
    this.replayLastShot = replayLastShot;       // Replay handler function
  }

  // Handles all key press interactions
  keyPressed(key, keyCode) {
    // ---------- Layout Initialization: Modes 1 / 2 / 3 ----------
    if (key === '1' || key === '2' || key === '3') {
     console.log(`Key pressed: ${key} - Load ball layout ${key}`); this.ballManager.initializeBalls(parseInt(key)); // Load layout
      scoreBoard.reset?.();                            // Reset score UI
      gameTimer.stop();                                // Stop timer for reset
      gameTimer.timeElapsed = 0;                       // Clear time

      placingCueBall = true;   // Enable cue placement
      isAimingShot = true;     // Allow aiming immediately

      // Multiplayer-specific state reset
      if (gameMode === 'multiplayer') {
        player1Score = 0;
        player2Score = 0;
        currentPlayer = 1;
        foulCommitted = false;
        anyBallPottedThisTurn = false;
      }
      return;
    }

    // ---------- Manual Cue Ball Placement ----------
    if ((key === 'C' || key === 'c') && placingCueBall) {
      console.log("Key pressed: C - Place cue ball in D zone");
      placeCueBallAtDZone();  // Insert cue in D zone
      placingCueBall = false;
      isAimingShot = true;
      gameTimer.start();      // Timer starts after placement
      return;
    }

    // ---------- Shot Replay Feature ----------
    if (key === 'R' || key === 'r') {
      console.log("Key pressed: R - Replay last shot");
      this.replayLastShot();  // Triggers last shot animation
    }

    // ---------- Disallow cue operations if cue is not placed or not aiming ----------
    if (placingCueBall || !isAimingShot) return;

    // ---------- Cue Rotation via Arrows ----------
    if (keyCode === LEFT_ARROW) {
      console.log("Key pressed: LEFT_ARROW - Rotate cue left");
      cueAimAngle -= PI / 36;   // Rotate aim left
      mouseCueEnabled = false;  // Disable mouse override
      redraw();
    } else if (keyCode === RIGHT_ARROW) {
      console.log("Key pressed: RIGHT_ARROW - Rotate cue right");
      cueAimAngle += PI / 36;   // Rotate aim right
      mouseCueEnabled = false;
      redraw();
    }

    // ---------- Shoot Cue Ball (SPACEBAR) ----------
    if (key === ' ') {
      console.log("Key pressed: SPACE - Shoot cue ball");
      const cueBall = this.ballManager.getCueBall();
      if (cueBall) {
        this.saveLastShotState(); // Save state for replay

        // Calculate shot vector using current aim and power
        const force = {
          x: Math.cos(cueAimAngle) * aimPower,
          y: Math.sin(cueAimAngle) * aimPower
        };
        Body.applyForce(cueBall.body, cueBall.body.position, force); // Apply main cue force

        // ---------- Apply Spin After Force ----------
        const spinForce = 0.00025;
        const spinMode = this.spinControl.getSpin();

        if (spinMode === 'top') {
          console.log("Applying spin: TOP");
          Body.applyForce(cueBall.body, cueBall.body.position, { x: 0, y: -spinForce });
        } else if (spinMode === 'bottom') {
          console.log("Applying spin: BOTTOM");
          Body.applyForce(cueBall.body, cueBall.body.position, { x: 0, y: spinForce });
        } else if (spinMode === 'left') {
          console.log("Applying spin: LEFT");
          Body.applyForce(cueBall.body, cueBall.body.position, { x: -spinForce, y: 0 });
        } else if (spinMode === 'right') {
          console.log("Applying spin: RIGHT");
          Body.applyForce(cueBall.body, cueBall.body.position, { x: spinForce, y: 0 });
        }

        // Finalize shot state
        isAimingShot = false;
        shotInitiated = true;
        this.spinControl.setSpin("none"); // Reset spin
        loop(); // Resume draw loop for animation
      }
    }

    // ---------- Spin Control with WASD ----------
    if (key === 'W' || key === 'w') {
      console.log("Key pressed: W - Set spin to TOP");
      this.spinControl.setSpin('top');
      redraw();
    } else if (key === 'S' || key === 's') {
      console.log("Key pressed: S - Set spin to BOTTOM");
      this.spinControl.setSpin('bottom');
      redraw();
    } else if (key === 'A' || key === 'a') {
      console.log("Key pressed: A - Set spin to LEFT");
      this.spinControl.setSpin('left');
      redraw();
    } else if (key === 'D' || key === 'd') {
      console.log("Key pressed: D - Set spin to RIGHT");
      this.spinControl.setSpin('right');
      redraw();
    }
  }

  // Optional handler: reset any held spin direction key flags
  keyReleased(key) {
    if (typeof spinDirection !== 'undefined') {
      if (key === 'W' || key === 'S') spinDirection.y = 0;
      if (key === 'A' || key === 'D') spinDirection.x = 0;
    }
  }
}

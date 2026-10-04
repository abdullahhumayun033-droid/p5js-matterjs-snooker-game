// MouseControls handles all cue interaction via mouse including:
// placing the cue ball in the D zone, dragging the cue stick, and releasing the shot.
class MouseControls {
  constructor(ballManager, cueStick, saveLastShotState) {
    this.ballManager = ballManager;             // Reference to ball manager
    this.cueStick = cueStick;                   // Cue stick instance for visual updates
    this.saveLastShotState = saveLastShotState; // Function to preserve pre-shot state for replay
  }

  // Called when mouse is pressed
  mousePressed(mouseX, mouseY) {
    // --- Placing the cue ball manually in the D zone ---
    if (placingCueBall) {
      const baulkDist = tableLength * (29 / 144);
      const baulkX = tableMargin + baulkDist;
      const dRadius = tableWidth * (11.5 / 72);
      const centreY = tableMargin + tableWidth / 2;

      // Check if click is inside the D semi-circle and to the left of baulk line
      const dx = mouseX - baulkX;
      const dy = mouseY - centreY;
      const insideD = dx * dx + dy * dy <= dRadius * dRadius && mouseX <= baulkX;

      if (insideD) {
        // Remove old cue ball if exists
        let cueBall = this.ballManager.getCueBall();
        if (cueBall?.body) {
          World.remove(world, cueBall.body);
        }

        // Spawn new cue ball at clicked position
        cueBall = this.ballManager.spawnGameBall(mouseX, mouseY, color(255), true);
        this.ballManager.setCueBall(cueBall);
        this.cueStick.updateCueBall(cueBall); // Sync cue stick with new cue ball

        // Refresh game state references
        redBalls = this.ballManager.getRedBalls();
        colouredBalls = this.ballManager.getColouredBalls();
        gameBalls = this.ballManager.getGameBalls();

        placingCueBall = false;
        isAimingShot = true;
        if (!gameTimer.running) gameTimer.start(); // Start clock
        redraw();
      }

    } else {
      // --- Aiming drag: Begin pulling cue stick ---
      const cueBall = this.ballManager.getCueBall();
      if (cueBall && isAimingShot) {
        const p = cueBall.body.position;
        const d = dist(mouseX, mouseY, p.x, p.y);
        if (d < ballDiameter * 2) {
          cueBeingDragged = true;
          dragStart = { x: p.x, y: p.y };   // Origin of drag
          mouseCueEnabled = true;
        }
      }
    }
  }

  // Called while mouse is dragged
  mouseDragged(mouseX, mouseY) {
    if (cueBeingDragged && dragStart) {
      redraw(); // Redraw cue visuals
      const pullBack = dist(mouseX, mouseY, dragStart.x, dragStart.y);
      currentShotStrength = constrain(pullBack / maxDrag, 0, 1); // Normalize to [0, 1]
    } else if (isAimingShot) {
      mouseCueEnabled = true;
      redraw();
    }
  }

  // Called when mouse moves (without click)
  mouseMoved(mouseX, mouseY) {
    const cueBall = this.ballManager.getCueBall();
    if (cueBall && isAimingShot && !cueBeingDragged) {
      mouseCueEnabled = true;
      redraw(); // Ensures cue aim line updates while hovering
    }
  }

  // Called when mouse is released after dragging (takes the shot)
  mouseReleased(mouseX, mouseY) {
    if (cueBeingDragged && dragStart) {
      const cueBall = this.ballManager.getCueBall();
      if (!cueBall?.body) return;

      // Determine cue shot direction and angle from drag vector
      const dx = dragStart.x - mouseX;
      const dy = dragStart.y - mouseY;
      cueAimAngle = atan2(dy, dx);

      // Calculate shot strength and convert to force
      const pullBack = dist(mouseX, mouseY, dragStart.x, dragStart.y);
      const strength = constrain(pullBack / maxDrag, 0, 1);
      const basePower = lerp(0.015, 0.1, strength); // Maps strength to power range

      this.saveLastShotState(); // Save current game state for potential replay

      // Apply force to cue ball
      Body.applyForce(cueBall.body, cueBall.body.position, {
        x: Math.cos(cueAimAngle) * basePower,
        y: Math.sin(cueAimAngle) * basePower
      });

      // Reset drag and shot state
      currentShotStrength = 0;
      isAimingShot = false;
      shotInitiated = true;
      cueBeingDragged = false;
      dragStart = null;
      loop(); // Resume rendering loop
    }
  }
}

// Handles spin selection and spin direction UI for the cue ball
class SpinControl {
  constructor(ballDiameter) {
    this.spinMode = "none"; // Can be: 'top', 'bottom', 'left', 'right', or 'none'
    this.ballDiameter = ballDiameter;
  }

  // Set current spin direction
  setSpin(mode) {
    this.spinMode = mode;
  }

  // Retrieve current spin direction
  getSpin() {
    return this.spinMode;
  }

  // Reset spin to neutral (no spin)
  reset() {
    this.spinMode = "none";
  }

  // Render spin direction indicators near the cue ball
  render(cueBall, isAimingShot, placingCueBall, gameMode) {
    if (!cueBall?.body || !isAimingShot || placingCueBall || gameMode === 'multiplayer') return;

    const pos = cueBall.body.position;
    const r = this.ballDiameter * 0.5;
    const offset = r * 2.2;
    const arrowSize = 6;

    push();
    strokeWeight(1.8);
    noFill();

    // Directional arrows: highlighted red when selected
    // Top spin
    stroke(this.spinMode === 'top' ? 'red' : 'white');
    triangle(
      pos.x, pos.y - offset,
      pos.x - arrowSize, pos.y - offset + arrowSize,
      pos.x + arrowSize, pos.y - offset + arrowSize
    );

    // Bottom spin
    stroke(this.spinMode === 'bottom' ? 'red' : 'white');
    triangle(
      pos.x, pos.y + offset,
      pos.x - arrowSize, pos.y + offset - arrowSize,
      pos.x + arrowSize, pos.y + offset - arrowSize
    );

    // Left spin
    stroke(this.spinMode === 'left' ? 'red' : 'white');
    triangle(
      pos.x - offset, pos.y,
      pos.x - offset + arrowSize, pos.y - arrowSize,
      pos.x - offset + arrowSize, pos.y + arrowSize
    );

    // Right spin
    stroke(this.spinMode === 'right' ? 'red' : 'white');
    triangle(
      pos.x + offset, pos.y,
      pos.x + offset - arrowSize, pos.y - arrowSize,
      pos.x + offset - arrowSize, pos.y + arrowSize
    );

    pop();
  }

  // Draws the on-screen spin instruction panel (singleplayer only)
  drawInstructions(gameMode) {
    if (gameMode === 'multiplayer') return;

    const boxWidth = 150;
    const boxHeight = 115;
    const boxX = 10;
    const boxY = 150;

    // Instruction background
    noStroke();
    fill(30, 30, 30, 170);
    rect(boxX, boxY , boxWidth, boxHeight, 10);

    // Instructional text
    fill(255);
    textAlign(LEFT, TOP);
    textSize(14);
    text("🎯 Spin Control:", boxX + 10, boxY + 10);
    text("[W] Top | [S] Bottom", boxX + 10, boxY + 30);
    text("[A] Left | [D] Right", boxX + 10, boxY + 48);
    text("[Space] = No Spin", boxX + 10, boxY + 66);

    // Show selected spin mode
    fill(255, 230, 0);
    text("Selected Spin: " + this.spinMode.toUpperCase(), boxX + 10, boxY + 85);
  }
}

// Draws the snooker table background, pockets, boundary arcs, and D-zone
function drawGameTable() {
  // Outer glow around table
  noStroke();
  fill(50, 50, 50, 80);
  rect(tableMargin - 18, tableMargin - 18, tableLength + 36, tableWidth + 36, 40);

  // Wooden table border
  fill(75, 45, 13);
  rect(tableMargin - 10, tableMargin - 10, tableLength + 20, tableWidth + 20, 24);

  // Green felt surface
  fill(60, 120, 42);
  rect(tableMargin, tableMargin, tableLength, tableWidth, 18);

  // Key positions
  const leftX = tableMargin;
  const rightX = tableMargin + tableLength;
  const topY = tableMargin;
  const botY = tableMargin + tableWidth;
  const midX = tableMargin + tableLength / 2;
  const midY = tableMargin + tableWidth / 2;
  const pR = pocketDiameter;

  // Draw 6 pockets
  fill(0);
  ellipse(leftX, topY, pR);
  ellipse(midX, topY, pR);
  ellipse(rightX, topY, pR);
  ellipse(leftX, botY, pR);
  ellipse(midX, botY, pR);
  ellipse(rightX, botY, pR);

  // Pocket accent arcs (visual flair)
  stroke(230, 200, 60);
  strokeWeight(7);
  noFill();
  arc(leftX, topY, pR * 1.18, pR * 1.18, 0, HALF_PI);
  arc(rightX, topY, pR * 1.18, pR * 1.18, HALF_PI, PI);
  arc(leftX, botY, pR * 1.18, pR * 1.18, -HALF_PI, 0);
  arc(rightX, botY, pR * 1.18, pR * 1.18, PI, PI + HALF_PI);
  arc(midX, topY, pR * 1.08, pR * 1.08, PI, 0);
  arc(midX, botY, pR * 1.08, pR * 1.08, 0, PI);

  // Baulk line (used to define D-zone)
  stroke(255);
  strokeWeight(2);
  const baulkDist = tableLength * (29 / 144);
  const x0 = tableMargin + baulkDist;
  line(x0, topY, x0, botY);

  // D zone arc (left-facing half-circle)
  const dRadius = tableWidth * (11.5 / 72);
  noFill();
  arc(x0, midY, dRadius * 2, dRadius * 2, HALF_PI, -HALF_PI);

  // Label inside D zone
  noStroke();
  fill(255, 240, 240, 210);
  textAlign(LEFT, CENTER);
  textSize(ballDiameter * 0.7);
  text('the "D"\nzone', x0 - dRadius * 1.08, midY);

  // Cue placement message (shown only when cue not yet placed)
  if (placingCueBall) {
    fill(30, 30, 120, 190);
    textAlign(CENTER);
    textSize(14);
    text("Click or press [C] inside the D zone to place the cue ball", x0, midY - dRadius - 30);
  }
}

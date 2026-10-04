// === Renders all active game balls on the table ===
function drawGameBalls() {
  gameBalls.forEach(b => {
    if (!b || !b.body) return;
    const pos = b.body.position;

    // Skip rendering balls that moved off the table bounds
    if (
      pos.x < tableMargin - 10 || pos.x > tableMargin + tableLength + 10 ||
      pos.y < tableMargin - 10 || pos.y > tableMargin + tableWidth + 10
    ) return;

    fill(b.color);
    stroke(b.isCue ? 180 : 70);
    strokeWeight(b.isCue ? 2 : 1);
    ellipse(pos.x, pos.y, ballDiameter);
  });
}

// === Draws aiming guideline from cue ball to first hit target ===
function drawAimingGuide() {
  if (!cueBall?.body || !isAimingShot || placingCueBall) return;

  const pos = cueBall.body.position;
  let angle;

  // Determine aim angle based on mouse or keyboard drag
  if (cueBeingDragged && dragStart && mouseIsPressed) {
    angle = atan2(dragStart.y - mouseY, dragStart.x - mouseX);
  } else if (!mouseCueEnabled) {
    angle = cueAimAngle;
  } else {
    angle = atan2(pos.y - mouseY, pos.x - mouseX);
  }

  const cueDir = { x: Math.cos(angle), y: Math.sin(angle) };
  const maxDistance = 1000;
  let collision = null;

  // Check if cue line hits any other ball
  for (let ball of gameBalls) {
    if (!ball?.body || ball === cueBall) continue;

    const other = ball.body.position;
    const dx = other.x - pos.x;
    const dy = other.y - pos.y;
    const proj = dx * cueDir.x + dy * cueDir.y;

    if (proj <= 0 || proj > maxDistance) continue;

    const closestX = pos.x + cueDir.x * proj;
    const closestY = pos.y + cueDir.y * proj;
    const distToBall = dist(closestX, closestY, other.x, other.y);

    if (distToBall < ballDiameter * 0.55) {
      collision = { impactX: closestX, impactY: closestY, ballX: other.x, ballY: other.y, cueDir };
      break;
    }
  }

  push();

  if (collision) {
    // Draw dual cue lines with spacing, impact ring, and projected target direction
    const { impactX, impactY, ballX, ballY, cueDir } = collision;
    const offset = 4;
    const normal = createVector(-cueDir.y, cueDir.x).normalize().mult(offset);

    const from1 = { x: pos.x + normal.x, y: pos.y + normal.y };
    const to1 = { x: impactX + normal.x, y: impactY + normal.y };
    const from2 = { x: pos.x - normal.x, y: pos.y - normal.y };
    const to2 = { x: impactX - normal.x, y: impactY - normal.y };

    stroke(255);
    strokeWeight(2.2);
    line(from1.x, from1.y, to1.x, to1.y);
    line(from2.x, from2.y, to2.x, to2.y);

    stroke(255);
    strokeWeight(2);
    noFill();
    ellipse(impactX, impactY, ballDiameter * 0.85);

    // Direction cue ball will push the target
    let ballVector = createVector(ballX - impactX, ballY - impactY).normalize().mult(100);
    stroke(255, 255, 255, 90);
    strokeWeight(2);
    line(ballX, ballY, ballX + ballVector.x, ballY + ballVector.y);
  } else {
    // No ball hit – draw infinite aim lines
    const offset = 4;
    const normal = createVector(-cueDir.y, cueDir.x).normalize().mult(offset);
    const guideEnd = {
      x: pos.x + cueDir.x * 300,
      y: pos.y + cueDir.y * 300
    };

    stroke(255);
    strokeWeight(2.2);
    line(pos.x + normal.x, pos.y + normal.y, guideEnd.x + normal.x, guideEnd.y + normal.y);
    line(pos.x - normal.x, pos.y - normal.y, guideEnd.x - normal.x, guideEnd.y - normal.y);
  }

  pop();
}

// === Visualizes predicted cue and target ball paths ===
function drawCollisionPrediction() {
  if (!cueBall?.body || !isAimingShot || placingCueBall) return;

  const pos = cueBall.body.position;
  let angle;

  if (cueBeingDragged && dragStart && mouseIsPressed) {
    angle = atan2(dragStart.y - mouseY, dragStart.x - mouseX);
  } else if (!mouseCueEnabled) {
    angle = cueAimAngle;
  } else {
    angle = atan2(pos.y - mouseY, pos.x - mouseX);
  }

  const cueVec = createVector(Math.cos(angle), Math.sin(angle));
  const cueOffset = cueVec.copy().rotate(HALF_PI).mult(ballDiameter * 0.3);
  const maxDistance = 1000;
  let collision = null;

  for (let ball of gameBalls) {
    if (!ball?.body || ball === cueBall) continue;

    const other = ball.body.position;
    const toBall = createVector(other.x - pos.x, other.y - pos.y);
    const proj = toBall.dot(cueVec);

    if (proj <= 0 || proj > maxDistance) continue;

    const closest = p5.Vector.add(createVector(pos.x, pos.y), p5.Vector.mult(cueVec, proj));
    const distToBall = dist(closest.x, closest.y, other.x, other.y);

    if (distToBall < ballDiameter * 0.55) {
      collision = {
        impactX: closest.x, impactY: closest.y,
        ballX: other.x, ballY: other.y, cueVec
      };
      break;
    }
  }

  if (collision) {
    const { impactX, impactY, cueVec, ballX, ballY } = collision;

    // Show impact zone and cue tracks
    stroke(255, 200, 0);
    strokeWeight(4);
    fill(255, 180, 0, 180);
    ellipse(impactX, impactY, ballDiameter * 0.5);

    stroke(255);
    strokeWeight(3);
    const cue1 = createVector(pos.x, pos.y).add(cueOffset);
    const cue2 = createVector(pos.x, pos.y).sub(cueOffset);
    const impact1 = createVector(impactX, impactY).add(cueOffset);
    const impact2 = createVector(impactX, impactY).sub(cueOffset);
    line(cue1.x, cue1.y, impact1.x, impact1.y);
    line(cue2.x, cue2.y, impact2.x, impact2.y);

    // Simulate ball deflection path
    const deflectionVec = createVector(ballX - impactX, ballY - impactY).normalize().mult(120);
    const deflect1 = createVector(ballX, ballY).add(cueOffset.copy());
    const deflect2 = createVector(ballX, ballY).sub(cueOffset.copy());
    const deflectEnd1 = deflect1.copy().add(deflectionVec);
    const deflectEnd2 = deflect2.copy().add(deflectionVec);

    stroke(255);
    strokeWeight(3);
    line(deflect1.x, deflect1.y, deflectEnd1.x, deflectEnd1.y);
    line(deflect2.x, deflect2.y, deflectEnd2.x, deflectEnd2.y);
  } else {
    // No collision – show extended aiming line
    const cue1 = createVector(pos.x, pos.y).add(cueOffset);
    const cue2 = createVector(pos.x, pos.y).sub(cueOffset);
    const end1 = cue1.copy().add(cueVec.copy().mult(400));
    const end2 = cue2.copy().add(cueVec.copy().mult(400));

    stroke(255, 255, 255, 150);
    strokeWeight(3);
    line(cue1.x, cue1.y, end1.x, end1.y);
    line(cue2.x, cue2.y, end2.x, end2.y);
  }
}

// === Renders top HUD with timer and score ===
function renderScoreDisplay() {
  fill(40, 60, 100, 200);
  noStroke();
  rect(0, 0, width, 60);

  fill(255);
  textAlign(LEFT, TOP);
  textSize(26);

  // Show real-time timer if initialized
  if (gameTimer) {
    gameTimer.render(25, 15);  // full HH:MM:SS display
  } else {
    text("⏱ Time: 00:00:00", 25, 15);
  }

  // Display score on right side
  textAlign(RIGHT, TOP);
  text(getCurrentScore(), width - 30, 15);
}

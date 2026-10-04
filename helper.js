// Handles all ball potted checks and logic (reds, colours, cue)
function checkAndHandlePottedBalls() {
  const pockets = getPocketCenters();
  const redsToRemove = [];
  const coloursToRespot = [];

  const redBalls = ballManager.getRedBalls();
  const colouredBalls = ballManager.getColouredBalls();
  let cueBall = ballManager.getCueBall();
  const colourSpots = ballManager.getColourSpots();

  redBalls.forEach((red, idx) => {
    if (!red || !red.body) return;

    const pos = red.body.position;
    for (const pocket of pockets) {
      if (dist(pos.x, pos.y, pocket.x, pocket.y) < pocketDiameter * 0.55) {
        redsToRemove.push(idx);
        World.remove(world, red.body);
        addPlayerScore(red.pointValue || 1);
        anyBallPottedThisTurn = true;
        soundManager?.play('red');
        displayPottedMsg('Red ball potted! (+1)\nRemoved from play.');
        break;
      }
    }
  });

  // Remove red balls from array
  redsToRemove.sort((a, b) => b - a);
  for (const idx of redsToRemove) {
    if (redBalls[idx]) redBalls.splice(idx, 1);
  }

  colouredBalls.forEach((col, idx) => {
    if (!col || !col.body) return;

    const pos = col.body.position;
    for (const pocket of pockets) {
      if (dist(pos.x, pos.y, pocket.x, pocket.y) < pocketDiameter * 0.55) {
        coloursToRespot.push(idx);
        World.remove(world, col.body);
        addPlayerScore(col.pointValue || 2);
        anyBallPottedThisTurn = true;
        soundManager?.play('color');
        displayPottedMsg('Colour ball potted! (+2)\nWill be re-spotted.');

        if (frameCount - lastPottedColourFrame < 80) {
          consecutiveColourPot = true;
          showCollisionMsg("Two colours potted in a row!");
        }
        lastPottedColourFrame = frameCount;
        break;
      }
    }
  });

  // Re-spot colours
  for (const idx of coloursToRespot) {
    const spot = colourSpots[idx];
    const colDef = colouredBalls[idx]?.color ?? color(200, 200, 200);
    colouredBalls[idx] = ballManager.spawnGameBall(spot[0], spot[1], colDef);
  }

  // Cue ball pocket logic
  cueBall = ballManager.getCueBall();
  if (cueBall?.body) {
    const pos = cueBall.body.position;
    for (const pocket of pockets) {
      if (dist(pos.x, pos.y, pocket.x, pocket.y) < pocketDiameter * 0.55) {
        World.remove(world, cueBall.body);
        soundManager?.play('cue');

        displayPottedMsg('Cue ball potted!\nReplaced in the D zone.');
        showCollisionMsg("Cue ball potted! Placed in D zone.");

        const baulkDist = tableLength * (29 / 144);
        const baulkX = tableMargin + baulkDist;
        const centreY = tableMargin + tableWidth / 2;

        cueBall = ballManager.spawnGameBall(baulkX, centreY, color(255), true);
        ballManager.setCueBall(cueBall);
        placingCueBall = false;
        isAimingShot = true;
        break;
      }
    }
  }

  // Filter invalid balls and update arrays
  const filteredRed = redBalls.filter(b => b?.body);
  const filteredCol = colouredBalls.filter(b => b?.body);
  const filteredCue = cueBall?.body ? [cueBall] : [];

  redBalls.length = 0;
  redBalls.push(...filteredRed);

  colouredBalls.length = 0;
  colouredBalls.push(...filteredCol);

  gameBalls = [...redBalls, ...colouredBalls, ...(cueBall?.body ? [cueBall] : [])];

  ballManager.redBalls = redBalls;
  ballManager.colouredBalls = colouredBalls;
  ballManager.setCueBall(cueBall);
  ballManager.updateGameBalls();
}

// Places cue ball in the D-zone manually by user
function placeCueBallAtDZone() {
  const baulkDist = tableLength * (29 / 144);
  const baulkX = tableMargin + baulkDist;
  const centreY = tableMargin + tableWidth / 2;

  let cueBall = ballManager.getCueBall();
  if (cueBall?.body) {
    World.remove(world, cueBall.body);
  }

  cueBall = ballManager.spawnGameBall(baulkX - 40, centreY, color(255), true);
  ballManager.setCueBall(cueBall);
  ballManager.updateGameBalls();

  placingCueBall = false;
  isAimingShot = true;

  if (!gameTimer.running) {
    gameTimer.start();
  }

  redraw();
}

// Checks if any ball is still moving on the table
function areAnyBallsInMotion() {
  const gameBalls = ballManager.getGameBalls();

  return gameBalls.some(ball => {
    if (!ball?.body) return false;

    const v = ball.body.velocity;

    // Clamp velocity to avoid abnormal speed
    if (Math.abs(v.x) > 7 || Math.abs(v.y) > 7) {
      Body.setVelocity(ball.body, {
        x: constrain(v.x, -7, 7),
        y: constrain(v.y, -7, 7)
      });
    }

    // Clamp position inside table bounds
    const pos = ball.body.position;
    const x = constrain(pos.x, tableMargin + 10, tableMargin + tableLength - 10);
    const y = constrain(pos.y, tableMargin + 10, tableMargin + tableWidth - 10);
    if (x !== pos.x || y !== pos.y) {
      Body.setPosition(ball.body, { x, y });
    }

    return sqrt(v.x * v.x + v.y * v.y) > 0.13;
  });
}

// Displays potted message temporarily
function displayPottedMsg(msg) {
  pottedMsg = msg;
  pottedMsgTimer = 70;
}

// Returns center positions for all 6 pockets
function getPocketCenters() {
  const leftX = tableMargin, rightX = tableMargin + tableLength;
  const topY = tableMargin, botY = tableMargin + tableWidth;
  const midX = tableMargin + tableLength / 2;
  return [
    { x: leftX, y: topY },
    { x: midX, y: topY },
    { x: rightX, y: topY },
    { x: leftX, y: botY },
    { x: midX, y: botY },
    { x: rightX, y: botY }
  ];
}

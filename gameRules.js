function handleFoul(reason) {
  if (gameMode !== "multiplayer") return;
  foulCommitted = true;
  showCollisionMsg("Foul: " + reason);
}

function handleNoBallHit() {
  if (gameMode !== "multiplayer") return;
  handleFoul("No ball hit");
}

function handleWrongBallHit(ballType) {
  if (gameMode !== "multiplayer") return;
  handleFoul("Wrong ball hit (" + ballType + ")");
}

function handleCueBallPotted() {
  if (gameMode !== "multiplayer") return;
  handleFoul("Cue ball potted");
}

function validateFirstHit(contactBody) {
  if (gameMode !== "multiplayer") return;

  if (!contactBody) {
    handleNoBallHit();
    return;
  }

  if (isRedBall(contactBody)) {
    // valid
  } else if (isColourBall(contactBody)) {
    handleWrongBallHit("Colour");
  } else {
    handleNoBallHit();
  }
}

// Cue collision tracking
let cueCollisionDetected = false;
let cueFirstHit = null;

function setupCueContactMonitor() {
  Matter.Events.on(engine, 'collisionStart', function (event) {
    event.pairs.forEach(function (pair) {
      const a = pair.bodyA;
      const b = pair.bodyB;

      if (!cueCollisionDetected && (a.label === 'cue' || b.label === 'cue')) {
        const other = (a.label === 'cue') ? b : a;
        if (isBall(other)) {
          cueCollisionDetected = true;
          cueFirstHit = other;
        }
      }
    });
  });
}

function checkFoulAfterShot() {
  if (gameMode !== "multiplayer") return;

  if (!cueCollisionDetected) {
    handleNoBallHit();
  } else {
    validateFirstHit(cueFirstHit);
  }

  cueCollisionDetected = false;
  cueFirstHit = null;
}

function finalizePlayerTurn() {
  if (gameMode !== "multiplayer") return;

  checkFoulAfterShot();

  if (foulCommitted) {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    showCollisionMsg(`Foul - Player ${currentPlayer}'s Turn`);
  } else if (!anyBallPottedThisTurn) {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    showCollisionMsg(`Player ${currentPlayer}'s Turn`);
  } else {
    showCollisionMsg(`Player ${currentPlayer} continues`);
  }

  foulCommitted = false;
  anyBallPottedThisTurn = false;
}

function resetTurnFlags() {
  foulCommitted = false;
  anyBallPottedThisTurn = false;
  cueCollisionDetected = false;
  cueFirstHit = null;
}

function switchTurnIfNeeded() {
  if (gameMode !== "multiplayer") return;

  saveCurrentGameState();

  if (foulCommitted) {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    showCollisionMsg(`Foul! Player ${currentPlayer}'s Turn`);
  } else if (!anyBallPottedThisTurn) {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    showCollisionMsg(`Missed! Player ${currentPlayer}'s Turn`);
  } else {
    showCollisionMsg(`Player ${currentPlayer} continues`);
  }

  foulCommitted = false;
  anyBallPottedThisTurn = false;
}

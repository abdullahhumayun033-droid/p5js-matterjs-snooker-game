// == Matter.js Aliases ==
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

// == Table & Ball Variables ==
let tableLength = 600 * 2;
let tableWidth = 600;
let tableMargin = 90;
let ballDiameter;
let pocketDiameter;
let anyBallPottedThisTurn = false;

// == Physics ==
let engine, world;
let ballRestitution = 0.85;
let ballFriction = 0.005;

// == Object Instances ==
let ballManager;
let cueStick;
let cushionManager;
let gameTimer;
let soundManager;
let spinControl;
let scoreBoard;
let keyboardControls;
let mouseControls;
let replayManager;

// == Game State ==
let cueBall;
let redBalls = [];
let colouredBalls = [];
let gameBalls = [];

let cueBeingDragged = false;
let dragStart = null;
let mouseCueEnabled = true;
let currentShotStrength = 0;
let isAimingShot = true;
let placingCueBall = true;
let cueAimAngle = 0;
let aimPower = 0.005;
let maxDrag = 180;
let isReplaying = false;
let cueBallPlaced = false;
let shotInitiated = false;

// == Messages ==
let collisionMessage = '';
let collisionMsgTimer = 0;
let pottedMsg = '';
let pottedMsgTimer = 0;

// == Game Mode ==
let ballModes = 1;
let consecutiveColourPot = false;
let lastPottedColourFrame = -1000;

// == Preload Assets ==
function preload() {
  soundManager = new SoundManager();
  soundManager.preload(); // Load sounds before setup
}

// == Game Initialization ==
function setup() {
  ballDiameter = tableWidth / 36;
  pocketDiameter = ballDiameter * 1.5;
  createCanvas(tableLength + 2 * tableMargin, tableWidth + 2 * tableMargin);

  engine = Engine.create();
  world = engine.world;
  world.gravity.y = 0; // Top-down view: no gravity

  // Setup physical cushions and table boundaries
  cushionManager = new CushionManager(world, tableMargin, tableLength, tableWidth, ballDiameter, pocketDiameter);
  cushionManager.create();

  // Setup ball system and initial mode
  ballManager = new BallManager(world, tableMargin, tableLength, tableWidth, pocketDiameter, ballDiameter, ballRestitution, ballFriction);
  ballManager.initializeBalls(ballModes);

  // Collision and cue interactions
  setupCushionCollisionListener();
  setupCueContactMonitor();
  setupGameMode();
  setupGameMenu(); // Menu setup if any

  // Game components
  spinControl = new SpinControl(ballDiameter);
  scoreBoard = new ScoreBoard();
  cueStick = new CueStick(null, ballDiameter, maxDrag);
  gameTimer = new GameTimer();
  gameTimer.stop();
  gameTimer.timeElapsed = 0;

  // Replay system
  replayManager = new ReplayManager(ballManager);

  // Control bindings
  keyboardControls = new KeyboardControls(
    ballManager,
    spinControl,
    () => replayManager.saveLastShotState(gameBalls),
    () => replayManager.replayLastShot()
  );

  mouseControls = new MouseControls(
    ballManager,
    cueStick,
    () => replayManager.saveLastShotState(gameBalls)
  );

  placingCueBall = true;
  isAimingShot = true;

  frameRate(60);
}

// == Main Draw Loop ==
function draw() {
  background(220);
  Engine.update(engine); // Step physics engine

  if (gameTimer.running) gameTimer.update();

  checkAndHandlePottedBalls();

  // Game visuals
  drawGameTable();
  cushionManager.draw();
  drawGameBalls();
  spinControl.render(cueBall, isAimingShot, placingCueBall, gameMode);
  spinControl.drawInstructions(gameMode);
  renderScoreDisplay();

  // Refresh references from ballManager
  cueBall = ballManager.getCueBall();
  gameBalls = ballManager.getGameBalls();
  redBalls = ballManager.getRedBalls();
  colouredBalls = ballManager.getColouredBalls();

  // Cue drawing based on input state
  if (cueBall && !placingCueBall && isAimingShot) {
    let pos = cueBall.body.position;
    if (cueBeingDragged && dragStart) {
      cueStick.draw(dragStart, { x: mouseX, y: mouseY }, true);
    } else if (!mouseCueEnabled) {
      let len = ballDiameter * 3;
      cueStick.draw(pos, {
        x: pos.x + Math.cos(cueAimAngle) * len,
        y: pos.y + Math.sin(cueAimAngle) * len
      }, false);
    } else {
      cueStick.draw(pos, { x: mouseX, y: mouseY }, false);
    }
  }

  drawAimingGuide();
  drawCollisionPrediction();
  drawPlayerTurnInfo();

  // --- Check for end of shot ---
  if (!isAimingShot && !placingCueBall) {
    if (shotInitiated && !areAnyBallsInMotion()) {
      isAimingShot = true;
      isReplaying = false;
      if (replayManager) replayManager.clearReplayFlag();
      finalizePlayerTurn();
      shotInitiated = false;
      resetTurnFlags();
    } else {
      // Clamp velocities to avoid runaways
      ballManager.getGameBalls().forEach(ball => {
        let v = ball.body.velocity;
        const maxSpeed = 16;
        v.x = constrain(v.x, -maxSpeed, maxSpeed);
        v.y = constrain(v.y, -maxSpeed, maxSpeed);
        Body.setVelocity(ball.body, v);
      });
    }
  }

  // Replay message overlay
  if (isReplaying) {
    fill(0, 150, 255, 230);
    textAlign(CENTER, CENTER);
    textSize(40);
    text("Replaying Shot...", width / 2, height - 40);
  }

  // Display collision feedback
  if (collisionMsgTimer > 0) {
    fill(0, 150, 255, 230);
    textAlign(CENTER, CENTER);
    textSize(45);
    text(collisionMessage, width / 2, 120);
    collisionMsgTimer--;
  }

  // Display potted message
  if (pottedMsgTimer > 0) {
    fill(0, 180, 20, 240);
    textAlign(CENTER, CENTER);
    textSize(40);
    text(pottedMsg, width / 2, 200);
    pottedMsgTimer--;
  }

  // Handle end-of-turn again (for delayed updates)
  if (!isAimingShot && !placingCueBall) {
    ballManager.getGameBalls().forEach(ball => {
      let v = ball.body.velocity;
      const maxSpeed = 12;
      v.x = constrain(v.x, -maxSpeed, maxSpeed);
      v.y = constrain(v.y, -maxSpeed, maxSpeed);
      Body.setVelocity(ball.body, v);
    });

    if (shotInitiated && !areAnyBallsInMotion()) {
      isAimingShot = true;
      isReplaying = false;
      if (replayManager) replayManager.clearReplayFlag();
      finalizePlayerTurn();
      shotInitiated = false;
      resetTurnFlags();
    }
  }

  // Draw shot power bar when dragging cue
  if (isAimingShot && !placingCueBall && cueBeingDragged) {
    let barWidth = 180, barHeight = 14;
    let barX = width / 2 - barWidth / 2;
    let barY = height - 50;

    noStroke();
    fill(50, 50, 50, 180);
    rect(barX, barY, barWidth, barHeight, 10);
    fill(255, 120, 20);
    rect(barX, barY, currentShotStrength * barWidth, barHeight, 10);
    stroke(255);
    noFill();
    rect(barX, barY, barWidth, barHeight, 10);
    fill(0);
    textSize(14);
    textAlign(CENTER, BOTTOM);
    text("Shot Power", width / 2, barY - 6);
  }
}

// == Input Handlers ==
function keyPressed() {
  keyboardControls?.keyPressed(key, keyCode);
}

function keyReleased() {
  keyboardControls?.keyReleased(key);
}

function mousePressed() {
  mouseControls?.mousePressed(mouseX, mouseY);
}

function mouseDragged() {
  mouseControls?.mouseDragged(mouseX, mouseY);
}

function mouseMoved() {
  mouseControls?.mouseMoved(mouseX, mouseY);
}

function mouseReleased() {
  mouseControls?.mouseReleased(mouseX, mouseY);
}

// == Highlight Cushion Collision ==
function highlightCushionImpact(cushionBody) {
  const cushion = cushionManager.getCushions().find(c => c.body === cushionBody);
  if (cushion) {
    cushion.color = color(255, 200, 50, 170);
    cushion.flashTimer = 12;
  }
}

/*
=================================================================================
                               Commentary
=================================================================================
This project shall provide an interactive web-based simulation of snooker game. 
which is a balance between technical realism and easy-to-play game. The schematics were done with JavaScript 
with the help of the p5.js and Matter.js libraries, the main aim of the game consists in copying 
real snooker physics, such as ball dynamics and spin, scoring, offenses. 
it provides a smooth and interactive experience to the casual and competitive 
players. The user interface is focused on easiness, responsiveness, and interaction 
visual feedbacks, shortcuts in keyboard and live interaction cues.

The design will focus upon a cue system based on a mouse so as to have precision. 
easy to use, pricing, and usability. Shot may be controlled by moving the cue dragging it 
It has strength and direction, and optional spin control based on the keyboard. This hybrid 
input system supports detailed control of the game content with some control avoiding interface 
clutter. After the player has made the cue ball to rest in the segment marked as D zone, he uses one of the following methods. 
mouse aim or keyboard arrows to move the angle, put spin (by using WASD keys). 
take shots, imitating techniques on the real world

The design of the project is an object oriented architecture, which is clearly structured. 
encourage modularity and sustainability. There are core components which are encapsulated in 
specialized classes: `BallManager` is in charge of the creation of balls and tracking them; 
CueStick, SpinControl and GameTimer handle different gameplay mechanics; 
`ScoreBoard`, `SoundManager` and `ReplayManager` give polish and replay. 
All the user input is abstracted to `KeyboardControls` and `MouseControls`. 
The boundaries that are treated by `CushionManager` are static. Every class is single-responsibility. 
reusable, loosely coupled and easy to debug and futureproof. 
enhancement.
Physics, collision calculations are done using Matter.js which simulates gravity. 
angular forces, velocity and restitution. The transfer of balls and other collisions is 
mirrored with natural reactions, and shot power is converted to force in the form of vectors 
drawing. p5.js is used to take care of everything that is depicted on the screen-balls, aim markers, cue pit. 
drawing, HUD--and mixes well with states of physics. Collision prediction, 
dynamic rendering- as in the case of image of impact deflection and aimed guise. 
projections and made sure that they are visually aligned to physics outcome.

Base functionality is enhanced by a number of custom features. These comprise a complete 
visual indication drag bar power feedback, a keyboard-mapped spin control device, 
and a full replay system so that the prior shot status can be rezied with saved 
ball data. The game stopwatch keeps the time of active time of games and is combined with the HUD. 
There is multi-mode ball initialization, foul state tracking in real-time and responsive 
better immersion is promised by the score display. All these are more extensive than barebones project 
requirements and exhibited realistic and user-oriented improvement.

The issues were making the rendering pipeline of p5.js fit Matter.js 
asynchronous updating especially of precision aiming and spin force 
effects. And the process of state synchronization was greatly fused with the help of centralized flags such as 
placingCueBall, isAimingShot and shotInitiated. Maintaining consistent 
velocity boundary conditions, renewed redrawing logics and processing of off-table ball states. 
boundary checks and constraint logic.

On the whole, the project exhibits a good software design, and a good technical implementation. 
and an interactive refined experience. The system can be extended, tested. 
designed to emulate real snooker in great detail to give a close approximation to playing it. 
control, as well as feedback of the players.
=================================================================================
*/
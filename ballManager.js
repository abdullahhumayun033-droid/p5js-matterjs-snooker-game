// BallManager class handles cue, red, and coloured balls in the snooker game.
class BallManager {
  constructor(world, tableMargin, tableLength, tableWidth, pocketDiameter, ballDiameter, ballRestitution, ballFriction) {
    this.world = world;
    this.tableMargin = tableMargin;
    this.tableLength = tableLength;
    this.tableWidth = tableWidth;
    this.pocketDiameter = pocketDiameter;
    this.ballDiameter = ballDiameter;
    this.ballRestitution = ballRestitution;
    this.ballFriction = ballFriction;

    this.cueBall = null;
    this.redBalls = [];
    this.colouredBalls = [];
    this.colourSpots = [];
    this.gameBalls = [];
  }

  // Initializes balls depending on game mode (1: start, 2: random reds, 3: random all)
  initializeBalls(mode) {
    if (this.cueBall) World.remove(this.world, this.cueBall.body);
    this.redBalls.forEach(b => World.remove(this.world, b.body));
    this.colouredBalls.forEach(b => World.remove(this.world, b.body));

    this.redBalls = [];
    this.colouredBalls = [];
    this.cueBall = null;

    if (mode === 1) {
      this.arrangeRedBalls();
    } else if (mode === 2 || mode === 3) {
      for (let i = 0; i < 15; i++) {
        this.redBalls.push(this.spawnGameBall(
          random(this.tableMargin + this.pocketDiameter * 2, this.tableMargin + this.tableLength - this.pocketDiameter * 2),
          random(this.tableMargin + this.pocketDiameter * 2, this.tableMargin + this.tableWidth - this.pocketDiameter * 2),
          color(200, 20, 20)
        ));
      }
    }

    let colDefs = [
      color(255, 255, 70),   // Yellow
      color(60, 150, 30),    // Green
      color(140, 70, 20),    // Brown
      color(40, 70, 255),    // Blue
      color(255, 80, 160),   // Pink
      color(10, 10, 10)      // Black
    ];

    let centreY = this.tableMargin + this.tableWidth / 2;
    let baulkDist = this.tableLength * (29 / 144);
    let baulkX = this.tableMargin + baulkDist;

    this.colourSpots = [
      [baulkX, centreY + this.ballDiameter * 2],
      [baulkX, centreY - this.ballDiameter * 2],
      [baulkX, centreY],
      [this.tableMargin + this.tableLength / 2, centreY],
      [this.tableMargin + this.tableLength * 0.75 - this.ballDiameter * 2, centreY],
      [this.tableMargin + this.tableLength * 0.875, centreY]
    ];

    if (mode === 3) {
      for (let i = 0; i < 6; i++) {
        let rx = random(this.tableMargin + this.pocketDiameter * 2, this.tableMargin + this.tableLength - this.pocketDiameter * 2);
        let ry = random(this.tableMargin + this.pocketDiameter * 2, this.tableMargin + this.tableWidth - this.pocketDiameter * 2);
        this.colouredBalls.push(this.spawnGameBall(rx, ry, colDefs[i]));
      }
    } else {
      for (let i = 0; i < 6; i++) {
        const ball = this.spawnGameBall(this.colourSpots[i][0], this.colourSpots[i][1], colDefs[i]);
        Body.setStatic(ball.body, false);
        Body.set(ball.body, { isSleeping: false });
        this.colouredBalls.push(ball);
      }
    }

    this.updateGameBalls();
    redraw();
  }

  // Determines ball type from color
  getBallTypeFromColor(c) {
    const r = red(c), g = green(c), b = blue(c);
    if (r === 255 && g === 255 && b === 70) return 'yellow';
    if (r === 60 && g === 150 && b === 30) return 'green';
    if (r === 140 && g === 70 && b === 20) return 'brown';
    if (r === 40 && g === 70 && b === 255) return 'blue';
    if (r === 255 && g === 80 && b === 160) return 'pink';
    if (r === 10 && g === 10 && b === 10) return 'black';
    if (r === 200 && g === 20 && b === 20) return 'red';
    if (r === 255 && g === 255 && b === 255) return 'cue';
    return 'unknown';
  }

  // Creates and returns a game ball instance
  spawnGameBall(x, y, c, isCue = false) {
    const valueMap = {
      'cue': 0,
      'red': 1,
      'yellow': 2,
      'green': 3,
      'brown': 4,
      'blue': 5,
      'pink': 6,
      'black': 7
    };

    let label = isCue ? 'cue' : 'ball';
    let type = isCue ? 'cue' : this.getBallTypeFromColor(c);
    let pointValue = valueMap[type] ?? 0;

    let body = Bodies.circle(x, y, this.ballDiameter / 2, {
      restitution: this.ballRestitution,
      friction: this.ballFriction,
      frictionAir: 0.025,
      label: label,
      inertia: Infinity,
      isStatic: false
    });

    Body.set(body, { isSleeping: false });
    World.add(this.world, body);
    return { body, color: c, isCue, pointValue, type };
  }

  // Arranges 15 red balls in a triangle layout
  arrangeRedBalls() {
    this.redBalls = [];
    let startX = this.tableMargin + this.tableLength * 0.75;
    let startY = this.tableMargin + this.tableWidth / 2;
    let r = this.ballDiameter;
    let n = 0;
    for (let row = 0; row < 5; row++) {
      let x = startX + row * r * Math.cos(PI / 6);
      let y0 = startY - (row * r) / 2;
      for (let i = 0; i <= row; i++) {
        if (n >= 15) break;
        let y = y0 + i * r;
        this.redBalls.push(this.spawnGameBall(x, y, color(200, 20, 20)));
        n++;
      }
    }
  }

  getCueBall() {
    return this.cueBall;
  }

  setCueBall(ball) {
    this.cueBall = ball;
    this.updateGameBalls();
  }

  getRedBalls() {
    return this.redBalls;
  }

  getColouredBalls() {
    return this.colouredBalls;
  }

  getGameBalls() {
    return this.gameBalls;
  }

  getColourSpots() {
    return this.colourSpots;
  }

  // Updates combined list of all active game balls
  updateGameBalls() {
    this.gameBalls = [...this.redBalls, ...this.colouredBalls];
    if (this.cueBall) this.gameBalls.unshift(this.cueBall);
  }
}
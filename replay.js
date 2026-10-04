// ReplayManager stores and restores the last shot state using physics data.
// It allows replaying the previous shot exactly as it was, including velocities and rotations.
class ReplayManager {
  constructor(ballManager) {
    this.ballManager = ballManager; // Reference to central ball manager
    this.lastShotState = null;      // Stores snapshot of the last shot
    this.isReplaying = false;       // Indicates whether a replay is currently active
  }

  // Saves full physical state of all game balls before a shot
  saveLastShotState(gameBalls) {
    this.lastShotState = gameBalls.map(ball => {
      const body = ball.body;
      return {
        x: body.position.x,
        y: body.position.y,
        vx: body.velocity.x,
        vy: body.velocity.y,
        angle: body.angle,
        angularVelocity: body.angularVelocity,
        color: ball.color,
        isCue: ball.isCue
      };
    });
  }

  // Replays the last saved shot by respawning balls and reapplying motion states
  replayLastShot() {
    if (!this.lastShotState) return;

    // Clear current world of balls
    this.ballManager.getGameBalls().forEach(ball => {
      World.remove(world, ball.body);
    });

    // Prepare new state containers
    const cueBalls = [];
    const redBalls = [];
    const colouredBalls = [];

    // Rebuild each ball using saved snapshot data
    const newBalls = this.lastShotState.map(data => {
      const ball = this.ballManager.spawnGameBall(data.x, data.y, data.color, data.isCue);

      // Restore full physics state
      Body.setVelocity(ball.body, { x: data.vx, y: data.vy });
      Body.setAngle(ball.body, data.angle);
      Body.setAngularVelocity(ball.body, data.angularVelocity);
      Body.setPosition(ball.body, { x: data.x, y: data.y });

      return ball;
    });

    // Reclassify balls into cue/red/colour and re-assign them
    newBalls.forEach(ball => {
      if (ball.isCue) {
        this.ballManager.setCueBall(ball);
        cueBall = ball;
        cueAimAngle = 0;         // Reset aim angle after replay
        mouseCueEnabled = true;  // Re-enable mouse cue control
      } else if (ball.color.levels[0] === 200) {
        redBalls.push(ball);     // Reds are detected by R: 200
      } else {
        colouredBalls.push(ball);
      }
    });

    // Update ballManager state
    this.ballManager.redBalls = redBalls;
    this.ballManager.colouredBalls = colouredBalls;
    this.ballManager.updateGameBalls();

    // Reflect updates to global references
    gameBalls = this.ballManager.getGameBalls();
    redBalls = this.ballManager.getRedBalls();
    colouredBalls = this.ballManager.getColouredBalls();

    // Reset global flags
    placingCueBall = false;
    isAimingShot = false;
    this.isReplaying = true;
    loop(); // Resume draw loop
  }

  // Used by external systems to check if a replay is ongoing
  isReplayActive() {
    return this.isReplaying;
  }

  // Manually resets replay state flag
  clearReplayFlag() {
    this.isReplaying = false;
  }
}

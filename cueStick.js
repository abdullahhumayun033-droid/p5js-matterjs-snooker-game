// Sets up collision event listener for cushion and ball interactions
function setupCushionCollisionListener() {
  Matter.Events.on(engine, 'collisionStart', function (event) {
    const pairs = event.pairs;

    pairs.forEach(function (pair) {
      const a = pair.bodyA;
      const b = pair.bodyB;

      const cue = (a.label === 'cue' || b.label === 'cue');
      const ball = (a.label === 'ball' || b.label === 'ball');

      // Cue hits a ball
      if (cue && ball) {
        cueCollisionDetected = true;

        if (!cueFirstHit) {
          cueFirstHit = a.label === 'cue' ? b : a;
        }
      }

      // Ball hits cushion
      if (isBall(a) && b.label === 'cushion') {
        highlightCushionImpact(b);
        soundManager?.bounceSound?.play();
      } else if (isBall(b) && a.label === 'cushion') {
        highlightCushionImpact(a);
        soundManager?.bounceSound?.play();
      }

      // Show collision messages
      if ((a.label === 'cue' && b.label === 'ball' && isRedBall(b)) ||
          (b.label === 'cue' && a.label === 'ball' && isRedBall(a))) {
        showCollisionMsg('Cue hit Red!');
      } else if ((a.label === 'cue' && b.label === 'ball' && isColourBall(b)) ||
                 (b.label === 'cue' && a.label === 'ball' && isColourBall(a))) {
        showCollisionMsg('Cue hit Colour!');
      } else if ((a.label === 'cue' && b.label === 'cushion') ||
                 (b.label === 'cue' && a.label === 'cushion')) {
        showCollisionMsg('Cue hit Cushion!');
      }
    });
  });
}

// Highlights cushion briefly when hit
function highlightCushionImpact(cushionBody) {
  const cushions = cushionManager.getCushions?.();
  if (!cushions) return;

  const cushion = cushions.find(c => c.body === cushionBody);
  if (cushion) {
    cushion.color = color(255, 200, 50, 170);
    cushion.flashTimer = 12;
  }
}

function isRedBall(body) {
  return ballManager.getRedBalls().some(r => r.body === body);
}

function isColourBall(body) {
  return ballManager.getColouredBalls().some(c => c.body === body);
}

function isBall(body) {
  return body?.label === 'cue' || body?.label === 'ball';
}

// Displays collision message on screen
function showCollisionMsg(msg) {
  collisionMessage = msg;
  collisionMsgTimer = 50;
}

// CueStick class handles cue rendering and aiming guidance
class CueStick {
  constructor(cueBall, ballDiameter, maxDrag) {
    this.cueBall = cueBall;
    this.ballDiameter = ballDiameter;
    this.maxDrag = maxDrag;
  }

  updateCueBall(newCueBall) {
    this.cueBall = newCueBall;
  }

  draw(from, to, isDragging) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distStick = sqrt(dx * dx + dy * dy);
    const angle = atan2(dy, dx);

    const stickLen = this.ballDiameter * 3 + (isDragging ? constrain(distStick, 0, this.maxDrag) : 0);
    const stickBack = isDragging ? constrain(distStick, 0, this.maxDrag) : 0;

    push();
    translate(from.x, from.y);
    rotate(angle);

    // Cue stick body
    stroke(240, 200, 140);
    strokeWeight(10);
    line(-stickBack - this.ballDiameter * 2, 0, stickLen, 0);

    // Cue tip
    stroke(70, 40, 20);
    strokeWeight(4);
    line(stickLen - 10, 0, stickLen, 0);
    pop();

    if (!this.cueBall?.body) return;

    // Aiming guide lines
    const cuePos = this.cueBall.body.position;
    const guideLen = 100;
    const aimX = cuePos.x + cos(angle) * guideLen;
    const aimY = cuePos.y + sin(angle) * guideLen;

    stroke(255, 255, 255, 130);
    strokeWeight(1.5);
    line(cuePos.x, cuePos.y, aimX, aimY);

    stroke(255, 255, 255, 80);
    strokeWeight(1);
    line(aimX, aimY, aimX + cos(angle) * 40, aimY + sin(angle) * 40);
  }
}

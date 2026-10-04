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
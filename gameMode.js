// extensions/gameMode.js

let gameMode = "solo";        // 'solo', 'multiplayer'
let currentPlayer = 1;        // 1 or 2
let player1Score = 0;
let player2Score = 0;
let foulCommitted = false;

let gameHistory = [];
let lastGameState = null;

function setupGameMode() {
  const modeSelect = document.getElementById("gameModeSelect");
  if (modeSelect) {
    modeSelect.addEventListener("change", () => {
      gameMode = modeSelect.value;
      currentPlayer = 1;
      player1Score = 0;
      player2Score = 0;

      scoreBoard?.reset?.();
      gameTimer?.reset?.();
gameTimer?.stop?.(); 
      ballManager?.initializeBalls(ballModes);
      placingCueBall = true;
      isAimingShot = true;
      cueBallPlaced = false;

      replayManager?.clearReplayFlag?.();
      foulCommitted = false;
      anyBallPottedThisTurn = false;

      showCollisionMsg(`Mode: ${modeSelect.options[modeSelect.selectedIndex].text}\nPlayer 1 starts`);
    });
  }

window.addEventListener("beforeunload", () => {
  saveLastGameState();
});

  const menuDropdown = document.getElementById("gameMenuDropdown");
  if (menuDropdown) {
    menuDropdown.addEventListener("change", (e) => {
      const value = e.target.value;
      document.getElementById("mode-selector").style.display = (value === "mode") ? "block" : "none";

      switch (value) {
        case "new":
          startNewGame();
          break;
        case "resume":
          resumeLastGame();
          break;
        case "history":
          showGameHistory();
          break;
        case "controls":
          alert("🎯 SPIN CONTROLS:\nW/S: Top/Bottom\nA/D: Left/Right\nSPACE: No spin\n\n🕹️ Use mouse drag to aim.\n🕹️ Use dropdown to start/resume games.");
          break;
      }

      e.target.selectedIndex = 0;
    });
  }
}

function startNewGame() {
saveLastGameState(); // Archive last game before resetting
  gameTimer?.reset?.();
  gameTimer?.stop?.();
  scoreBoard?.reset?.();
  player1Score = 0;
  player2Score = 0;
  ballManager?.initializeBalls(ballModes);
  placingCueBall = true;
  isAimingShot = true;
  cueBallPlaced = false;
  foulCommitted = false;
  anyBallPottedThisTurn = false;
  showCollisionMsg("🎮 New Game Started");
}

function resumeLastGame() {
  if (lastGameState) {
    alert(`Resuming last game:\n${lastGameState.mode}, ${lastGameState.score}`);
    document.getElementById("gameModeSelect").value = lastGameState.mode;
    gameMode = lastGameState.mode;
    currentPlayer = 1;
    scoreBoard?.reset?.();
    gameTimer?.start?.();
  } else {
    alert("No previous game to resume.");
  }
}

function showGameHistory() {
  const div = document.getElementById("lastGameStats");
  div.innerHTML = "<h4>🕓 Last 5 Games:</h4>" + gameHistory.map(g =>
    `<div>🕒 ${g.timestamp} | 🧩 ${g.mode} | 🔢 ${g.score} | ⏱️ ${g.duration}</div>`
  ).join("");
}

function saveCurrentGameState() {
  const state = {
    timestamp: new Date().toLocaleString(),
    mode: gameMode,
    score: getCurrentScore(),
    duration: gameTimer?.getFormattedTime?.()
  };
  gameHistory.unshift(state);
  if (gameHistory.length > 5) gameHistory.pop();
  lastGameState = state;
}

function switchTurnIfNeeded() {
  saveCurrentGameState();

  if (gameMode !== "multiplayer") return;

  if (foulCommitted || !anyBallPottedThisTurn) {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    showCollisionMsg(`Player ${currentPlayer}'s Turn`);
  } else {
    showCollisionMsg(`Player ${currentPlayer} continues`);
  }

  foulCommitted = false;
  anyBallPottedThisTurn = false;
}

function drawPlayerTurnInfo() {
  if (gameMode !== "multiplayer" || !isAimingShot || placingCueBall) return;

  fill(0, 180, 255);
  textAlign(CENTER, CENTER);
  textSize(28);
 // text(`Player ${currentPlayer}'s Turn`, width / 2, 60);
}


function addPlayerScore(points) {
  if (gameMode === "multiplayer") {
    if (currentPlayer === 1) player1Score += points;
    else player2Score += points;
  } else {
    scoreBoard.add(points);
  }
  anyBallPottedThisTurn = true;
}

function addFoulPoints(points = 4) {
  if (gameMode === "multiplayer") {
    if (currentPlayer === 1) player2Score += points;
    else player1Score += points;
  }
  foulCommitted = true;
}

function getCurrentScore() {
  if (gameMode === "multiplayer") {
    return `P1: ${player1Score} | P2: ${player2Score}`;
  } else {
    return `Score: ${scoreBoard.get()}`;
  }
}

function setupGameMenu() {
  const newGameBtn = document.getElementById("newGameBtn");
  if (newGameBtn) {
    newGameBtn.addEventListener("click", () => {
      saveLastGameState();  // optional: archive last game
      startNewGame();
    });
  }

  const controlsBtn = document.getElementById("gameControlsBtn");
  if (controlsBtn) {
      
    controlsBtn.addEventListener("click", () => {
      alert("🎯 Spin Controls:\nW = Top\nS = Bottom\nA = Left\nD = Right\nSpace = Reset Spin");
    });
  }

  const resumeBtn = document.getElementById("resumeGameBtn");
  if (resumeBtn) {
    resumeBtn.addEventListener("click", () => {
      loadLastGameState();
    });
  }
}
function saveLastGameState() {
  lastGameState = {
    timestamp: new Date().toLocaleString(),
    mode: gameMode,
    duration: gameTimer?.getFormattedTime?.() || "00:00",
    score: getCurrentScore(),
    scoreState: {
      p1: player1Score,
      p2: player2Score,
      solo: scoreBoard?.get?.() || 0
    }
  };

  // Store to localStorage
  localStorage.setItem("lastGameState", JSON.stringify(lastGameState));

  // Add to history
  gameHistory.unshift(lastGameState);
  if (gameHistory.length > 5) gameHistory.pop();
  localStorage.setItem("gameHistory", JSON.stringify(gameHistory));
}

function loadLastGameState() {
  // Attempt to load from localStorage if not already loaded
  if (!lastGameState) {
    const stored = localStorage.getItem("lastGameState");
    if (stored) lastGameState = JSON.parse(stored);
  }

  if (!lastGameState) {
    alert("No saved game to resume.");
    return;
  }

  gameMode = lastGameState.mode;
  document.getElementById("gameModeSelect").value = gameMode;

  player1Score = lastGameState.scoreState?.p1 || 0;
  player2Score = lastGameState.scoreState?.p2 || 0;

  if (gameMode === "solo") {
    scoreBoard?.reset?.();
    if (scoreBoard?.set) {
      scoreBoard.set(lastGameState.scoreState?.solo || 0);
    }
  } else {
    scoreBoard?.reset?.(); // multiplayer score is stored in player1Score/player2Score
  }

  currentPlayer = 1;
  placingCueBall = true;
  isAimingShot = true;
  cueBallPlaced = false;

  gameTimer?.reset?.();
  gameTimer?.start?.();
  ballManager?.initializeBalls(ballModes);

  showCollisionMsg(`⏪ Resumed ${gameMode.toUpperCase()} Game`);
}


function resumeLastGame() {
  loadLastGameState();
}

function showGameHistory() {
  const div = document.getElementById("lastGameStats");

  // Reload from storage if needed
  const stored = localStorage.getItem("gameHistory");
  if (stored) gameHistory = JSON.parse(stored);

  if (!gameHistory.length) {
    div.innerHTML = "<p>No game history available.</p>";
    return;
  }

  div.innerHTML =
    "<h4>🕓 Last 5 Games:</h4>" +
    gameHistory
      .map((g, i) => {
        const safeDuration =
          typeof g.duration === "string" && g.duration.trim() !== "" && g.duration !== "00:00"
            ? g.duration
            : "--:--";
        return `<div><b>Game ${i + 1}:</b> 🕒 ${g.timestamp} | 🧩 ${g.mode.toUpperCase()} | 🔢 ${g.score} | ⏱️ ${safeDuration}</div>`;
      })
      .join("");
}


// On page load, preload last state
window.addEventListener("DOMContentLoaded", () => {
  const storedLast = localStorage.getItem("lastGameState");
  if (storedLast) lastGameState = JSON.parse(storedLast);

  const storedHistory = localStorage.getItem("gameHistory");
  if (storedHistory) gameHistory = JSON.parse(storedHistory);
});
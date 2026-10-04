// ScoreBoard handles the player's score logic and rendering on the screen.
class ScoreBoard {
  constructor() {
    this.score = 0; // Current player score
  }

  // Increments score by a given number of points
  add(points) {
    this.score += points;
  }

  // Returns the current score value
  get() {
    return this.score;
  }

  // Resets the score to 0
  reset() {
    this.score = 0;
  }

  // Sets the score to a specific value (defaults to 0 if input is null/undefined)
  set(score) {
    this.score = score ?? 0;
  }

  // Renders the score visually on the screen at position (x, y)
  render(x, y) {
    fill(20);
    textSize(22);
    textAlign(LEFT);
    text(`Score: ${this.score}`, x, y);
  }
}

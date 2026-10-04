// === GameTimer Class ===
// Tracks and displays elapsed time for a snooker frame (supports pause/resume)
class GameTimer {
  constructor() {
    this.startTime = 0;      // Time when timer started (millis)
    this.timeElapsed = 0;    // Elapsed time in seconds
    this.running = false;    // Is timer currently active
  }

  // Starts the timer if not already running
  start() {
    if (this.running) return;  // Prevents accidental double-starts
    this.startTime = millis();
    this.running = true;
  }

  // Stops the timer (pauses)
  stop() {
    this.running = false;
  }

  // Resets the timer and zeroes the clock
  reset() {
    this.startTime = millis();
    this.timeElapsed = 0;
  }

  // Updates the timer value based on current time
  update() {
    if (!this.running) return;
    this.timeElapsed = floor((millis() - this.startTime) / 1000);
  }

  // Returns total elapsed time in seconds
  getElapsed() {
    return this.timeElapsed;
  }

  // Renders timer on screen at (x, y) in HH:MM:SS format
  render(x, y) {
    const seconds = this.timeElapsed % 60;
    const minutes = Math.floor(this.timeElapsed / 60) % 60;
    const hours = Math.floor(this.timeElapsed / 3600);

    const pad = (n) => n.toString().padStart(2, '0');
    const timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    fill(20);
    textSize(20);
    textAlign(LEFT);
    text(`⏱ Time: ${timeString}`, x, y);
  }

  // Returns time in MM:SS format (for compact display)
  getFormattedTime() {
    const seconds = this.timeElapsed % 60;
    const minutes = Math.floor(this.timeElapsed / 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

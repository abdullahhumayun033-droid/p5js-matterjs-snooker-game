// Manages game sound effects for potting and collisions
class SoundManager {
  constructor() {
    // Sound effect references for each event type
    this.potRedSound = null;
    this.potColorSound = null;
    this.potCueSound = null;
    this.bounceSound = null;
  }

  // Preload all audio assets using p5.js sound API
  preload() {
    soundFormats('wav', 'ogg'); // Supported formats fallback

    this.potRedSound = loadSound('potRed.wav', null, () => console.warn("Failed to load potRed.wav"));
    this.potColorSound = loadSound('potColor.wav', null, () => console.warn("Failed to load potColor.wav"));
    this.potCueSound = loadSound('potCue.wav', null, () => console.warn("Failed to load potCue.wav"));
    this.bounceSound = loadSound('bounce.ogg', null, () => console.warn("Failed to load bounce.ogg"));
  }

  // Safely plays sound only if it's fully loaded
  playIfLoaded(sound) {
    if (sound && sound.isLoaded()) {
      sound.play();
    }
  }

  // Public method to trigger a specific sound effect by keyword
  play(type) {
    switch (type) {
      case 'red': this.playIfLoaded(this.potRedSound); break;
      case 'color': this.playIfLoaded(this.potColorSound); break;
      case 'cue': this.playIfLoaded(this.potCueSound); break;
      case 'bounce': this.playIfLoaded(this.bounceSound); break;
    }
  }
}

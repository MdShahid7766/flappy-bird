/**
 * Flappy Bird Classic
 * Pure HTML5 Canvas + Web Audio API synthesizer
 */

// --- Audio Synthesizer (No external files needed) ---
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playFlap() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.09);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playScore() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(784, now); // G5
      osc1.frequency.setValueAtTime(1046.5, now + 0.08); // C6

      osc2.frequency.setValueAtTime(1174.66, now); // D6
      osc2.frequency.setValueAtTime(1567.98, now + 0.08); // G6

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } catch (e) {}
  }

  playHit() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playDie() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.28);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playSwoosh() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }
}

// --- Main Game Setup ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const soundBtn = document.getElementById('sound-btn');
const soundIcon = document.getElementById('sound-icon');
const pauseBtn = document.getElementById('pause-btn');
const pauseIcon = document.getElementById('pause-icon');

const sound = new SoundSystem();

const CANVAS_WIDTH = 380;
const CANVAS_HEIGHT = 600;
const GROUND_Y = 515;
const GROUND_HEIGHT = CANVAS_HEIGHT - GROUND_Y;

const STATES = {
  START: 'start',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over'
};

let gameState = STATES.START;
let score = 0;
let highScore = parseInt(localStorage.getItem('flappy_high_score') || '0', 10);
let isNewHighScore = false;
let frames = 0;
let screenShake = 0;
let flashAlpha = 0;

// Particle system
let particles = [];

function spawnFlapParticles(x, y) {
  for (let i = 0; i < 4; i++) {
    particles.push({
      x: x - 12 + (Math.random() * 4 - 2),
      y: y + (Math.random() * 8 - 4),
      vx: -(Math.random() * 2 + 1),
      vy: Math.random() * 2 - 1,
      radius: Math.random() * 3 + 2,
      alpha: 0.8,
      decay: 0.04,
      color: '#ffffff'
    });
  }
}

function spawnScoreParticles(x, y) {
  const colors = ['#fde047', '#f59e0b', '#ffffff', '#38bdf8'];
  for (let i = 0; i < 16; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1.5;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.random() * 3 + 2,
      alpha: 1,
      decay: 0.03,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}

// --- Game Objects ---

// The Bird
const bird = {
  x: 85,
  y: 260,
  radius: 14,
  vy: 0,
  gravity: 0.3,
  flapForce: -6.4,
  maxFallSpeed: 9.0,
  rotation: 0,
  wingPhase: 0,

  reset() {
    this.x = 85;
    this.y = 260;
    this.vy = 0;
    this.rotation = 0;
    this.wingPhase = 0;
  },

  flap() {
    this.vy = this.flapForce;
    sound.playFlap();
    spawnFlapParticles(this.x, this.y);
  },

  update() {
    if (gameState === STATES.START) {
      // Gentle bobbing motion
      this.y = 260 + Math.sin(frames * 0.07) * 7;
      this.rotation = 0;
      this.wingPhase = Math.floor((frames / 6) % 3);
      return;
    }

    if (gameState === STATES.PLAYING || gameState === STATES.GAME_OVER) {
      this.vy += this.gravity;
      if (this.vy > this.maxFallSpeed) {
        this.vy = this.maxFallSpeed;
      }
      this.y += this.vy;

      // Rotation calculation
      if (this.vy < 0) {
        this.rotation = Math.max(-0.45, this.vy * 0.07);
      } else {
        this.rotation = Math.min(1.35, this.rotation + 0.06);
      }

      // Wing flapping speed depends on movement
      if (this.vy < 0) {
        this.wingPhase = Math.floor((frames / 4) % 3);
      } else if (this.rotation < 0.8) {
        this.wingPhase = Math.floor((frames / 8) % 3);
      } else {
        this.wingPhase = 1; // glide position when nosediving
      }

      // Ceiling collision
      if (this.y - this.radius < 0) {
        this.y = this.radius;
        this.vy = 0;
      }

      // Ground collision
      if (this.y + this.radius >= GROUND_Y) {
        this.y = GROUND_Y - this.radius;
        if (gameState === STATES.PLAYING) {
          triggerGameOver(true);
        }
      }
    }
  },

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Bird body dimensions
    const bodyW = 32;
    const bodyH = 24;

    // Body shadow/outline
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyW / 2 + 1.5, bodyH / 2 + 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main yellow body
    const bodyGrad = ctx.createLinearGradient(0, -bodyH / 2, 0, bodyH / 2);
    bodyGrad.addColorStop(0, '#fde047');
    bodyGrad.addColorStop(1, '#eab308');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyW / 2, bodyH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // White belly
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(-3, 4, bodyW / 3, bodyH / 3.2, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Cheek blush
    ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.beginPath();
    ctx.arc(4, 3, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    // Eye white
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(6, -4, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    // Pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Pupil highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(7.5, -5.5, 1, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(10, -2);
    ctx.lineTo(20, 2);
    ctx.lineTo(10, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Beak middle line
    ctx.beginPath();
    ctx.moveTo(10, 2);
    ctx.lineTo(18, 2);
    ctx.strokeStyle = '#7c2d12';
    ctx.stroke();

    // Wing
    ctx.save();
    let wingY = 0;
    let wingAngle = 0;
    if (this.wingPhase === 0) {
      wingY = -5;
      wingAngle = -0.3;
    } else if (this.wingPhase === 1) {
      wingY = 0;
      wingAngle = 0;
    } else {
      wingY = 4;
      wingAngle = 0.35;
    }

    ctx.translate(-7, wingY);
    ctx.rotate(wingAngle);

    // Wing shadow
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing main
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing highlight
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(-1, -1, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }
};

// --- Pipes System ---
const pipes = {
  items: [],
  width: 60,
  gap: 130,
  speed: 2.2,
  spawnInterval: 105, // frames between spawns

  reset() {
    this.items = [];
  },

  spawn() {
    const minTop = 60;
    const maxTop = GROUND_Y - this.gap - 70;
    const topHeight = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;

    this.items.push({
      x: CANVAS_WIDTH,
      topHeight: topHeight,
      bottomY: topHeight + this.gap,
      passed: false
    });
  },

  update() {
    if (gameState !== STATES.PLAYING) return;

    if (frames % this.spawnInterval === 0) {
      this.spawn();
    }

    for (let i = 0; i < this.items.length; i++) {
      const p = this.items[i];
      p.x -= this.speed;

      // Score check
      if (!p.passed && p.x + this.width < bird.x) {
        p.passed = true;
        score++;
        sound.playScore();
        spawnScoreParticles(bird.x + 10, bird.y);
      }

      // Check collision
      if (checkPipeCollision(bird, p)) {
        triggerGameOver(false);
        break;
      }
    }

    // Remove offscreen pipes
    this.items = this.items.filter(p => p.x + this.width > -10);
  },

  drawPipe(x, y, width, height, isTop) {
    if (height <= 0) return;

    ctx.save();

    // Pipe body gradient
    const pipeGrad = ctx.createLinearGradient(x, 0, x + width, 0);
    pipeGrad.addColorStop(0, '#73bf2e');
    pipeGrad.addColorStop(0.18, '#9de64e');
    pipeGrad.addColorStop(0.45, '#55a022');
    pipeGrad.addColorStop(0.85, '#3b7816');
    pipeGrad.addColorStop(1, '#25500e');

    // Draw main shaft
    ctx.fillStyle = pipeGrad;
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = '#1a3c08';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x, y, width, height);

    // Rim / Cap dimensions
    const capHeight = 24;
    const capOverhang = 4;
    const capX = x - capOverhang;
    const capWidth = width + capOverhang * 2;
    const capY = isTop ? y + height - capHeight : y;

    // Rim gradient
    const capGrad = ctx.createLinearGradient(capX, 0, capX + capWidth, 0);
    capGrad.addColorStop(0, '#86d836');
    capGrad.addColorStop(0.2, '#b2f36d');
    capGrad.addColorStop(0.5, '#55a022');
    capGrad.addColorStop(0.85, '#3b7816');
    capGrad.addColorStop(1, '#1e440b');

    ctx.fillStyle = capGrad;
    ctx.fillRect(capX, capY, capWidth, capHeight);
    ctx.strokeStyle = '#1a3c08';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(capX, capY, capWidth, capHeight);

    // Inside shadow on cap
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    if (isTop) {
      ctx.fillRect(capX + 2, capY + capHeight - 4, capWidth - 4, 3);
    } else {
      ctx.fillRect(capX + 2, capY + 1, capWidth - 4, 3);
    }

    ctx.restore();
  },

  draw() {
    for (const p of this.items) {
      // Top pipe
      this.drawPipe(p.x, 0, this.width, p.topHeight, true);
      // Bottom pipe
      const bottomHeight = GROUND_Y - p.bottomY;
      this.drawPipe(p.x, p.bottomY, this.width, bottomHeight, false);
    }
  }
};

// --- Scenery & Background ---
const background = {
  clouds: [
    { x: 30, y: 70, scale: 1.1, speed: 0.3 },
    { x: 190, y: 120, scale: 0.8, speed: 0.22 },
    { x: 320, y: 50, scale: 1.3, speed: 0.35 }
  ],
  skylineOffset: 0,
  groundOffset: 0,

  update() {
    if (gameState === STATES.PAUSED) return;

    const scrollSpeed = (gameState === STATES.GAME_OVER) ? 0 : pipes.speed;

    // Ground scroll
    this.groundOffset = (this.groundOffset + scrollSpeed) % 24;

    // Skyline scroll
    this.skylineOffset = (this.skylineOffset + scrollSpeed * 0.35) % 120;

    // Clouds scroll
    for (const cloud of this.clouds) {
      cloud.x -= (gameState === STATES.GAME_OVER ? cloud.speed * 0.3 : cloud.speed);
      if (cloud.x < -100) {
        cloud.x = CANVAS_WIDTH + Math.random() * 50;
        cloud.y = 30 + Math.random() * 120;
      }
    }
  },

  drawCloud(x, y, s) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(x, y, 16 * s, 0, Math.PI * 2);
    ctx.arc(x + 14 * s, y - 6 * s, 20 * s, 0, Math.PI * 2);
    ctx.arc(x + 32 * s, y - 2 * s, 17 * s, 0, Math.PI * 2);
    ctx.arc(x + 44 * s, y + 4 * s, 12 * s, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },

  drawCitySkyline() {
    ctx.save();
    const baseY = GROUND_Y;
    ctx.fillStyle = '#65c4be';

    // Distant buildings
    const step = 40;
    const startX = - (this.skylineOffset % step);

    for (let x = startX - 40; x < CANVAS_WIDTH + 60; x += step) {
      const pseudoRand = Math.sin((x + this.skylineOffset) * 0.05);
      const bHeight = 45 + Math.abs(pseudoRand) * 65;
      ctx.fillRect(x, baseY - bHeight, step - 6, bHeight);

      // Windows
      ctx.fillStyle = '#8ce0da';
      for (let wy = baseY - bHeight + 8; wy < baseY - 12; wy += 14) {
        ctx.fillRect(x + 6, wy, 6, 6);
        ctx.fillRect(x + 18, wy, 6, 6);
      }
      ctx.fillStyle = '#65c4be';
    }

    ctx.restore();
  },

  draw() {
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(0.65, '#7dd3fc');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

    // Clouds
    for (const cloud of this.clouds) {
      this.drawCloud(cloud.x, cloud.y, cloud.scale);
    }

    // Skyline
    this.drawCitySkyline();

    // Distant trees/bushes
    ctx.fillStyle = '#4ade80';
    for (let bx = -20; bx < CANVAS_WIDTH + 40; bx += 48) {
      ctx.beginPath();
      ctx.arc(bx, GROUND_Y, 26, Math.PI, 0);
      ctx.fill();
    }

    // Ground
    // Grass top band
    ctx.fillStyle = '#5eead4';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 4);

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(0, GROUND_Y + 4, CANVAS_WIDTH, 14);

    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, GROUND_Y + 18, CANVAS_WIDTH, 4);

    // Dirt base
    const dirtGrad = ctx.createLinearGradient(0, GROUND_Y + 22, 0, CANVAS_HEIGHT);
    dirtGrad.addColorStop(0, '#d97706');
    dirtGrad.addColorStop(1, '#92400e');
    ctx.fillStyle = dirtGrad;
    ctx.fillRect(0, GROUND_Y + 22, CANVAS_WIDTH, CANVAS_HEIGHT - (GROUND_Y + 22));

    // Dirt stripe texture
    ctx.fillStyle = '#b45309';
    const stripeWidth = 14;
    const startX = -this.groundOffset;
    for (let x = startX - 20; x < CANVAS_WIDTH + 20; x += stripeWidth * 2) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y + 22);
      ctx.lineTo(x + 10, GROUND_Y + 22);
      ctx.lineTo(x - 14, CANVAS_HEIGHT);
      ctx.lineTo(x - 24, CANVAS_HEIGHT);
      ctx.closePath();
      ctx.fill();
    }
  }
};

// --- Particles update & render ---
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// --- Collision Logic ---
function checkPipeCollision(b, p) {
  // Relaxed bird hitbox for fair gameplay
  const hitboxPadding = 3.5;
  const bx = b.x;
  const by = b.y;
  const br = b.radius - hitboxPadding;

  // Pipe horizontal bounds
  const pipeLeft = p.x;
  const pipeRight = p.x + pipes.width;

  // Only check if bird is within horizontal span
  if (bx + br > pipeLeft && bx - br < pipeRight) {
    // Check top pipe collision
    if (by - br < p.topHeight) {
      return true;
    }
    // Check bottom pipe collision
    if (by + br > p.bottomY) {
      return true;
    }
  }

  return false;
}

// --- Game State Handlers ---
function triggerGameOver(hitGround) {
  if (gameState === STATES.GAME_OVER) return;

  gameState = STATES.GAME_OVER;
  screenShake = 14;
  flashAlpha = 0.85;

  sound.playHit();
  if (!hitGround) {
    setTimeout(() => sound.playDie(), 160);
  }

  // Update high score
  if (score > highScore) {
    highScore = score;
    isNewHighScore = true;
    localStorage.setItem('flappy_high_score', highScore.toString());
  } else {
    isNewHighScore = false;
  }
}

function resetGame() {
  bird.reset();
  pipes.reset();
  particles = [];
  score = 0;
  isNewHighScore = false;
  screenShake = 0;
  flashAlpha = 0;
  gameState = STATES.PLAYING;
  bird.flap();
}

function togglePause() {
  if (gameState === STATES.PLAYING) {
    gameState = STATES.PAUSED;
    pauseIcon.textContent = '▶️';
    pauseBtn.title = 'Resume Game';
  } else if (gameState === STATES.PAUSED) {
    gameState = STATES.PLAYING;
    pauseIcon.textContent = '⏸️';
    pauseBtn.title = 'Pause Game';
  }
}

// Restart button hit area
const restartBtnArea = {
  x: CANVAS_WIDTH / 2 - 65,
  y: 395,
  w: 130,
  h: 42
};

function handleAction() {
  sound.init();

  if (gameState === STATES.START) {
    gameState = STATES.PLAYING;
    bird.flap();
  } else if (gameState === STATES.PLAYING) {
    bird.flap();
  } else if (gameState === STATES.PAUSED) {
    togglePause();
  } else if (gameState === STATES.GAME_OVER) {
    // Wait until bird hits ground before allowing quick restart
    if (bird.y + bird.radius >= GROUND_Y - 2) {
      resetGame();
    }
  }
}

// --- UI Overlays & Rendering ---
function drawStartScreen() {
  ctx.save();
  ctx.textAlign = 'center';

  // Flappy Bird Title Banner
  ctx.fillStyle = '#facc15';
  ctx.font = '22px "Press Start 2P", monospace';
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#854d0e';
  ctx.strokeText('FLAPPY BIRD', CANVAS_WIDTH / 2, 170);
  ctx.fillText('FLAPPY BIRD', CANVAS_WIDTH / 2, 170);

  // Instructional card
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  roundRect(ctx, CANVAS_WIDTH / 2 - 130, 320, 260, 110, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  roundRect(ctx, CANVAS_WIDTH / 2 - 130, 320, 260, 110, 12);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.fillText('READY TO FLY?', CANVAS_WIDTH / 2, 350);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '9px "Press Start 2P", monospace';
  const tapBounce = Math.sin(frames * 0.1) * 3;
  ctx.fillText('TAP OR PRESS SPACE', CANVAS_WIDTH / 2, 385 + tapBounce);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillText('BEST SCORE: ' + highScore, CANVAS_WIDTH / 2, 412);

  ctx.restore();
}

function drawPlayingScore() {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '32px "Press Start 2P", monospace';

  // Text shadow/outline
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#000000';
  ctx.strokeText(score.toString(), CANVAS_WIDTH / 2, 80);

  ctx.fillStyle = '#ffffff';
  ctx.fillText(score.toString(), CANVAS_WIDTH / 2, 80);
  ctx.restore();
}

function drawPauseScreen() {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#facc15';
  ctx.font = '22px "Press Start 2P", monospace';
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#854d0e';
  ctx.strokeText('PAUSED', CANVAS_WIDTH / 2, 280);
  ctx.fillText('PAUSED', CANVAS_WIDTH / 2, 280);

  ctx.fillStyle = '#ffffff';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.fillText('PRESS P TO RESUME', CANVAS_WIDTH / 2, 325);
  ctx.restore();
}

function drawGameOverScreen() {
  ctx.save();
  ctx.textAlign = 'center';

  // Game Over Title
  ctx.fillStyle = '#ef4444';
  ctx.font = '22px "Press Start 2P", monospace';
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#7f1d1d';
  ctx.strokeText('GAME OVER', CANVAS_WIDTH / 2, 175);
  ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, 175);

  // Scoreboard Card
  const cardX = CANVAS_WIDTH / 2 - 135;
  const cardY = 210;
  const cardW = 270;
  const cardH = 160;

  // Board background
  ctx.fillStyle = '#fef08a';
  roundRect(ctx, cardX, cardY, cardW, cardH, 12);
  ctx.fill();

  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 4;
  roundRect(ctx, cardX, cardY, cardW, cardH, 12);
  ctx.stroke();

  // Inner border
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 2;
  roundRect(ctx, cardX + 6, cardY + 6, cardW - 12, cardH - 12, 8);
  ctx.stroke();

  // Medal Slot
  ctx.fillStyle = '#ca8a04';
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('MEDAL', cardX + 22, cardY + 36);

  // Draw Medal circle
  const medalCenterX = cardX + 50;
  const medalCenterY = cardY + 84;
  const medalRadius = 24;

  ctx.beginPath();
  ctx.arc(medalCenterX, medalCenterY, medalRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#b45309';
  ctx.fill();

  let medalColor = null;
  let medalInner = null;
  let medalSymbol = '';

  if (score >= 40) {
    medalColor = '#38bdf8'; // Platinum
    medalInner = '#e0f2fe';
    medalSymbol = '★';
  } else if (score >= 30) {
    medalColor = '#facc15'; // Gold
    medalInner = '#fef08a';
    medalSymbol = '★';
  } else if (score >= 20) {
    medalColor = '#94a3b8'; // Silver
    medalInner = '#e2e8f0';
    medalSymbol = '★';
  } else if (score >= 10) {
    medalColor = '#d97706'; // Bronze
    medalInner = '#fde68a';
    medalSymbol = '★';
  }

  if (medalColor) {
    ctx.beginPath();
    ctx.arc(medalCenterX, medalCenterY, medalRadius - 2, 0, Math.PI * 2);
    ctx.fillStyle = medalColor;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(medalCenterX, medalCenterY, medalRadius - 6, 0, Math.PI * 2);
    ctx.fillStyle = medalInner;
    ctx.fill();

    ctx.fillStyle = medalColor;
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(medalSymbol, medalCenterX, medalCenterY + 5);
  } else {
    // Empty badge
    ctx.beginPath();
    ctx.arc(medalCenterX, medalCenterY, medalRadius - 2, 0, Math.PI * 2);
    ctx.fillStyle = '#a16207';
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('—', medalCenterX, medalCenterY + 4);
  }

  // Score Labels & Values
  ctx.textAlign = 'right';
  ctx.fillStyle = '#b45309';
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.fillText('SCORE', cardX + cardW - 20, cardY + 36);

  ctx.fillStyle = '#0f172a';
  ctx.font = '15px "Press Start 2P", monospace';
  ctx.fillText(score.toString(), cardX + cardW - 20, cardY + 62);

  ctx.fillStyle = '#b45309';
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.fillText('BEST', cardX + cardW - 20, cardY + 95);

  ctx.fillStyle = '#0f172a';
  ctx.font = '15px "Press Start 2P", monospace';
  ctx.fillText(highScore.toString(), cardX + cardW - 20, cardY + 120);

  // New High Score Badge
  if (isNewHighScore && score > 0) {
    ctx.save();
    ctx.fillStyle = '#ef4444';
    roundRect(ctx, cardX + cardW - 74, cardY + 77, 50, 16, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NEW!', cardX + cardW - 49, cardY + 89);
    ctx.restore();
  }

  // Play Again Button
  const btn = restartBtnArea;
  const isHover = false;
  ctx.fillStyle = '#22c55e';
  roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 8);
  ctx.fill();

  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 3;
  roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 8);
  ctx.stroke();

  // 3D button bevel highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  roundRect(ctx, btn.x + 3, btn.y + 3, btn.w - 6, 8, 4);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '11px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowOffsetY = 2;
  ctx.fillText('RESTART', btn.x + btn.w / 2, btn.y + 26);
  ctx.shadowColor = 'transparent';

  // Subtext
  ctx.fillStyle = '#ffffff';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillText('OR PRESS SPACE', CANVAS_WIDTH / 2, 465);

  ctx.restore();
}

// Helper: Rounded rectangle
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// --- Main Game Loop ---
function loop() {
  frames++;

  // Screen shake handling
  ctx.save();
  if (screenShake > 0) {
    const shakeX = (Math.random() * 2 - 1) * screenShake;
    const shakeY = (Math.random() * 2 - 1) * screenShake;
    ctx.translate(shakeX, shakeY);
    screenShake *= 0.85;
    if (screenShake < 0.5) screenShake = 0;
  }

  // Update
  if (gameState !== STATES.PAUSED) {
    background.update();
    bird.update();
    pipes.update();
    updateParticles();
  }

  // Render Scene
  background.draw();
  pipes.draw();
  bird.draw();
  drawParticles();

  // Render Overlays
  if (gameState === STATES.START) {
    drawStartScreen();
  } else if (gameState === STATES.PLAYING) {
    drawPlayingScore();
  } else if (gameState === STATES.PAUSED) {
    drawPlayingScore();
    drawPauseScreen();
  } else if (gameState === STATES.GAME_OVER) {
    drawGameOverScreen();
  }

  // White flash on collision
  if (flashAlpha > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
    flashAlpha -= 0.07;
  }

  ctx.restore();

  requestAnimationFrame(loop);
}

// --- Event Listeners ---
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
    e.preventDefault();
    handleAction();
  } else if (e.code === 'KeyP') {
    e.preventDefault();
    sound.init();
    togglePause();
  } else if (e.code === 'KeyM') {
    e.preventDefault();
    toggleMute();
  }
});

// Canvas Click / Tap
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const clickX = (e.clientX - rect.left) * scaleX;
  const clickY = (e.clientY - rect.top) * scaleY;

  if (gameState === STATES.GAME_OVER) {
    const btn = restartBtnArea;
    if (
      clickX >= btn.x &&
      clickX <= btn.x + btn.w &&
      clickY >= btn.y &&
      clickY <= btn.y + btn.h
    ) {
      sound.init();
      resetGame();
      return;
    }
  }

  handleAction();
});

// Sound Toggle
function toggleMute() {
  sound.init();
  sound.muted = !sound.muted;
  soundIcon.textContent = sound.muted ? '🔇' : '🔊';
  soundBtn.title = sound.muted ? 'Unmute Sound' : 'Mute Sound';
}

soundBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleMute();
});

pauseBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  sound.init();
  togglePause();
});

// Start loop
requestAnimationFrame(loop);

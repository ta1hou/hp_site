const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const COLOR_PALETTE = {
  red:    ['#ff3232', '#ff6464', '#ff9696'],
  green:  ['#32ff32', '#64ff64', '#96ff96'],
  blue:   ['#3232ff', '#6464ff', '#9696ff'],
  yellow: ['#ffff32', '#ffff64', '#ffff96'],
  purple: ['#ff32ff', '#ff64ff', '#ff96ff'],
  cyan:   ['#32ffff', '#64ffff', '#96ffff']
};

class Firework {
  constructor(x = null, y = null) {
    this.x = Math.random() * (canvas.width - 100) + 50;
    this.y = canvas.height;
    this.targetX = x !== null ? x : canvas.width / 2 + (Math.random() - 0.5) * canvas.width / 2;
    this.targetY = y !== null ? y : canvas.height / 3 + Math.random() * canvas.height / 6;
    this.speed = this.getRandomSpeed();
    const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.colorName = Object.keys(COLOR_PALETTE)[Math.floor(Math.random() * 6)];
    this.color = this.getColor();
    this.trail = [];
    this.particles = [];
    this.exploded = false;
    this.curveFactor = Math.random() * 1 - 0.5;
    this.time = 0;
  }

  getRandomSpeed() {
    const r = Math.random();
    if (r < 0.6) return 6 + Math.random() * 3;
    else if (r < 0.9) return 9 + Math.random() * 3;
    else return 12 + Math.random() * 3;
  }

  getColor() {
    const shades = COLOR_PALETTE[this.colorName];
    return shades[Math.floor(Math.random() * shades.length)];
  }

  explode() {
    this.exploded = true;
    const count = 80 + (this.speed - 6) * 5;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const speed = Math.random() * 5 * (this.speed / 10);
      this.particles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 40 + Math.random() * 30,
        color: this.getColor(),
        size: 1.5 + Math.random() * 3
      });
    }
  }

  update() {
    if (!this.exploded) {
      this.time += 0.05;
      const curve = Math.sin(this.time * 2) * 10 * this.curveFactor * (this.speed / 10);
      this.x += this.vx + curve;
      this.y += this.vy;
      if (this.y < 50 || Math.hypot(this.targetX - this.x, this.targetY - this.y) < 15) {
        this.explode();
      }
      if (Math.random() < 0.3 + (this.speed / 50)) {
        this.trail.push({
          x: this.x - this.vx,
          y: this.y - this.vy,
          size: 1 + Math.random() * 2,
          color: this.color,
          life: 10 + Math.random() * 10
        });
      }
      this.trail.forEach(s => s.life -= 0.5);
      this.trail = this.trail.filter(s => s.life > 0);
    } else {
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.life -= 0.8;
      });
      this.particles = this.particles.filter(p => p.life > 0);
    }
  }

  draw(ctx) {
    this.trail.forEach(s => {
      ctx.beginPath();
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.life / 20;
      ctx.arc(s.x, s.y, s.size, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    if (!this.exploded) {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      this.particles.forEach(p => {
        ctx.beginPath();
        ctx.globalAlpha = Math.min(1, p.life / 30);
        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, p.size * (p.life / 40), 0, 2 * Math.PI);
        ctx.fill();
      });
    }
    ctx.globalAlpha = 1;
  }
}

let fireworks = [];

function loop() {
  ctx.fillStyle = 'rgba(5, 5, 15, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (Math.random() < 0.04 && fireworks.length < 15) {
    fireworks.push(new Firework());
  }

  fireworks.forEach((fw, i) => {
    fw.update();
    fw.draw(ctx);
    if (fw.exploded && fw.particles.length === 0) {
      fireworks.splice(i, 1);
    }
  });

  requestAnimationFrame(loop);
}

canvas.addEventListener('click', (e) => {
  const y = Math.min(Math.max(e.clientY, 100), canvas.height - 100);
  fireworks.push(new Firework(e.clientX, y));
});

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

loop();
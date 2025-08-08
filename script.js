function showWish() {
  const name = document.getElementById('nameInput').value.trim();
  const wishDiv = document.getElementById('wish');
  if (name === "") {
    wishDiv.textContent = "Please enter your name!";
    wishDiv.classList.add('show');
    return;
  }
  wishDiv.textContent = `Happy Birthday, ${name}! 🎈🎉 Wishing you a day filled with joy and surprises!`;
  wishDiv.classList.add('show');
}
// Confetti effect
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let W = window.innerWidth;
let H = window.innerHeight;
canvas.width = W;
canvas.height = H;

let confetti = [];
let confettiCount = 150;
let colors = ['#ff6f61', '#fcb69f', '#a1c4fd', '#fbc2eb', '#fdcbf1', '#a1ffce', '#faffd1', '#ffecd2'];

function randomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function ConfettiParticle() {
  this.x = Math.random() * W;
  this.y = Math.random() * H - H;
  this.r = Math.random() * 6 + 4;
  this.d = Math.random() * confettiCount;
  this.color = randomColor();
  this.tilt = Math.floor(Math.random() * 10) - 10;
  this.tiltAngleIncremental = (Math.random() * 0.07) + .05;
  this.tiltAngle = 0;
  
  this.draw = function() {
    ctx.beginPath();
    ctx.lineWidth = this.r;
    ctx.strokeStyle = this.color;
    ctx.moveTo(this.x + this.tilt + (this.r / 3), this.y);
    ctx.lineTo(this.x + this.tilt, this.y + this.tilt + this.r);
    ctx.stroke();
  }
}

function drawConfetti() {
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < confetti.length; i++) {
    confetti[i].draw();
  }
  updateConfetti();
}

function updateConfetti() {
  for (let i = 0; i < confetti.length; i++) {
    confetti[i].y += (Math.cos(confetti[i].d) + 3 + confetti[i].r / 2) / 2;
    confetti[i].x += Math.sin(0.01 * confetti[i].d);
    
    confetti[i].tiltAngle += confetti[i].tiltAngleIncremental;
    confetti[i].tilt = Math.sin(confetti[i].tiltAngle) * 15;
    
    if (confetti[i].y > H) {
      confetti[i].x = Math.random() * W;
      confetti[i].y = -10;
    }
  }
}

function resizeCanvas() {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
}

window.addEventListener('resize', resizeCanvas);

function initConfetti() {
  confetti = [];
  for (let i = 0; i < confettiCount; i++) {
    confetti.push(new ConfettiParticle());
  }
  drawConfetti();
}

function animateConfetti() {
  drawConfetti();
  requestAnimationFrame(animateConfetti);
}

initConfetti();
animateConfetti();

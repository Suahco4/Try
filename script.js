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

function showWishPopup() {
    const name = document.getElementById('nameInput').value.trim();
    if (name === "") {
        alert("Please enter your name!");
        return;
    }

    // Open a new window
    const popup = window.open("", "BirthdayWish", "width=400,height=300,top=200,left=400");

    // Write HTML content to the new window
    popup.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Happy Birthday!</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
                    font-family: 'Segoe UI', sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                }
                .wish-popup {
                    background: rgba(255,255,255,0.95);
                    border-radius: 18px;
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
                    padding: 30px 20px;
                    text-align: center;
                    font-size: 1.3em;
                    color: #ff6f61;
                    animation: pop 0.7s;
                }
                @keyframes pop {
                    0% { transform: scale(0.7);}
                    70% { transform: scale(1.1);}
                    100% { transform: scale(1);}
                }
            </style>
        </head>
        <body>
            <div class="wish-popup">
                <h2>🎉 Happy Birthday! 🎂</h2>
                <p>Happy Birthday, <b>${name}</b>!<br>
                Wishing you a day filled with joy and surprises! 🎈</p>
            </div>
        </body>
        </html>
    `);

    popup.document.close();
}
// Profile picture upload
document.getElementById('profilePicInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('profilePic').src = e.target.result;
    };
    reader.readAsDataURL(file);
});
// Modal open/close logic
const openProfileModal = document.getElementById('openProfileModal');
const profileModal = document.getElementById('profileModal');
const closeProfileModal = document.getElementById('closeProfileModal');
const profileForm = document.getElementById('profileForm');
const profilePic = document.getElementById('profilePic');
const profileName = document.getElementById('profileName');
const modalName = document.getElementById('modalName');
const modalPic = document.getElementById('modalPic');

// Open modal
openProfileModal.addEventListener('click', () => {
    profileModal.style.display = 'flex';
    modalName.value = profileName.textContent !== "Guest" ? profileName.textContent : "";
});

// Close modal
closeProfileModal.addEventListener('click', () => {
    profileModal.style.display = 'none';
});

// Close modal when clicking outside content
window.addEventListener('click', (e) => {
    if (e.target === profileModal) {
        profileModal.style.display = 'none';
    }
});

// Handle form submit
profileForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Update name
    const nameValue = modalName.value.trim() || "Guest";
    profileName.textContent = nameValue;
    // Update profile picture if a new one is selected
    if (modalPic.files && modalPic.files[0]) {
        const file = modalPic.files[0];
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(ev) {
            profilePic.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }
    // If no new image, keep the old one
    profileModal.style.display = 'none';
});

const noBtn = document.querySelector(".no-button");
const yesBtn = document.querySelector(".yes-button");
const container = document.querySelector(".container");
const modal = document.getElementById("celebration-modal");
const modalText = modal.querySelector(".modal-text");
const heartsLayer = modal.querySelector(".modal-hearts");
const photo = new Image();
const firecrackerAudio = new Audio("./Firecrackers.mp3");
photo.src = "./ourimage.jpg";
firecrackerAudio.preload = "auto";

const FIREWORKS_MS = 4 * 60 * 1000;
const MODAL_BASE_WIDTH = 800;
const MODAL_BASE_HEIGHT = 400;
let textSwapTimer = null;
let textFadeTimer = null;

let heartsTimer = null;

function setModalSize(w, h) {
  modal.style.width = `${Math.round(w)}px`;
  modal.style.height = `${Math.round(h)}px`;
}

yesBtn.addEventListener("click", () => {
  firecrackerAudio.muted = false;
  firecrackerAudio.play();
  openModal();
});

function resizeModalToPhoto() {
  const ratio =
    photo.naturalWidth && photo.naturalHeight
      ? photo.naturalWidth / photo.naturalHeight
      : MODAL_BASE_WIDTH / MODAL_BASE_HEIGHT;
  const maxW = innerWidth * 0.92;
  const maxH = innerHeight * 0.88;
  let w = maxW;
  let h = w / ratio;
  if (h > maxH) {
    h = maxH;
    w = h * ratio;
  }
  setModalSize(w, h);
}

function startHearts() {
  if (heartsTimer) clearInterval(heartsTimer);
  heartsLayer.replaceChildren();
  heartsTimer = setInterval(() => {
    const heart = document.createElement("span");
    heart.className = "heart";
    heart.textContent = "❤";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${14 + Math.random() * 20}px`;
    heart.style.animationDuration = `${1.7 + Math.random() * 1.1}s`;
    heartsLayer.appendChild(heart);
    setTimeout(() => heart.remove(), 3200);
  }, 110);
}

function stopHearts() {
  if (heartsTimer) {
    clearInterval(heartsTimer);
    heartsTimer = null;
  }
}

function launchFireworks() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:999;width:100%;height:100%";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const colors = [
    "#ff4444",
    "#ffaa00",
    "#ffee00",
    "#44ff66",
    "#44ccff",
    "#aa66ff",
    "#ffffff",
  ];
  const particles = [];
  const start = performance.now();
  const fadeMs = 2000;
  const burstEnd = performance.now() + FIREWORKS_MS;

  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  function burst(cx, cy) {
    const n = 90 + Math.floor(Math.random() * 40);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 3 + Math.random() * 6;
      const life0 = 55 + Math.random() * 35;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: life0,
        maxLife: life0,
        c: colors[(Math.random() * colors.length) | 0],
      });
    }
  }

  function tick() {
    if (performance.now() < burstEnd && Math.random() < 0.12) {
      burst(
        canvas.width * (0.15 + Math.random() * 0.7),
        canvas.height * (0.1 + Math.random() * 0.45),
      );
    }
  }

  function frame() {
    tick();
    const fade = Math.min(1, (performance.now() - start) / fadeMs);
    ctx.fillStyle = `rgba(0,0,0,${0.15 * fade})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.vx *= 0.985;
      p.life -= 1;
      const t = p.life / p.maxLife;
      ctx.globalAlpha = Math.max(0, t);
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6 + t, 0, Math.PI * 2);
      ctx.fill();
      if (p.life <= 0) particles.splice(i, 1);
    }
    ctx.globalAlpha = 1;
    const done = performance.now() >= burstEnd && particles.length === 0;
    if (!done) {
      requestAnimationFrame(frame);
    } else {
      window.removeEventListener("resize", resize);
      canvas.remove();
    }
  }
  for (let i = 0; i < 5; i++) {
    burst(
      canvas.width * (0.15 + Math.random() * 0.7),
      canvas.height * (0.1 + Math.random() * 0.45),
    );
  }
  requestAnimationFrame(frame);
}

function openModal() {
  document.body.classList.add("celebrate");
  modal.classList.add("is-open");
  modal.classList.remove("show-photo");
  setModalSize(MODAL_BASE_WIDTH, MODAL_BASE_HEIGHT);
  modal.setAttribute("aria-hidden", "false");
  if (textSwapTimer) clearTimeout(textSwapTimer);
  if (textFadeTimer) clearTimeout(textFadeTimer);
  stopHearts();
  startHearts();
  modalText.classList.remove("fade");
  modalText.textContent = "She said yes!";
  textSwapTimer = setTimeout(() => {
    stopHearts();
    modalText.classList.add("fade");
    textFadeTimer = setTimeout(() => {
      modalText.textContent = "Wedding date: 20th April 2025";
      modalText.classList.remove("fade");
      modal.classList.add("show-photo");
      resizeModalToPhoto();
    }, 450);
  }, 2000);
  launchFireworks();
}

yesBtn.addEventListener("click", openModal);
window.addEventListener("resize", () => {
  if (modal.classList.contains("show-photo")) resizeModalToPhoto();
});

function alignNoWithYes() {
  const cr = container.getBoundingClientRect();
  const b = getComputedStyle(container);
  const bl = parseFloat(b.borderLeftWidth) || 0;
  const bt = parseFloat(b.borderTopWidth) || 0;
  const y = yesBtn.getBoundingClientRect();
  const gap = 12;
  noBtn.style.left = y.right - cr.left - bl + gap + "px";
  noBtn.style.top = y.top - cr.top - bt + "px";
}

alignNoWithYes();
window.addEventListener("resize", alignNoWithYes);

noBtn.addEventListener("mouseover", () => {
  const x =
    Math.random() * Math.max(0, container.clientWidth - noBtn.offsetWidth);
  const y =
    Math.random() * Math.max(0, container.clientHeight - noBtn.offsetHeight);
  noBtn.style.left = x + "px";
  noBtn.style.top = y + "px";
});

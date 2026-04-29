import confetti from "canvas-confetti";

type Effect = () => void;

// 1. Classic small burst
const classicBurst: Effect = () => {
  confetti({
    particleCount: 40,
    spread: 55,
    origin: { y: 0.7 },
    scalar: 0.7,
    ticks: 120,
  });
};

// 2. Twin side cannons
const sideCannons: Effect = () => {
  const defaults = { startVelocity: 20, spread: 55, ticks: 100, scalar: 0.75, zIndex: 9999 };
  confetti({ ...defaults, particleCount: 25, angle: 60, origin: { x: 0, y: 0.65 } });
  confetti({ ...defaults, particleCount: 25, angle: 120, origin: { x: 1, y: 0.65 } });
};

// 3. Fireworks
const fireworks: Effect = () => {
  const end = Date.now() + 800;
  const colors = ["#FF4A24", "#2563eb", "#10b981", "#f59e0b", "#fff"];
  const frame = () => {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors, scalar: 0.8, ticks: 80 });
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors, scalar: 0.8, ticks: 80 });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
};

// 4. Star shower from top
const starShower: Effect = () => {
  confetti({
    particleCount: 35,
    spread: 100,
    origin: { y: 0 },
    startVelocity: 15,
    gravity: 0.6,
    scalar: 0.8,
    shapes: ["star"],
    colors: ["#FF4A24", "#f59e0b", "#fff", "#10b981"],
    ticks: 150,
  });
};

// 5. Confetti triangles — mix di forme geometriche
const triangleBurst: Effect = () => {
  confetti({
    particleCount: 45,
    spread: 70,
    origin: { y: 0.65 },
    shapes: ["circle", "square"],
    scalar: 0.6,
    colors: ["#FF4A24", "#2563eb", "#10b981", "#7c3aed", "#f59e0b"],
    ticks: 130,
  });
};

// 6. Sparkle radiale dal centro
const sparkle: Effect = () => {
  confetti({
    particleCount: 50,
    spread: 360,
    startVelocity: 8,
    origin: { x: 0.5, y: 0.5 },
    gravity: 0.2,
    ticks: 120,
    scalar: 0.5,
    shapes: ["circle"],
    colors: ["#fff", "#FF4A24", "#2563eb", "#10b981", "#f59e0b"],
  });
};

// 7. Gold glitter rain
const goldRain: Effect = () => {
  const end = Date.now() + 600;
  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 270,
      spread: 80,
      origin: { x: Math.random(), y: 0 },
      colors: ["#fbbf24", "#f59e0b", "#d97706", "#fde68a"],
      scalar: 0.65,
      ticks: 80,
      gravity: 1.2,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
};

// 8. Vortex spiral
const vortex: Effect = () => {
  const defaults = { startVelocity: 0, ticks: 200, decay: 0.99, gravity: 0, scalar: 0.6 };
  let angle = 0;
  const intervalId = setInterval(() => {
    angle += 10;
    confetti({
      ...defaults,
      particleCount: 2,
      spread: 0,
      angle,
      origin: { x: 0.5, y: 0.5 },
      colors: ["#FF4A24", "#2563eb", "#10b981"],
    });
    if (angle >= 360) clearInterval(intervalId);
  }, 20);
};

// 9. Stelle dal basso verso l'alto
const starsUp: Effect = () => {
  confetti({
    particleCount: 30,
    spread: 60,
    origin: { y: 1 },
    startVelocity: 35,
    gravity: 0.5,
    shapes: ["star"],
    scalar: 0.9,
    colors: ["#FF4A24", "#fff", "#f59e0b", "#2563eb"],
    ticks: 160,
  });
};

// 10. Pop dal centro — esplosione piatta
const centerPop: Effect = () => {
  confetti({
    particleCount: 60,
    spread: 360,
    startVelocity: 25,
    origin: { x: 0.5, y: 0.6 },
    scalar: 0.65,
    ticks: 100,
    gravity: 0.8,
    colors: ["#FF4A24", "#2563eb", "#10b981", "#7c3aed", "#f59e0b", "#fff"],
  });
};

const EFFECTS: Effect[] = [
  classicBurst,
  sideCannons,
  fireworks,
  starShower,
  triangleBurst,
  sparkle,
  goldRain,
  vortex,
  starsUp,
  centerPop,
];

export function celebrate() {
  const effect = EFFECTS[Math.floor(Math.random() * EFFECTS.length)];
  effect();
}

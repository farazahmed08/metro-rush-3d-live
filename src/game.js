import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const canvas = document.querySelector("#game-canvas");
const distanceEl = document.querySelector("#distance");
const coinsEl = document.querySelector("#coins");
const speedEl = document.querySelector("#speed");
const magnetStatusEl = document.querySelector("#magnet-status");
const magnetTimeEl = document.querySelector("#magnet-time");
const multiplierStatusEl = document.querySelector("#multiplier-status");
const multiplierTimeEl = document.querySelector("#multiplier-time");
const startScreen = document.querySelector("#start-screen");
const gameOverScreen = document.querySelector("#game-over-screen");
const pauseScreen = document.querySelector("#pause-screen");
const countdownScreen = document.querySelector("#countdown-screen");
const countdownValueEl = document.querySelector("#countdown-value");
const finalScoreEl = document.querySelector("#final-score");
const startButton = document.querySelector("#start-button");
const restartButton = document.querySelector("#restart-button");
const homeButton = document.querySelector("#home-button");
const pauseButton = document.querySelector("#pause-button");
const resumeButton = document.querySelector("#resume-button");
const pauseHomeButton = document.querySelector("#pause-home-button");
const mobileButtons = [...document.querySelectorAll(".mobile-controls button")];
const impactFlashEl = document.querySelector("#impact-flash");
const characterButtons = [...document.querySelectorAll(".character-card")];
const weatherButtons = [...document.querySelectorAll(".weather-card")];
const characterMenuButton = document.querySelector("#character-menu-button");
const weatherMenuButton = document.querySelector("#weather-menu-button");
const characterMenu = document.querySelector("#character-menu");
const weatherMenu = document.querySelector("#weather-menu");
const selectedCharacterIcon = document.querySelector("#selected-character-icon");
const selectedCharacterName = document.querySelector("#selected-character-name");
const selectedWeatherIcon = document.querySelector("#selected-weather-icon");
const selectedWeatherName = document.querySelector("#selected-weather-name");
const swipeState = {
  active: false,
  pointerId: null,
  startX: 0,
  startY: 0,
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b9d8);
scene.fog = new THREE.Fog(0x87b9d8, 34, 115);

const camera = new THREE.PerspectiveCamera(64, window.innerWidth / window.innerHeight, 0.1, 180);
camera.position.set(0, 5.6, 10.6);
camera.lookAt(0, 1.4, -18);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;

const hemi = new THREE.HemisphereLight(0xeaf7ff, 0x63442d, 2.7);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff3d7, 3.3);
sun.position.set(-12, 20, 12);
sun.castShadow = true;
sun.shadow.camera.left = -24;
sun.shadow.camera.right = 24;
sun.shadow.camera.top = 24;
sun.shadow.camera.bottom = -24;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

const fill = new THREE.DirectionalLight(0x8fd1ff, 0.9);
fill.position.set(10, 9, -8);
scene.add(fill);

const clock = new THREE.Clock();
const laneX = [-3.3, 0, 3.3];
const worldSpeedStart = 20;
const segmentLength = 18;
const activeDepth = 10;
const aheadDistance = 120;
const trainRoofY = 3.28;
const rampLength = 7.4;
// Train-top routes need enough headroom for a full jump, not just a standing runner.
const overheadPostHeight = 9.25;
const overheadBeamY = 9.16;
const overheadWireHighY = 8.96;
const overheadWireSagY = 8.66;
const overheadSignY = 8.58;
const lampPostHeight = 5.9;
const lampHeadY = 5.82;
const firstPowerupDistanceMin = 140;
const firstPowerupDistanceMax = 210;
const powerupGapMin = 260;
const powerupGapMax = 360;
const sidePalette = [0xd66a3d, 0xe8b267, 0x4c768b, 0x66895a, 0x91556d, 0x5f6778];

function getCameraProfile() {
  const portraitMobile =
    window.innerHeight > window.innerWidth &&
    (window.innerWidth <= 900 || window.matchMedia("(pointer: coarse)").matches);
  return portraitMobile
    ? {
        baseFov: 72,
        baseY: 6.08,
        baseZ: 11.55,
        lookY: 1.58,
      }
    : {
        baseFov: 64,
        baseY: 5.55,
        baseZ: 10.6,
        lookY: 1.45,
      };
}

let cameraProfile = getCameraProfile();

function resetCameraPose() {
  cameraProfile = getCameraProfile();
  camera.position.set(0, cameraProfile.baseY, cameraProfile.baseZ);
  camera.fov = cameraProfile.baseFov;
  camera.updateProjectionMatrix();
  camera.lookAt(0, cameraProfile.lookY, -18);
}

resetCameraPose();
const characterStyles = {
  nova: {
    name: "Nova",
    shirt: 0xd94b3d,
    pants: 0x355c7d,
    skin: 0xc98f65,
    shoes: 0xf2efe9,
    cap: 0x355c7d,
  },
  jax: {
    name: "Jax",
    shirt: 0x19a974,
    pants: 0x263238,
    skin: 0x8b5a3c,
    shoes: 0xff9f1c,
    cap: 0x263238,
  },
  luna: {
    name: "Luna",
    shirt: 0x7f5af0,
    pants: 0x2b2d42,
    skin: 0xd6a27c,
    shoes: 0xf7f4ec,
    cap: 0xff6b9a,
  },
};
const weatherStyles = {
  sunny: {
    name: "Sunny",
    icon: "☀",
    sky: 0x87b9d8,
    fog: 0x87b9d8,
    hemiSky: 0xeaf7ff,
    hemiGround: 0x63442d,
    hemiIntensity: 2.7,
    sunColor: 0xfff3d7,
    sunIntensity: 3.3,
    fillColor: 0x8fd1ff,
    fillIntensity: 0.9,
    exposure: 1.06,
    hazeColor: 0xffe7bb,
    hazeOpacity: 0.12,
    sunOpacity: 0.92,
    cloudColor: 0xffffff,
    cloudOpacity: 0.12,
    dustOpacity: 0.45,
  },
  cloudy: {
    name: "Cloudy",
    icon: "☁",
    sky: 0x8da0aa,
    fog: 0x8da0aa,
    hemiSky: 0xe2eaee,
    hemiGround: 0x5a514b,
    hemiIntensity: 2.15,
    sunColor: 0xf4ead8,
    sunIntensity: 1.35,
    fillColor: 0xa9bac5,
    fillIntensity: 0.62,
    exposure: 0.94,
    hazeColor: 0xd7dde0,
    hazeOpacity: 0.18,
    sunOpacity: 0.28,
    cloudColor: 0xd7dde2,
    cloudOpacity: 0.58,
    dustOpacity: 0.18,
  },
  rain: {
    name: "Rain",
    icon: "☂",
    sky: 0x697b86,
    fog: 0x697b86,
    hemiSky: 0xd8e3e8,
    hemiGround: 0x403d3b,
    hemiIntensity: 1.8,
    sunColor: 0xdde2e5,
    sunIntensity: 0.72,
    fillColor: 0x91a9b7,
    fillIntensity: 0.44,
    exposure: 0.82,
    hazeColor: 0xbec9ce,
    hazeOpacity: 0.22,
    sunOpacity: 0.08,
    cloudColor: 0xb7c0c7,
    cloudOpacity: 0.78,
    dustOpacity: 0.08,
  },
  snow: {
    name: "Snow",
    icon: "❄",
    sky: 0xc7d7e0,
    fog: 0xc7d7e0,
    hemiSky: 0xf4fbff,
    hemiGround: 0x7f8588,
    hemiIntensity: 2.45,
    sunColor: 0xfaf7ef,
    sunIntensity: 1.45,
    fillColor: 0xdbefff,
    fillIntensity: 0.78,
    exposure: 1.02,
    hazeColor: 0xffffff,
    hazeOpacity: 0.18,
    sunOpacity: 0.34,
    cloudColor: 0xf4f7fa,
    cloudOpacity: 0.5,
    dustOpacity: 0,
  },
};

const state = {
  running: false,
  dead: false,
  paused: false,
  resumeCountdown: 0,
  resumeCountdownTimer: 0,
  lane: 1,
  laneTarget: 0,
  verticalVelocity: 0,
  y: 0,
  surfaceY: 0,
  sliding: false,
  slideTimer: 0,
  distance: 0,
  coins: 0,
  speed: worldSpeedStart,
  spawnCursor: -18,
  shakeTimer: 0,
  shakeStrength: 0,
  selectedCharacter: "nova",
  selectedWeather: "sunny",
  magnetTimer: 0,
  multiplierTimer: 0,
  nextPowerupDistance: firstPowerupDistanceMin,
  nextPowerupType: "magnet",
};

const world = new THREE.Group();
scene.add(world);

const trackSegments = [];
const movers = [];
const coins = [];
const powerups = [];
const scenery = [];
const particles = [];
const clouds = [];
const weatherParticles = [];
const effects = [];

let hazeShell;
let sunDisc;

let audioContext;
let noiseBuffer;

const materials = {
  asphalt: new THREE.MeshStandardMaterial({ color: 0x20262d, roughness: 0.92, metalness: 0.05 }),
  ballast: new THREE.MeshStandardMaterial({ color: 0x54463d, roughness: 1 }),
  rail: new THREE.MeshStandardMaterial({ color: 0xb9c2c7, roughness: 0.28, metalness: 0.9 }),
  sleeper: new THREE.MeshStandardMaterial({ color: 0x4a3325, roughness: 0.95 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xb95f3a, roughness: 0.84 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0x8a8d8f, roughness: 0.88 }),
  train: new THREE.MeshStandardMaterial({ color: 0x224d66, roughness: 0.4, metalness: 0.22 }),
  trainAccent: new THREE.MeshStandardMaterial({ color: 0xf0a93e, roughness: 0.38, metalness: 0.12 }),
  window: new THREE.MeshStandardMaterial({
    color: 0x8ad7ff,
    emissive: 0x16455c,
    emissiveIntensity: 0.85,
    roughness: 0.18,
    metalness: 0.15,
  }),
  barrier: new THREE.MeshStandardMaterial({ color: 0xdc4f3e, roughness: 0.72 }),
  barrierStripe: new THREE.MeshStandardMaterial({ color: 0xf6efe2, roughness: 0.72 }),
  cone: new THREE.MeshStandardMaterial({ color: 0xff7a18, roughness: 0.74 }),
  coin: new THREE.MeshStandardMaterial({
    color: 0xffc857,
    emissive: 0xb97a08,
    emissiveIntensity: 0.8,
    roughness: 0.18,
    metalness: 0.72,
  }),
  runnerRed: new THREE.MeshStandardMaterial({ color: 0xd94b3d, roughness: 0.62 }),
  runnerBlue: new THREE.MeshStandardMaterial({ color: 0x355c7d, roughness: 0.66 }),
  runnerSkin: new THREE.MeshStandardMaterial({ color: 0xc98f65, roughness: 0.72 }),
  runnerShoe: new THREE.MeshStandardMaterial({ color: 0xf2efe9, roughness: 0.62 }),
  sign: new THREE.MeshStandardMaterial({ color: 0x23455f, roughness: 0.58 }),
  foliage: new THREE.MeshStandardMaterial({ color: 0x3e7a49, roughness: 0.9 }),
  trunk: new THREE.MeshStandardMaterial({ color: 0x6d4c33, roughness: 1 }),
  wire: new THREE.LineBasicMaterial({ color: 0x25313a, transparent: true, opacity: 0.85 }),
  metalDark: new THREE.MeshStandardMaterial({ color: 0x27323a, roughness: 0.42, metalness: 0.66 }),
  dust: new THREE.MeshBasicMaterial({ color: 0xe8d6bc, transparent: true, opacity: 0.72 }),
  sparkle: new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 1 }),
  impact: new THREE.MeshBasicMaterial({ color: 0xff6b57, transparent: true, opacity: 1 }),
  rain: new THREE.MeshBasicMaterial({ color: 0xd8edf8, transparent: true, opacity: 0.72 }),
  snow: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.92 }),
  ramp: new THREE.MeshStandardMaterial({ color: 0x6d5b47, roughness: 0.9 }),
  rampTrim: new THREE.MeshStandardMaterial({ color: 0xa8b1b6, roughness: 0.42, metalness: 0.32 }),
  magnetRed: new THREE.MeshStandardMaterial({
    color: 0xe84b4b,
    emissive: 0x611313,
    emissiveIntensity: 0.55,
    roughness: 0.34,
  }),
  magnetBlue: new THREE.MeshStandardMaterial({
    color: 0x3c8dff,
    emissive: 0x102f66,
    emissiveIntensity: 0.55,
    roughness: 0.34,
  }),
  multiplierGreen: new THREE.MeshStandardMaterial({
    color: 0x35d98d,
    emissive: 0x0d5b3c,
    emissiveIntensity: 0.72,
    roughness: 0.28,
  }),
  multiplierGold: new THREE.MeshStandardMaterial({
    color: 0xffd76a,
    emissive: 0xa36b08,
    emissiveIntensity: 0.82,
    roughness: 0.22,
    metalness: 0.48,
  }),
};

function createBadgeMaterial(label, fillColor, textColor) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");

  context.fillStyle = fillColor;
  context.beginPath();
  context.moveTo(42, 18);
  context.lineTo(214, 18);
  context.quadraticCurveTo(238, 18, 238, 42);
  context.lineTo(238, 86);
  context.quadraticCurveTo(238, 110, 214, 110);
  context.lineTo(42, 110);
  context.quadraticCurveTo(18, 110, 18, 86);
  context.lineTo(18, 42);
  context.quadraticCurveTo(18, 18, 42, 18);
  context.closePath();
  context.fill();
  context.strokeStyle = "rgba(255,255,255,0.55)";
  context.lineWidth = 8;
  context.stroke();
  context.fillStyle = textColor;
  context.font = "bold 72px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label, 128, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
}

const multiplierBadgeMaterial = createBadgeMaterial("x2", "#24cf86", "#fff6cc");

function mesh(geometry, material, { x = 0, y = 0, z = 0, cast = true, receive = true } = {}) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(x, y, z);
  item.castShadow = cast;
  item.receiveShadow = receive;
  return item;
}

function createRunner() {
  const runner = new THREE.Group();
  runner.position.set(0, 0, 2);

  const torso = mesh(new THREE.BoxGeometry(0.92, 1.18, 0.52), materials.runnerRed, { y: 1.55 });
  torso.geometry.translate(0, 0, 0);
  const head = mesh(new THREE.SphereGeometry(0.43, 24, 24), materials.runnerSkin, { y: 2.42 });
  const cap = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.16, 24), materials.runnerBlue, {
    y: 2.76,
  });
  cap.rotation.z = Math.PI / 2;

  const leftArm = mesh(new THREE.CapsuleGeometry(0.16, 0.7, 8, 16), materials.runnerSkin, {
    x: -0.66,
    y: 1.62,
  });
  const rightArm = leftArm.clone();
  rightArm.position.x = 0.66;

  const leftLeg = mesh(new THREE.CapsuleGeometry(0.18, 0.72, 8, 16), materials.runnerBlue, {
    x: -0.27,
    y: 0.74,
  });
  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.27;

  const leftShoe = mesh(new THREE.BoxGeometry(0.38, 0.18, 0.7), materials.runnerShoe, {
    x: -0.27,
    y: 0.22,
    z: -0.12,
  });
  const rightShoe = leftShoe.clone();
  rightShoe.position.x = 0.27;

  runner.add(torso, head, cap, leftArm, rightArm, leftLeg, rightLeg, leftShoe, rightShoe);
  runner.userData = { torso, head, cap, leftArm, rightArm, leftLeg, rightLeg, leftShoe, rightShoe };
  scene.add(runner);
  return runner;
}

const runner = createRunner();

function applyCharacterStyle(characterId) {
  const style = characterStyles[characterId] ?? characterStyles.nova;
  const { torso, head, cap, leftArm, rightArm, leftLeg, rightLeg, leftShoe, rightShoe } = runner.userData;
  torso.material.color.setHex(style.shirt);
  head.material.color.setHex(style.skin);
  cap.material.color.setHex(style.cap);
  leftArm.material.color.setHex(style.skin);
  rightArm.material.color.setHex(style.skin);
  leftLeg.material.color.setHex(style.pants);
  rightLeg.material.color.setHex(style.pants);
  leftShoe.material.color.setHex(style.shoes);
  rightShoe.material.color.setHex(style.shoes);
}

function selectCharacter(characterId) {
  state.selectedCharacter = characterStyles[characterId] ? characterId : "nova";
  applyCharacterStyle(state.selectedCharacter);
  selectedCharacterIcon.className = `avatar compact ${state.selectedCharacter}`;
  selectedCharacterName.textContent = characterStyles[state.selectedCharacter].name;
  characterButtons.forEach((button) => {
    const selected = button.dataset.character === state.selectedCharacter;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function selectWeather(weatherId) {
  state.selectedWeather = weatherStyles[weatherId] ? weatherId : "sunny";
  applyWeatherStyle(state.selectedWeather);
  selectedWeatherIcon.textContent = weatherStyles[state.selectedWeather].icon;
  selectedWeatherName.textContent = weatherStyles[state.selectedWeather].name;
  weatherButtons.forEach((button) => {
    const selected = button.dataset.weather === state.selectedWeather;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function setMenuOpen(menuName, open) {
  const isCharacterMenu = menuName === "character";
  characterMenu.hidden = !isCharacterMenu || !open;
  weatherMenu.hidden = isCharacterMenu || !open;
  characterMenuButton.setAttribute("aria-expanded", String(isCharacterMenu && open));
  weatherMenuButton.setAttribute("aria-expanded", String(!isCharacterMenu && open));
}

function closeMenus() {
  characterMenu.hidden = true;
  weatherMenu.hidden = true;
  characterMenuButton.setAttribute("aria-expanded", "false");
  weatherMenuButton.setAttribute("aria-expanded", "false");
}

function applyWeatherStyle(weatherId) {
  const style = weatherStyles[weatherId] ?? weatherStyles.sunny;
  scene.background.setHex(style.sky);
  scene.fog.color.setHex(style.fog);
  hemi.color.setHex(style.hemiSky);
  hemi.groundColor.setHex(style.hemiGround);
  hemi.intensity = style.hemiIntensity;
  sun.color.setHex(style.sunColor);
  sun.intensity = style.sunIntensity;
  fill.color.setHex(style.fillColor);
  fill.intensity = style.fillIntensity;
  renderer.toneMappingExposure = style.exposure;

  if (hazeShell) {
    hazeShell.material.color.setHex(style.hazeColor);
    hazeShell.material.opacity = style.hazeOpacity;
  }

  if (sunDisc) {
    sunDisc.material.opacity = style.sunOpacity;
  }

  for (const cloud of clouds) {
    cloud.material.color.setHex(style.cloudColor);
    cloud.material.opacity = style.cloudOpacity;
  }

  for (const particle of particles) {
    particle.object.material.opacity = style.dustOpacity;
  }

  rebuildWeatherParticles(weatherId);
}

function ensureAudio() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function createNoiseBuffer() {
  if (!audioContext || noiseBuffer) return noiseBuffer;
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.35, audioContext.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < channel.length; i += 1) {
    channel[i] = Math.random() * 2 - 1;
  }
  noiseBuffer = buffer;
  return noiseBuffer;
}

function playTone({
  type = "sine",
  startFrequency,
  endFrequency = startFrequency,
  duration,
  volume,
  when = 0,
}) {
  if (!audioContext) return;
  const now = audioContext.currentTime + when;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(startFrequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

function playJumpSound() {
  if (!audioContext) return;
  playTone({
    type: "triangle",
    startFrequency: 180,
    endFrequency: 420,
    duration: 0.18,
    volume: 0.08,
  });
  playTone({
    type: "sine",
    startFrequency: 120,
    endFrequency: 220,
    duration: 0.12,
    volume: 0.045,
  });
}

function playCoinSound() {
  if (!audioContext) return;
  playTone({
    type: "triangle",
    startFrequency: 780,
    endFrequency: 1180,
    duration: 0.12,
    volume: 0.07,
  });
  playTone({
    type: "sine",
    startFrequency: 1180,
    endFrequency: 1480,
    duration: 0.11,
    volume: 0.045,
    when: 0.055,
  });
}

function playPowerupSound() {
  if (!audioContext) return;
  playTone({
    type: "triangle",
    startFrequency: 260,
    endFrequency: 680,
    duration: 0.24,
    volume: 0.08,
  });
  playTone({
    type: "sine",
    startFrequency: 520,
    endFrequency: 980,
    duration: 0.22,
    volume: 0.055,
    when: 0.06,
  });
}

function playCrashSound() {
  if (!audioContext) return;
  const now = audioContext.currentTime;
  const noise = audioContext.createBufferSource();
  const noiseGain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  noise.buffer = createNoiseBuffer();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1400, now);
  filter.frequency.exponentialRampToValueAtTime(180, now + 0.3);
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.16, now + 0.015);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(audioContext.destination);
  noise.start(now);
  noise.stop(now + 0.36);

  playTone({
    type: "sawtooth",
    startFrequency: 130,
    endFrequency: 48,
    duration: 0.34,
    volume: 0.1,
  });
}

function spawnBurst({
  x,
  y,
  z,
  count,
  colorMaterial,
  radius = 0.09,
  spread = 1,
  lift = 1,
  life = 0.38,
}) {
  for (let i = 0; i < count; i += 1) {
    const particle = mesh(new THREE.SphereGeometry(radius, 8, 8), colorMaterial.clone(), {
      x,
      y,
      z,
      cast: false,
      receive: false,
    });
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.42;
    const speed = 1.4 + Math.random() * spread;
    scene.add(particle);
    effects.push({
      object: particle,
      velocity: new THREE.Vector3(Math.cos(angle) * speed, lift + Math.random() * lift, Math.sin(angle) * speed),
      life,
      maxLife: life,
    });
  }
}

function spawnJumpEffect() {
  spawnBurst({
    x: runner.position.x,
    y: 0.18,
    z: runner.position.z + 0.15,
    count: 7,
    colorMaterial: materials.dust,
    radius: 0.08,
    spread: 0.7,
    lift: 0.35,
    life: 0.34,
  });
}

function spawnCoinEffect(coin) {
  spawnBurst({
    x: coin.object.position.x,
    y: coin.object.position.y,
    z: coin.object.position.z,
    count: 8,
    colorMaterial: materials.sparkle,
    radius: 0.07,
    spread: 1.15,
    lift: 0.75,
    life: 0.42,
  });
}

function spawnImpactEffect() {
  spawnBurst({
    x: runner.position.x,
    y: 1.15 + state.y,
    z: runner.position.z,
    count: 14,
    colorMaterial: materials.impact,
    radius: 0.1,
    spread: 1.8,
    lift: 1.1,
    life: 0.52,
  });
  impactFlashEl.classList.remove("active");
  void impactFlashEl.offsetWidth;
  impactFlashEl.classList.add("active");
}

function createTrackSegment(index) {
  const z = -index * segmentLength;
  const group = new THREE.Group();
  group.position.z = z;

  const road = mesh(new THREE.BoxGeometry(13.8, 0.28, segmentLength), materials.asphalt, {
    y: -0.18,
    receive: true,
    cast: false,
  });
  const ballast = mesh(new THREE.BoxGeometry(10.8, 0.34, segmentLength), materials.ballast, {
    y: 0,
    receive: true,
    cast: false,
  });
  group.add(road, ballast);

  laneX.forEach((lane) => {
    group.add(
      mesh(new THREE.BoxGeometry(0.12, 0.16, segmentLength), materials.rail, {
        x: lane - 0.82,
        y: 0.22,
      }),
      mesh(new THREE.BoxGeometry(0.12, 0.16, segmentLength), materials.rail, {
        x: lane + 0.82,
        y: 0.22,
      }),
    );
  });

  for (let i = 0; i < 10; i += 1) {
    group.add(
      mesh(new THREE.BoxGeometry(10.3, 0.16, 0.34), materials.sleeper, {
        y: 0.1,
        z: -segmentLength / 2 + 0.8 + i * 1.7,
      }),
    );
  }

  const leftWall = mesh(new THREE.BoxGeometry(1.4, 3.2, segmentLength), materials.wall, {
    x: -7.5,
    y: 1.34,
  });
  const rightWall = leftWall.clone();
  rightWall.position.x = 7.5;
  group.add(leftWall, rightWall);

  const leftWalkway = mesh(new THREE.BoxGeometry(1.4, 0.3, segmentLength), materials.concrete, {
    x: -6.1,
    y: 0.02,
  });
  const rightWalkway = leftWalkway.clone();
  rightWalkway.position.x = 6.1;
  group.add(leftWalkway, rightWalkway);

  if (index % 2 === 0) {
    addLamp(group, -6.05, -5.5);
    addLamp(group, 6.05, 4.6);
    addCatenary(group, -6.2);
  }

  if (index % 3 === 0) {
    addTree(group, -8.9, -4.4);
    addTree(group, 8.9, 3.8);
  }

  if (index % 4 === 0) {
    addOverheadSign(group, -2.1);
  }

  if (index % 5 === 0) {
    addBench(group, -6.2, 4.7);
    addBench(group, 6.2, -4.6);
  }

  createSideBuildings(group, index);
  world.add(group);
  trackSegments.push(group);
}

function addLamp(parent, x, z) {
  const post = mesh(new THREE.CylinderGeometry(0.08, 0.1, lampPostHeight, 12), materials.concrete, {
    x,
    y: lampPostHeight / 2,
    z,
  });
  const head = mesh(new THREE.BoxGeometry(0.6, 0.18, 0.3), materials.sign, {
    x: x + (x < 0 ? 0.22 : -0.22),
    y: lampHeadY,
    z,
  });
  parent.add(post, head);
}

function addTree(parent, x, z) {
  const trunk = mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.4, 10), materials.trunk, {
    x,
    y: 0.7,
    z,
  });
  const crown = mesh(new THREE.SphereGeometry(0.88, 16, 16), materials.foliage, {
    x,
    y: 1.75,
    z,
  });
  parent.add(trunk, crown);
}

function addOverheadSign(parent, z) {
  const leftPost = mesh(new THREE.BoxGeometry(0.18, overheadPostHeight, 0.18), materials.sign, {
    x: -5.1,
    y: overheadPostHeight / 2,
    z,
  });
  const rightPost = leftPost.clone();
  rightPost.position.x = 5.1;
  const topBeam = mesh(new THREE.BoxGeometry(10.4, 0.18, 0.18), materials.sign, {
    y: overheadBeamY,
    z,
  });
  const board = mesh(new THREE.BoxGeometry(3.2, 0.82, 0.18), materials.trainAccent, {
    y: overheadSignY,
    z: z + 0.02,
  });
  parent.add(leftPost, rightPost, topBeam, board);
}

function addCatenary(parent, z) {
  const leftPost = mesh(new THREE.CylinderGeometry(0.08, 0.1, overheadPostHeight, 12), materials.metalDark, {
    x: -5.3,
    y: overheadPostHeight / 2,
    z,
  });
  const rightPost = leftPost.clone();
  rightPost.position.x = 5.3;
  const beam = mesh(new THREE.BoxGeometry(10.8, 0.12, 0.12), materials.metalDark, {
    y: overheadBeamY,
    z,
  });
  parent.add(leftPost, rightPost, beam);

  laneX.forEach((lane) => {
    const wireGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(lane, overheadWireHighY, -segmentLength / 2),
      new THREE.Vector3(lane, overheadWireSagY, 0),
      new THREE.Vector3(lane, overheadWireHighY, segmentLength / 2),
    ]);
    parent.add(new THREE.Line(wireGeometry, materials.wire));
  });
}

function addBench(parent, x, z) {
  const seat = mesh(new THREE.BoxGeometry(1.55, 0.16, 0.48), materials.sleeper, {
    x,
    y: 0.7,
    z,
  });
  const back = mesh(new THREE.BoxGeometry(1.55, 0.58, 0.14), materials.sleeper, {
    x,
    y: 1.02,
    z: z + (x < 0 ? -0.18 : 0.18),
  });
  const legA = mesh(new THREE.BoxGeometry(0.12, 0.62, 0.12), materials.metalDark, {
    x: x - 0.56,
    y: 0.32,
    z,
  });
  const legB = legA.clone();
  legB.position.x = x + 0.56;
  parent.add(seat, back, legA, legB);
}

function createSideBuildings(parent, index) {
  for (const side of [-1, 1]) {
    const count = 2 + ((index + (side > 0 ? 1 : 0)) % 2);
    for (let i = 0; i < count; i += 1) {
      const width = 2.4 + ((index * 7 + i * 3) % 4) * 0.45;
      const height = 4.4 + ((index * 5 + i * 11) % 5);
      const depth = 3.1 + ((index * 13 + i) % 3) * 0.5;
      const building = mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshStandardMaterial({
          color: sidePalette[(index + i + (side > 0 ? 2 : 0)) % sidePalette.length],
          roughness: 0.84,
        }),
        {
          x: side * (9.4 + i * 3.6),
          y: height / 2 - 0.1,
          z: -5.5 + i * 5.3,
        },
      );
      parent.add(building);

      const rows = Math.max(2, Math.floor(height / 1.3));
      for (let row = 0; row < rows; row += 1) {
        const window = mesh(new THREE.BoxGeometry(0.42, 0.48, 0.04), materials.window, {
          x: building.position.x + side * (-width / 2 - 0.03),
          y: 1.1 + row * 1.08,
          z: building.position.z - depth / 2 + 0.6 + ((row + i) % 3) * 0.68,
          cast: false,
        });
        window.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
        parent.add(window);
      }
    }
  }
}

function createTrain(lane, z) {
  const group = new THREE.Group();
  group.position.set(laneX[lane], 0, z);
  const body = mesh(new THREE.BoxGeometry(2.45, 3.05, 7.4), materials.train, { y: 1.55 });
  const roof = mesh(new THREE.BoxGeometry(2.3, 0.22, 7.1), materials.trainAccent, { y: 3.16 });
  const nose = mesh(new THREE.BoxGeometry(2.5, 2.7, 0.16), materials.trainAccent, {
    y: 1.48,
    z: 3.82,
  });
  group.add(body, roof, nose);

  for (const wheelZ of [-2.55, 2.55]) {
    const leftWheel = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.18, 18), materials.metalDark, {
      x: -1.06,
      y: 0.36,
      z: wheelZ,
    });
    const rightWheel = leftWheel.clone();
    rightWheel.position.x = 1.06;
    leftWheel.rotation.z = Math.PI / 2;
    rightWheel.rotation.z = Math.PI / 2;
    group.add(leftWheel, rightWheel);
  }

  for (const x of [-0.72, 0.72]) {
    group.add(mesh(new THREE.BoxGeometry(0.62, 0.62, 0.05), materials.window, { x, y: 2.1, z: 3.92 }));
    group.add(
      mesh(
        new THREE.SphereGeometry(0.12, 14, 14),
        new THREE.MeshStandardMaterial({
          color: 0xfff0b8,
          emissive: 0xffdf7f,
          emissiveIntensity: 1.8,
          roughness: 0.18,
        }),
        { x, y: 1.2, z: 3.94 },
      ),
    );
  }
  for (let i = 0; i < 3; i += 1) {
    group.add(
      mesh(new THREE.BoxGeometry(0.72, 0.72, 0.05), materials.window, {
        x: -1.25,
        y: 2.08,
        z: -2.2 + i * 1.7,
      }),
      mesh(new THREE.BoxGeometry(0.72, 0.72, 0.05), materials.window, {
        x: 1.25,
        y: 2.08,
        z: -2.2 + i * 1.7,
      }),
    );
  }

  world.add(group);
  movers.push({ type: "train", lane, object: group, width: 2.55, height: 3.1, depth: 7.4 });
}

function createRoofTrain(lane, z, length = 15.6) {
  const group = new THREE.Group();
  group.position.set(laneX[lane], 0, z);
  const body = mesh(new THREE.BoxGeometry(2.45, 3.05, length), materials.train, { y: 1.55 });
  const roof = mesh(new THREE.BoxGeometry(2.3, 0.22, length - 0.28), materials.trainAccent, {
    y: trainRoofY - 0.12,
  });
  const rear = mesh(new THREE.BoxGeometry(2.5, 2.7, 0.16), materials.trainAccent, {
    y: 1.48,
    z: -length / 2 - 0.02,
  });
  group.add(body, roof, rear);

  for (let i = 0; i < Math.max(4, Math.floor(length / 2.1)); i += 1) {
    const localZ = -length / 2 + 1.05 + i * 2.1;
    group.add(
      mesh(new THREE.BoxGeometry(0.72, 0.72, 0.05), materials.window, {
        x: -1.25,
        y: 2.08,
        z: localZ,
      }),
      mesh(new THREE.BoxGeometry(0.72, 0.72, 0.05), materials.window, {
        x: 1.25,
        y: 2.08,
        z: localZ,
      }),
    );
  }

  world.add(group);
  movers.push({
    type: "roofTrain",
    lane,
    object: group,
    width: 2.55,
    height: 3.1,
    depth: length,
    roofY: trainRoofY,
  });
}

function createRamp(lane, z) {
  const group = new THREE.Group();
  group.position.set(laneX[lane], 0, z);
  const angle = Math.atan(trainRoofY / rampLength);
  const slope = mesh(new THREE.BoxGeometry(2.18, 0.18, rampLength), materials.ramp, {
    y: trainRoofY / 2,
  });
  slope.rotation.x = angle;
  const leftRail = mesh(new THREE.BoxGeometry(0.12, 0.14, rampLength), materials.rampTrim, {
    x: -1.06,
    y: trainRoofY / 2 + 0.1,
  });
  leftRail.rotation.x = angle;
  const rightRail = leftRail.clone();
  rightRail.position.x = 1.06;
  group.add(slope, leftRail, rightRail);
  world.add(group);
  movers.push({
    type: "ramp",
    lane,
    object: group,
    width: 2.25,
    height: trainRoofY,
    depth: rampLength,
    roofY: trainRoofY,
  });
}

function createMagnet(lane, z, y = 1.5) {
  const group = new THREE.Group();
  group.position.set(laneX[lane], y, z);
  const arc = mesh(new THREE.TorusGeometry(0.42, 0.11, 16, 28, Math.PI), materials.magnetRed, {
    cast: true,
    receive: false,
  });
  arc.rotation.z = Math.PI;
  const leftTip = mesh(new THREE.BoxGeometry(0.22, 0.36, 0.22), materials.magnetBlue, {
    x: -0.42,
    y: -0.18,
    receive: false,
  });
  const rightTip = leftTip.clone();
  rightTip.position.x = 0.42;
  group.add(arc, leftTip, rightTip);
  world.add(group);
  powerups.push({ type: "magnet", lane, object: group, collected: false, baseY: y });
}

function createMultiplier(lane, z, y = 1.5) {
  const group = new THREE.Group();
  group.position.set(laneX[lane], y, z);

  const halo = mesh(new THREE.TorusGeometry(0.62, 0.08, 16, 32), materials.multiplierGreen, {
    receive: false,
  });
  halo.rotation.x = Math.PI / 2;

  const slashA = mesh(new THREE.BoxGeometry(0.16, 0.94, 0.16), materials.multiplierGreen, {
    receive: false,
  });
  slashA.rotation.z = Math.PI / 4;
  const slashB = slashA.clone();
  slashB.rotation.z = -Math.PI / 4;

  const coinA = mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 24), materials.multiplierGold, {
    x: -0.28,
    z: 0.06,
    receive: false,
  });
  coinA.rotation.z = Math.PI / 2;
  const coinB = coinA.clone();
  coinB.position.x = 0.28;
  coinB.position.z = -0.06;

  const badge = new THREE.Sprite(multiplierBadgeMaterial);
  badge.position.z = 0.14;
  badge.scale.set(1.25, 0.62, 1);

  group.add(halo, slashA, slashB, coinA, coinB, badge);
  world.add(group);
  powerups.push({ type: "multiplier", lane, object: group, collected: false, baseY: y });
}

function createBarrier(lane, z) {
  const group = new THREE.Group();
  group.position.set(laneX[lane], 0, z);
  const frame = mesh(new THREE.BoxGeometry(2.1, 1.18, 0.42), materials.barrier, { y: 0.74 });
  const stripeA = mesh(new THREE.BoxGeometry(2.18, 0.16, 0.44), materials.barrierStripe, {
    y: 0.95,
  });
  stripeA.rotation.z = 0.18;
  const stripeB = stripeA.clone();
  stripeB.rotation.z = -0.18;
  stripeB.position.y = 0.48;
  group.add(frame, stripeA, stripeB);
  world.add(group);
  movers.push({ type: "barrier", lane, object: group, width: 2.2, height: 1.25, depth: 0.5 });
}

function createLowSign(lane, z) {
  const group = new THREE.Group();
  group.position.set(laneX[lane], 0, z);
  const leftPost = mesh(new THREE.BoxGeometry(0.16, 2.1, 0.16), materials.sign, {
    x: -1.02,
    y: 1.05,
  });
  const rightPost = leftPost.clone();
  rightPost.position.x = 1.02;
  const beam = mesh(new THREE.BoxGeometry(2.28, 0.34, 0.3), materials.trainAccent, {
    y: 2.05,
  });
  group.add(leftPost, rightPost, beam);
  world.add(group);
  movers.push({ type: "lowSign", lane, object: group, width: 2.3, height: 2.16, depth: 0.42 });
}

function createConeCluster(lane, z) {
  const group = new THREE.Group();
  group.position.set(laneX[lane], 0, z);
  [-0.62, 0, 0.62].forEach((x, index) => {
    const cone = mesh(new THREE.ConeGeometry(0.32, 0.82, 16), materials.cone, {
      x,
      y: 0.41,
      z: (index % 2) * 0.22,
    });
    group.add(cone);
  });
  world.add(group);
  movers.push({ type: "cones", lane, object: group, width: 1.8, height: 0.9, depth: 0.6 });
}

function createCoin(lane, z, y = 1.25) {
  const coin = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 28), materials.coin, {
    x: laneX[lane],
    y,
    z,
  });
  coin.rotation.z = Math.PI / 2;
  world.add(coin);
  coins.push({ lane, object: coin, collected: false, baseY: y, phase: Math.random() * Math.PI * 2 });
}

function createTrainRoute(lane, z) {
  const roofLength = 15.6;
  createRamp(lane, z);
  const roofCenterZ = z - rampLength / 2 - roofLength / 2 + 0.12;
  createRoofTrain(lane, roofCenterZ, roofLength);
  for (let i = 0; i < 7; i += 1) {
    createCoin(lane, roofCenterZ + roofLength / 2 - 1.1 - i * 2, trainRoofY + 1.15);
  }
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function predictedPickupDistance(z) {
  return state.distance + Math.max(0, Math.abs(z - 2) * 0.72);
}

function resetPowerupSchedule() {
  state.nextPowerupDistance = randomRange(firstPowerupDistanceMin, firstPowerupDistanceMax);
  state.nextPowerupType = Math.random() < 0.5 ? "magnet" : "multiplier";
}

function maybeSpawnPowerup(lane, z) {
  if (predictedPickupDistance(z) < state.nextPowerupDistance) return;

  if (state.nextPowerupType === "magnet") {
    createMagnet(lane, z - 5.2);
    state.nextPowerupType = "multiplier";
  } else {
    createMultiplier(lane, z - 5.2);
    state.nextPowerupType = "magnet";
  }

  state.nextPowerupDistance += randomRange(powerupGapMin, powerupGapMax);
}

function spawnPattern(z, { opening = false } = {}) {
  const roll = Math.random();
  const safeLane = Math.floor(Math.random() * 3);
  const blocked = [0, 1, 2].filter((lane) => lane !== safeLane);

  if (!opening && roll < 0.16) {
    createTrainRoute(safeLane, z);
    createTrain(blocked[0], z - 7.6);
    createBarrier(blocked[1], z - 3.4);
    return 31 + Math.random() * 5;
  }

  if (opening && roll < 0.25) {
    createBarrier(blocked[0], z);
    createConeCluster(blocked[1], z - 2.6);
  } else if (opening && roll < 0.5) {
    createLowSign(blocked[0], z);
    createBarrier(blocked[1], z - 3.1);
  } else if (opening && roll < 0.75) {
    createTrain(blocked[0], z);
    createConeCluster(blocked[1], z - 2.4);
  } else if (opening) {
    createTrain(blocked[0], z);
    createLowSign(blocked[1], z - 3.6);
  } else if (roll < 0.34) {
    createTrain(blocked[0], z);
    createBarrier(blocked[1], z - 3.5);
  } else if (roll < 0.56) {
    createLowSign(blocked[0], z);
    createConeCluster(blocked[1], z - 2.2);
  } else if (roll < 0.78) {
    createBarrier(blocked[0], z);
    createBarrier(blocked[1], z - 2.5);
  } else {
    createTrain(blocked[0], z);
    createLowSign(blocked[1], z - 3.8);
  }

  for (let i = 0; i < 5; i += 1) {
    createCoin(safeLane, z - 1.5 - i * 1.8, 1.18 + Math.sin(i * 0.8) * 0.18);
  }

  if (!opening) {
    maybeSpawnPowerup(safeLane, z);
  }

  return opening ? 17 + Math.random() * 8 : 18 + Math.random() * 8;
}

function spawnOpeningSequence() {
  let z = -28 - Math.random() * 7;
  for (let i = 0; i < 4; i += 1) {
    z -= spawnPattern(z, { opening: true });
  }
  state.spawnCursor = z;
}

function createSkyDetails() {
  hazeShell = mesh(
    new THREE.SphereGeometry(72, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffe7bb,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    }),
    { cast: false, receive: false },
  );
  scene.add(hazeShell);

  sunDisc = mesh(
    new THREE.SphereGeometry(4.2, 28, 28),
    new THREE.MeshBasicMaterial({ color: 0xffe2a8, transparent: true, opacity: 0.92 }),
    { x: -18, y: 18, z: -68, cast: false, receive: false },
  );
  scene.add(sunDisc);

  for (let i = 0; i < 8; i += 1) {
    const cloud = new THREE.Group();
    const cloudMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
    });
    [
      { x: -1.1, y: 0.02, scale: 0.92 },
      { x: 0, y: 0.26, scale: 1.18 },
      { x: 1.08, y: 0.04, scale: 0.84 },
    ].forEach((puff) => {
      const sphere = mesh(new THREE.SphereGeometry(1.22 * puff.scale, 18, 18), cloudMaterial, {
        x: puff.x,
        y: puff.y,
        cast: false,
        receive: false,
      });
      sphere.scale.y = 0.58;
      cloud.add(sphere);
    });
    cloud.position.set(-26 + i * 7.6, 10 + (i % 3) * 1.1, -34 - (i % 4) * 9);
    cloud.scale.setScalar(0.78 + (i % 3) * 0.14);
    scene.add(cloud);
    clouds.push(...cloud.children);
  }

  for (let i = 0; i < 42; i += 1) {
    const dust = mesh(
      new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 8, 8),
      new THREE.MeshBasicMaterial({
        color: 0xfff7df,
        transparent: true,
        opacity: 0.45,
      }),
      {
        x: -8 + Math.random() * 16,
        y: 1.2 + Math.random() * 5,
        z: -Math.random() * 70,
        cast: false,
        receive: false,
      },
    );
    scene.add(dust);
    particles.push({ object: dust, drift: -0.2 + Math.random() * 0.4 });
  }
}

function clearWeatherParticles() {
  for (const particle of weatherParticles) {
    scene.remove(particle.object);
    particle.object.geometry.dispose();
  }
  weatherParticles.length = 0;
}

function randomizeWeatherParticle(particle, resetY = false) {
  particle.object.position.x = -9 + Math.random() * 18;
  particle.object.position.y = resetY ? 5.5 + Math.random() * 4.8 : 0.6 + Math.random() * 8.8;
  particle.object.position.z = -68 + Math.random() * 78;
}

function rebuildWeatherParticles(weatherId) {
  clearWeatherParticles();

  if (weatherId === "rain") {
    for (let i = 0; i < 120; i += 1) {
      const drop = mesh(new THREE.BoxGeometry(0.035, 0.62, 0.035), materials.rain, {
        cast: false,
        receive: false,
      });
      scene.add(drop);
      const particle = {
        type: "rain",
        object: drop,
        fallSpeed: 12 + Math.random() * 7,
        drift: -0.4 + Math.random() * 0.8,
      };
      randomizeWeatherParticle(particle);
      weatherParticles.push(particle);
    }
  }

  if (weatherId === "snow") {
    for (let i = 0; i < 96; i += 1) {
      const flake = mesh(new THREE.SphereGeometry(0.055 + Math.random() * 0.045, 8, 8), materials.snow, {
        cast: false,
        receive: false,
      });
      scene.add(flake);
      const particle = {
        type: "snow",
        object: flake,
        fallSpeed: 1.2 + Math.random() * 1.5,
        drift: -0.55 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
      };
      randomizeWeatherParticle(particle);
      weatherParticles.push(particle);
    }
  }
}

function resetWorld() {
  [...movers, ...coins, ...powerups].forEach((entry) => world.remove(entry.object));
  movers.length = 0;
  coins.length = 0;
  powerups.length = 0;
  trackSegments.forEach((segment) => world.remove(segment));
  trackSegments.length = 0;

  for (let i = 0; i < activeDepth; i += 1) {
    createTrackSegment(i);
  }

  spawnOpeningSequence();
  while (state.spawnCursor > -aheadDistance) {
    state.spawnCursor -= spawnPattern(state.spawnCursor);
  }
}

function resetGame() {
  state.running = true;
  state.dead = false;
  state.paused = false;
  state.resumeCountdown = 0;
  state.resumeCountdownTimer = 0;
  state.lane = 1;
  state.laneTarget = 0;
  state.verticalVelocity = 0;
  state.y = 0;
  state.surfaceY = 0;
  state.sliding = false;
  state.slideTimer = 0;
  state.distance = 0;
  state.coins = 0;
  state.speed = worldSpeedStart;
  state.shakeTimer = 0;
  state.shakeStrength = 0;
  state.magnetTimer = 0;
  state.multiplierTimer = 0;
  resetPowerupSchedule();
  runner.position.set(0, 0, 2);
  runner.scale.set(1, 1, 1);
  resetCameraPose();
  applyCharacterStyle(state.selectedCharacter);
  for (const effect of effects) {
    scene.remove(effect.object);
  }
  effects.length = 0;
  resetWorld();
  updateHud();
  pauseButton.hidden = false;
  pauseScreen.classList.remove("visible");
  countdownScreen.classList.remove("visible");
}

function goHome() {
  state.running = false;
  state.dead = false;
  state.paused = false;
  state.resumeCountdown = 0;
  state.resumeCountdownTimer = 0;
  state.lane = 1;
  state.laneTarget = 0;
  state.verticalVelocity = 0;
  state.y = 0;
  state.surfaceY = 0;
  state.sliding = false;
  state.slideTimer = 0;
  state.distance = 0;
  state.coins = 0;
  state.speed = worldSpeedStart;
  state.shakeTimer = 0;
  state.shakeStrength = 0;
  state.magnetTimer = 0;
  state.multiplierTimer = 0;
  resetPowerupSchedule();
  runner.position.set(0, 0, 2);
  runner.scale.set(1, 1, 1);
  resetCameraPose();
  for (const effect of effects) {
    scene.remove(effect.object);
  }
  effects.length = 0;
  resetWorld();
  updateHud();
  closeMenus();
  gameOverScreen.classList.remove("visible");
  pauseScreen.classList.remove("visible");
  countdownScreen.classList.remove("visible");
  startScreen.classList.add("visible");
  pauseButton.hidden = true;
}

function updateHud() {
  distanceEl.textContent = `${Math.floor(state.distance)}m`;
  coinsEl.textContent = String(state.coins);
  speedEl.textContent = `${Math.floor(state.speed * 0.621371)} mph`;
  magnetStatusEl.hidden = state.magnetTimer <= 0 || state.dead || !state.running;
  magnetTimeEl.textContent = `${Math.ceil(state.magnetTimer)}s`;
  multiplierStatusEl.hidden = state.multiplierTimer <= 0 || state.dead || !state.running;
  multiplierTimeEl.textContent = `${Math.ceil(state.multiplierTimer)}s`;
}

function jump() {
  if (!state.running || state.paused || state.resumeCountdown > 0 || state.y > state.surfaceY + 0.02 || state.sliding) {
    return;
  }
  state.verticalVelocity = 10.2;
  playJumpSound();
  spawnJumpEffect();
}

function slide() {
  if (!state.running || state.paused || state.resumeCountdown > 0 || state.y > state.surfaceY + 0.02 || state.sliding) {
    return;
  }
  state.sliding = true;
  state.slideTimer = 0.72;
}

function moveLane(direction) {
  if (!state.running || state.paused || state.resumeCountdown > 0) return;
  state.lane = THREE.MathUtils.clamp(state.lane + direction, 0, 2);
}

function handleAction(action) {
  if (action === "left") moveLane(-1);
  if (action === "right") moveLane(1);
  if (action === "jump") jump();
  if (action === "slide") slide();
}

function animateRunner(time, delta) {
  const cadence = time * (6.8 + state.speed * 0.09);
  const { torso, head, leftArm, rightArm, leftLeg, rightLeg, leftShoe, rightShoe } = runner.userData;
  const swing = Math.sin(cadence) * 0.56;
  leftArm.rotation.x = swing;
  rightArm.rotation.x = -swing;
  leftLeg.rotation.x = -swing;
  rightLeg.rotation.x = swing;
  leftShoe.rotation.x = swing * 0.35;
  rightShoe.rotation.x = -swing * 0.35;
  torso.position.y = state.sliding ? 1.08 : 1.55 + Math.abs(Math.sin(cadence)) * 0.06;
  head.position.y = state.sliding ? 1.66 : 2.42 + Math.abs(Math.sin(cadence)) * 0.05;
  runner.rotation.z = THREE.MathUtils.lerp(runner.rotation.z, (laneX[state.lane] - runner.position.x) * -0.05, 0.12);
  runner.position.y = state.y;
  runner.scale.y = THREE.MathUtils.lerp(runner.scale.y, state.sliding ? 0.7 : 1, delta * 14);
}

function updateTrack(delta) {
  const dz = state.speed * delta;
  for (const segment of trackSegments) {
    segment.position.z += dz;
    if (segment.position.z > segmentLength) {
      const farthest = Math.min(...trackSegments.map((item) => item.position.z));
      segment.position.z = farthest - segmentLength;
    }
  }
}

function updateMovers(delta) {
  const dz = state.speed * delta;
  for (let i = movers.length - 1; i >= 0; i -= 1) {
    const mover = movers[i];
    mover.object.position.z += dz;
    if (mover.object.position.z > 12) {
      world.remove(mover.object);
      movers.splice(i, 1);
    }
  }

  for (let i = coins.length - 1; i >= 0; i -= 1) {
    const coin = coins[i];
    coin.object.position.z += dz;
    coin.object.rotation.y += delta * 6;
    if (!coin.magnetized) {
      coin.object.position.y = coin.baseY + Math.sin(performance.now() * 0.003 + coin.phase) * 0.12;
    }
    if (coin.object.position.z > 12) {
      world.remove(coin.object);
      coins.splice(i, 1);
    }
  }

  for (let i = powerups.length - 1; i >= 0; i -= 1) {
    const powerup = powerups[i];
    powerup.object.position.z += dz;
    powerup.object.rotation.y += delta * 3.6;
    powerup.object.position.y = powerup.baseY + Math.sin(performance.now() * 0.004 + i) * 0.14;
    if (powerup.object.position.z > 12) {
      world.remove(powerup.object);
      powerups.splice(i, 1);
    }
  }

  state.spawnCursor += dz;
  while (state.spawnCursor > -aheadDistance) {
    state.spawnCursor -= spawnPattern(state.spawnCursor);
  }
}

function rampHeightAtPlayer(mover) {
  const localZ = 2 - mover.object.position.z;
  const progress = THREE.MathUtils.clamp((rampLength / 2 - localZ) / rampLength, 0, 1);
  return progress * mover.roofY;
}

function getSurfaceHeightAtPlayer() {
  let surfaceY = 0;
  const playerLane = state.lane;

  for (const mover of movers) {
    if (mover.lane !== playerLane || !overlapsZ(mover.object.position.z, mover.depth)) continue;

    if (mover.type === "ramp") {
      surfaceY = Math.max(surfaceY, rampHeightAtPlayer(mover));
    }

    if ((mover.type === "train" || mover.type === "roofTrain") && (state.y >= trainRoofY - 0.42 || state.surfaceY > 0.5)) {
      surfaceY = Math.max(surfaceY, trainRoofY);
    }
  }

  return surfaceY;
}

function updatePhysics(delta) {
  state.laneTarget = laneX[state.lane];
  runner.position.x = THREE.MathUtils.damp(runner.position.x, state.laneTarget, 12, delta);
  const surfaceY = getSurfaceHeightAtPlayer();
  state.surfaceY = surfaceY;

  if (state.y > surfaceY || state.verticalVelocity > 0) {
    state.verticalVelocity -= 24 * delta;
    state.y = Math.max(surfaceY, state.y + state.verticalVelocity * delta);
    if (state.y === surfaceY) state.verticalVelocity = 0;
  } else {
    state.y = surfaceY;
  }

  if (state.sliding) {
    state.slideTimer -= delta;
    if (state.slideTimer <= 0) {
      state.sliding = false;
    }
  }
}

function overlapsZ(z, depth) {
  return Math.abs(z - 2) < depth / 2 + 0.48;
}

function handleCollisions() {
  const playerLane = state.lane;
  const onRampApproach = movers.some(
    (mover) =>
      mover.type === "ramp" &&
      mover.lane === playerLane &&
      overlapsZ(mover.object.position.z, mover.depth) &&
      rampHeightAtPlayer(mover) > 0.05,
  );
  for (const mover of movers) {
    if (mover.lane !== playerLane || !overlapsZ(mover.object.position.z, mover.depth)) continue;

    if (
      (mover.type === "train" || mover.type === "roofTrain") &&
      state.y < trainRoofY - 0.45 &&
      !onRampApproach
    ) {
      endGame();
      return;
    }

    if ((mover.type === "barrier" || mover.type === "cones") && state.y - state.surfaceY < 1.05) {
      endGame();
      return;
    }

    if (mover.type === "lowSign" && state.y < 1.65 && !state.sliding) {
      endGame();
      return;
    }
  }

  for (const powerup of powerups) {
    if (powerup.collected || powerup.lane !== playerLane) continue;
    const closeEnough = Math.abs(powerup.object.position.z - 2) < 0.9;
    const verticalReach = Math.abs(powerup.object.position.y - (1.35 + state.y)) < 1.15;
    if (closeEnough && verticalReach) {
      powerup.collected = true;
      powerup.object.visible = false;
      if (powerup.type === "magnet") {
        state.magnetTimer = 5 + Math.random() * 5;
      } else if (powerup.type === "multiplier") {
        state.multiplierTimer = 5 + Math.random() * 5;
      }
      playPowerupSound();
      spawnBurst({
        x: powerup.object.position.x,
        y: powerup.object.position.y,
        z: powerup.object.position.z,
        count: 12,
        colorMaterial: materials.sparkle,
        radius: 0.08,
        spread: 1.35,
        lift: 0.88,
        life: 0.5,
      });
    }
  }

  for (const coin of coins) {
    if (coin.collected) continue;
    const laneMatches = coin.lane === playerLane;
    const closeEnough = Math.abs(coin.object.position.z - 2) < 0.8;
    const verticalReach = Math.abs(coin.object.position.y - (1.2 + state.y)) < 1.05;
    if (!laneMatches && state.magnetTimer <= 0) continue;
    if (closeEnough && verticalReach) {
      collectCoin(coin);
    }
  }
}

function collectCoin(coin) {
  if (coin.collected) return;
  coin.collected = true;
  state.coins += state.multiplierTimer > 0 ? 2 : 1;
  playCoinSound();
  spawnCoinEffect(coin);
  coin.object.visible = false;
}

function updateMagnet(delta) {
  if (state.magnetTimer <= 0) return;
  state.magnetTimer = Math.max(0, state.magnetTimer - delta);
  const target = new THREE.Vector3(runner.position.x, 1.2 + state.y, 2);

  for (const coin of coins) {
    if (coin.collected) continue;
    const distance = coin.object.position.distanceTo(target);
    if (distance > 13) continue;
    coin.magnetized = true;
    coin.object.position.lerp(target, 1 - Math.exp(-delta * 9));
    if (coin.object.position.distanceTo(target) < 0.7) {
      collectCoin(coin);
    }
  }

  if (state.magnetTimer === 0) {
    for (const coin of coins) {
      if (coin.collected) continue;
      coin.magnetized = false;
      coin.object.position.x = laneX[coin.lane];
    }
  }
}

function updateMultiplier(delta) {
  if (state.multiplierTimer <= 0) return;
  state.multiplierTimer = Math.max(0, state.multiplierTimer - delta);
}

function updateCamera(delta) {
  const desiredX = runner.position.x * 0.36;
  let shakeX = 0;
  let shakeY = 0;
  if (state.shakeTimer > 0) {
    state.shakeTimer = Math.max(0, state.shakeTimer - delta);
    const intensity = state.shakeStrength * (state.shakeTimer / 0.45);
    shakeX = (Math.random() - 0.5) * intensity;
    shakeY = (Math.random() - 0.5) * intensity;
  }
  camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredX + shakeX, 4.5, delta);
  camera.position.y = THREE.MathUtils.damp(
    camera.position.y,
    cameraProfile.baseY + state.y * 0.34 + shakeY,
    4.5,
    delta,
  );
  camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraProfile.baseZ, 4.5, delta);
  camera.fov = THREE.MathUtils.damp(
    camera.fov,
    cameraProfile.baseFov + (state.speed - worldSpeedStart) * 0.22,
    2.4,
    delta,
  );
  camera.updateProjectionMatrix();
  camera.lookAt(runner.position.x * 0.22, cameraProfile.lookY + state.y * 0.42, -18);
}

function updateParticles(delta) {
  for (const particle of particles) {
    particle.object.position.z += state.speed * delta * 0.34;
    particle.object.position.x += particle.drift * delta;
    if (particle.object.position.z > 12) {
      particle.object.position.z = -72;
      particle.object.position.x = -8 + Math.random() * 16;
      particle.object.position.y = 1.2 + Math.random() * 5;
    }
  }
}

function updateWeatherParticles(delta) {
  const time = performance.now() * 0.001;
  for (const particle of weatherParticles) {
    if (particle.type === "rain") {
      particle.object.position.y -= particle.fallSpeed * delta;
      particle.object.position.x += particle.drift * delta;
      particle.object.position.z += state.speed * delta * 0.08;
      if (particle.object.position.y < 0.15 || particle.object.position.z > 10) {
        randomizeWeatherParticle(particle, true);
      }
    }

    if (particle.type === "snow") {
      particle.object.position.y -= particle.fallSpeed * delta;
      particle.object.position.x += (particle.drift + Math.sin(time + particle.phase) * 0.34) * delta;
      particle.object.position.z += state.speed * delta * 0.025;
      if (particle.object.position.y < 0.15 || particle.object.position.z > 10) {
        randomizeWeatherParticle(particle, true);
      }
    }
  }
}

function updateEffects(delta) {
  for (let i = effects.length - 1; i >= 0; i -= 1) {
    const effect = effects[i];
    effect.life -= delta;
    effect.velocity.y -= 3.8 * delta;
    effect.object.position.addScaledVector(effect.velocity, delta);
    effect.object.scale.multiplyScalar(1 + delta * 1.8);
    effect.object.material.opacity = Math.max(0, effect.life / effect.maxLife);
    if (effect.life <= 0) {
      scene.remove(effect.object);
      effect.object.geometry.dispose();
      effect.object.material.dispose();
      effects.splice(i, 1);
    }
  }
}

function endGame() {
  if (state.dead) return;
  state.running = false;
  state.dead = true;
  state.paused = false;
  state.resumeCountdown = 0;
  state.shakeTimer = 0.45;
  state.shakeStrength = 0.7;
  playCrashSound();
  spawnImpactEffect();
  finalScoreEl.textContent = `${Math.floor(state.distance)}m • ${state.coins} coins`;
  magnetStatusEl.hidden = true;
  multiplierStatusEl.hidden = true;
  pauseButton.hidden = true;
  pauseScreen.classList.remove("visible");
  countdownScreen.classList.remove("visible");
  gameOverScreen.classList.add("visible");
}

function pauseGame() {
  if (!state.running || state.dead || state.paused || state.resumeCountdown > 0) return;
  state.paused = true;
  pauseScreen.classList.add("visible");
  pauseButton.hidden = true;
}

function startResumeCountdown() {
  if (!state.running || !state.paused) return;
  state.paused = false;
  state.resumeCountdown = 3;
  state.resumeCountdownTimer = 0;
  countdownValueEl.textContent = "3";
  pauseScreen.classList.remove("visible");
  countdownScreen.classList.add("visible");
}

function updateResumeCountdown(delta) {
  state.resumeCountdownTimer += delta;
  const nextValue = Math.max(0, 3 - Math.floor(state.resumeCountdownTimer));
  state.resumeCountdown = nextValue;
  if (nextValue > 0) {
    countdownValueEl.textContent = String(nextValue);
    return;
  }

  countdownScreen.classList.remove("visible");
  pauseButton.hidden = false;
}

function tick() {
  const delta = Math.min(clock.getDelta(), 0.033);
  const elapsed = clock.elapsedTime;

  if (state.running && state.resumeCountdown > 0) {
    updateResumeCountdown(delta);
  } else if (state.running && !state.paused) {
    state.distance += state.speed * delta * 0.72;
    state.speed = Math.min(42, worldSpeedStart + state.distance * 0.018);
    updateTrack(delta);
    updateMovers(delta);
    updatePhysics(delta);
    animateRunner(elapsed, delta);
    updateMagnet(delta);
    updateMultiplier(delta);
    handleCollisions();
    updateCamera(delta);
    updateParticles(delta);
    updateWeatherParticles(delta);
    updateEffects(delta);
    updateHud();
  } else if (!state.running) {
    animateRunner(elapsed, delta);
    updateParticles(delta * 0.2);
    updateWeatherParticles(delta);
    updateEffects(delta);
    updateCamera(delta);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

function onKeyDown(event) {
  ensureAudio();
  if (event.code === "KeyP" || event.code === "Escape") {
    if (state.paused) {
      startResumeCountdown();
    } else {
      pauseGame();
    }
    return;
  }
  if (event.code === "ArrowLeft" || event.code === "KeyA") moveLane(-1);
  if (event.code === "ArrowRight" || event.code === "KeyD") moveLane(1);
  if (event.code === "ArrowUp" || event.code === "KeyW" || event.code === "Space") jump();
  if (event.code === "ArrowDown" || event.code === "KeyS") slide();
}

function onResize() {
  cameraProfile = getCameraProfile();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function startSwipe(event) {
  if (event.pointerType === "mouse") return;
  ensureAudio();
  swipeState.active = true;
  swipeState.pointerId = event.pointerId;
  swipeState.startX = event.clientX;
  swipeState.startY = event.clientY;
  canvas.setPointerCapture?.(event.pointerId);
}

function finishSwipe(event) {
  if (!swipeState.active || event.pointerId !== swipeState.pointerId) return;

  const deltaX = event.clientX - swipeState.startX;
  const deltaY = event.clientY - swipeState.startY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  swipeState.active = false;
  swipeState.pointerId = null;

  if (Math.max(absX, absY) < 28) return;

  if (absX > absY) {
    handleAction(deltaX < 0 ? "left" : "right");
    return;
  }

  handleAction(deltaY < 0 ? "jump" : "slide");
}

function cancelSwipe(event) {
  if (event.pointerId !== swipeState.pointerId) return;
  swipeState.active = false;
  swipeState.pointerId = null;
}

window.addEventListener("keydown", onKeyDown);
window.addEventListener("resize", onResize);
canvas.addEventListener("pointerdown", startSwipe);
canvas.addEventListener("pointerup", finishSwipe);
canvas.addEventListener("pointercancel", cancelSwipe);

startButton.addEventListener("click", () => {
  ensureAudio();
  closeMenus();
  startScreen.classList.remove("visible");
  gameOverScreen.classList.remove("visible");
  resetGame();
});

restartButton.addEventListener("click", () => {
  ensureAudio();
  gameOverScreen.classList.remove("visible");
  resetGame();
});

homeButton.addEventListener("click", () => {
  ensureAudio();
  goHome();
});

pauseButton.addEventListener("click", () => {
  ensureAudio();
  pauseGame();
});

resumeButton.addEventListener("click", () => {
  ensureAudio();
  startResumeCountdown();
});

pauseHomeButton.addEventListener("click", () => {
  ensureAudio();
  goHome();
});

characterMenuButton.addEventListener("click", () => {
  ensureAudio();
  const shouldOpen = characterMenu.hidden;
  setMenuOpen("character", shouldOpen);
});

weatherMenuButton.addEventListener("click", () => {
  ensureAudio();
  const shouldOpen = weatherMenu.hidden;
  setMenuOpen("weather", shouldOpen);
});

mobileButtons.forEach((button) => {
  button.addEventListener("pointerdown", () => {
    ensureAudio();
    handleAction(button.dataset.action);
  });
});

characterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    ensureAudio();
    selectCharacter(button.dataset.character);
    closeMenus();
  });
});

weatherButtons.forEach((button) => {
  button.addEventListener("click", () => {
    ensureAudio();
    selectWeather(button.dataset.weather);
    closeMenus();
  });
});

impactFlashEl.addEventListener("animationend", () => impactFlashEl.classList.remove("active"));

createSkyDetails();
selectCharacter(state.selectedCharacter);
selectWeather(state.selectedWeather);
resetWorld();
updateHud();
tick();

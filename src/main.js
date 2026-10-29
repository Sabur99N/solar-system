import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PLANETS, SUN, ASTEROID_BELT, KUIPER_BELT } from './data/planets.js';
import { Sun } from './objects/Sun.js';
import { Planet } from './objects/Planet.js';
import { Starfield } from './objects/Starfield.js';
import { MilkyWay } from './objects/MilkyWay.js';
import { InterstellarEffects } from './objects/InterstellarEffects.js';
import { AsteroidBelt } from './objects/AsteroidBelt.js';
import { createComposer } from './systems/PostProcessing.js';
import { CameraController } from './systems/CameraController.js';
import { initOverlay } from './ui/Overlay.js';
import { InfoPanel } from './ui/InfoPanel.js';
import { Hud } from './ui/Hud.js';

// ─── Renderer ───────────────────────────────────────────────
const canvas = document.querySelector('canvas.webgl');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
  alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = false;

// ─── Scene / Camera ─────────────────────────────────────────
const scene = new THREE.Scene();

const milkyWay = new MilkyWay(1100);
milkyWay.applyAsBackground(scene);

const starfield = new Starfield(9000, 2400);
scene.add(starfield.points);

const interstellar = new InterstellarEffects({ radius: 2000, cometCount: 10 });
scene.add(interstellar.group);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  2500
);
camera.position.set(0, 32, 110);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 10;
controls.maxDistance = 450;
controls.maxPolarAngle = Math.PI;
controls.minPolarAngle = 0;
controls.target.set(0, 0, 0);

const cameraCtrl = new CameraController(camera, controls);

// ─── Celestial bodies ───────────────────────────────────────
const textureLoader = new THREE.TextureLoader();
const sun = new Sun(textureLoader, SUN);
scene.add(sun.group);
scene.add(sun.fill);

const lightPos = new THREE.Vector3(0, 0, 0);
const planets = PLANETS.map((data) => {
  const planet = new Planet(data, lightPos);
  scene.add(planet.group);
  scene.add(planet.orbit);
  return planet;
});

const asteroidBelt = new AsteroidBelt(ASTEROID_BELT);
scene.add(asteroidBelt.points);

const kuiperBelt = new AsteroidBelt({ ...KUIPER_BELT, color: 0x6a7a90, ySpread: 3 });
kuiperBelt.speed = 0.004;
scene.add(kuiperBelt.points);

// Soft hemisphere light for depth
scene.add(new THREE.HemisphereLight(0x1a2744, 0x08060a, 0.25));

// ─── Post-processing ────────────────────────────────────────
const { composer, resize: resizeComposer } = createComposer(renderer, scene, camera);

// ─── UI ─────────────────────────────────────────────────────
let orbitsVisible = true;
let simulationActive = true;

function showOverview() {
  planets.forEach((p) => {
    p.setVisible(true);
    if (p.orbit) p.orbit.visible = orbitsVisible;
  });
  cameraCtrl.overview();
  hud.setActive(null);
}

const infoPanel = new InfoPanel({ onClose: showOverview });

const hud = new Hud({
  onSelect: (id) => focusPlanet(id),
  onReset: () => {
    if (infoPanel.isOpen) infoPanel.close();
    else showOverview();
  },
  onToggleOrbits: (visible) => {
    orbitsVisible = visible;
    planets.forEach((p) => {
      if (p.orbit) p.orbit.visible = visible && p.group.visible;
    });
  },
});

initOverlay({
  onExplore: () => {
    document.getElementById('hud')?.classList.add('is-visible');
    document.getElementById('hint')?.classList.add('is-visible');
  },
});

function focusPlanet(id) {
  const planet = planets.find((p) => p.data.id === id);
  if (!planet) return;

  // Keep the whole system visible — just fly to this world
  planets.forEach((p) => {
    p.setVisible(true);
    if (p.orbit) p.orbit.visible = orbitsVisible;
  });

  // Extra distance so rings, moons, and atmosphere stay fully framed
  const framing = Math.max(planet.data.size * 11, 14) + 6;
  cameraCtrl.focusOn(planet.group, framing);
  infoPanel.open(planet);
  hud.setActive(id);
}

// ─── Picking ────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const pickables = planets.flatMap((p) => p.pickable);

function onPointerDown(event) {
  if (!document.querySelector('.overlay.is-hidden')) return;
  // Ignore UI clicks (side panel / HUD stay interactive)
  if (event.target.closest('#hud, #info, .overlay')) return;

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(pickables, false);
  if (!hits.length) return;

  const id = hits[0].object.userData.planetId;
  if (id) focusPlanet(id);
}

canvas.addEventListener('pointerdown', onPointerDown);

// ─── Resize ─────────────────────────────────────────────────
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  resizeComposer(w, h);
  starfield.setPixelRatio(renderer.getPixelRatio());
  interstellar.setPixelRatio(renderer.getPixelRatio());
}
window.addEventListener('resize', onResize);

// ─── Animation loop ─────────────────────────────────────────
const clock = new THREE.Clock();
let elapsed = 0;

function tick() {
  const delta = Math.min(clock.getDelta(), 0.05);
  const scale = hud.getTimeScale?.() ?? 1;
  const dt = delta * scale;
  elapsed += dt;

  if (simulationActive) {
    sun.update(elapsed);
    planets.forEach((p) => p.update(elapsed, dt));
    asteroidBelt.update(dt);
    kuiperBelt.update(dt);
    milkyWay.update(dt);
    starfield.update(elapsed);
    interstellar.update(elapsed);
    cameraCtrl.update();
  }

  controls.update();
  composer.render();
  requestAnimationFrame(tick);
}

tick();

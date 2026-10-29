import * as THREE from 'three';
import { starVertexShader, starFragmentShader } from '../shaders/stars.js';

export class Starfield {
  constructor(count = 9000, radius = 2400) {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const brightness = new Float32Array(count);

    const tilt = THREE.MathUtils.degToRad(62);
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);

    for (let i = 0; i < count; i++) {
      const alongGalaxy = Math.random() < 0.45;
      let x;
      let y;
      let z;

      if (alongGalaxy) {
        const theta = Math.random() * Math.PI * 2;
        const r = radius * (0.88 + Math.random() * 0.12);
        const band = (Math.random() - 0.5) * 0.22;
        const phi = Math.PI / 2 + band;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.cos(phi);
        z = r * Math.sin(phi) * Math.sin(theta);
        const yy = y * cosT - z * sinT;
        const zz = y * sinT + z * cosT;
        y = yy;
        z = zz;
      } else {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = radius * (0.85 + Math.random() * 0.15);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      // 1px dots mostly; rare slightly brighter pin
      sizes[i] = Math.random() < 0.08 ? 1.4 : 1.0;
      brightness[i] = 0.15 + Math.random() * 0.28;
      phases[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aBrightness', new THREE.BufferAttribute(brightness, 1));

    this.uniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uBrightnessScale: { value: 0.55 },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      fog: false,
    });

    this.points = new THREE.Points(geo, mat);
    this.points.renderOrder = -5;
    this.points.frustumCulled = false;
  }

  update(elapsed) {
    this.uniforms.uTime.value = elapsed;
  }

  setPixelRatio(ratio) {
    this.uniforms.uPixelRatio.value = Math.min(ratio, 2);
  }
}

import * as THREE from 'three';
import {
  cometVertexShader,
  cometFragmentShader,
  cometTrailVertexShader,
  cometTrailFragmentShader,
} from '../shaders/stars.js';

/** Occasional faint shooting stars — no big dust blobs */
export class InterstellarEffects {
  constructor({ radius = 2000, cometCount = 10 } = {}) {
    this.group = new THREE.Group();
    this.group.name = 'InterstellarEffects';
    this._createComets(radius, cometCount);
  }

  _createComets(radius, count) {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const speeds = new Float32Array(count);
    const lengths = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.75 + Math.random() * 0.2);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      seeds[i] = Math.random();
      speeds[i] = 0.4 + Math.random() * 0.5;
      lengths[i] = 60 + Math.random() * 100;
    }

    const headGeo = new THREE.BufferGeometry();
    headGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    headGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    headGeo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    headGeo.setAttribute('aLength', new THREE.BufferAttribute(lengths, 1));

    this.headUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    };

    this.heads = new THREE.Points(
      headGeo,
      new THREE.ShaderMaterial({
        uniforms: this.headUniforms,
        vertexShader: cometVertexShader,
        fragmentShader: cometFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      })
    );
    this.heads.frustumCulled = false;
    this.group.add(this.heads);

    const trailPer = 6;
    const tCount = count * trailPer;
    const tPos = new Float32Array(tCount * 3);
    const tSeed = new Float32Array(tCount);
    const tSpeed = new Float32Array(tCount);
    const tLen = new Float32Array(tCount);
    const tTrail = new Float32Array(tCount);

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < trailPer; j++) {
        const idx = i * trailPer + j;
        tPos[idx * 3] = positions[i * 3];
        tPos[idx * 3 + 1] = positions[i * 3 + 1];
        tPos[idx * 3 + 2] = positions[i * 3 + 2];
        tSeed[idx] = seeds[i];
        tSpeed[idx] = speeds[i];
        tLen[idx] = lengths[i];
        tTrail[idx] = (j + 1) / trailPer;
      }
    }

    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(tPos, 3));
    trailGeo.setAttribute('aSeed', new THREE.BufferAttribute(tSeed, 1));
    trailGeo.setAttribute('aSpeed', new THREE.BufferAttribute(tSpeed, 1));
    trailGeo.setAttribute('aLength', new THREE.BufferAttribute(tLen, 1));
    trailGeo.setAttribute('aTrail', new THREE.BufferAttribute(tTrail, 1));

    this.trailUniforms = { uTime: { value: 0 } };
    this.trails = new THREE.Points(
      trailGeo,
      new THREE.ShaderMaterial({
        uniforms: this.trailUniforms,
        vertexShader: cometTrailVertexShader,
        fragmentShader: cometTrailFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      })
    );
    this.trails.frustumCulled = false;
    this.group.add(this.trails);
  }

  update(elapsed) {
    this.headUniforms.uTime.value = elapsed;
    this.trailUniforms.uTime.value = elapsed;
  }

  setPixelRatio(ratio) {
    this.headUniforms.uPixelRatio.value = Math.min(ratio, 2);
  }
}

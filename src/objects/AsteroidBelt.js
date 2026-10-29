import * as THREE from 'three';

export class AsteroidBelt {
  constructor({ inner, outer, count, color = 0x8a8070, ySpread = 1.2 }) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const base = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = THREE.MathUtils.lerp(inner, outer, Math.random());
      const y = (Math.random() - 0.5) * ySpread;

      positions[i * 3] = Math.cos(angle) * distance;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * distance;

      const shade = 0.55 + Math.random() * 0.45;
      colors[i * 3] = base.r * shade;
      colors[i * 3 + 1] = base.g * shade;
      colors[i * 3 + 2] = base.b * shade;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.points = new THREE.Points(geo, mat);
    this.speed = 0.015;
  }

  update(delta) {
    this.points.rotation.y += this.speed * delta;
  }
}

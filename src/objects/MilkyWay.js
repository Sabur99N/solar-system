import * as THREE from 'three';

/**
 * Dim equirectangular deep-space backdrop — tiny stars only, soft nebula.
 */
export class MilkyWay {
  constructor(radius = 900) {
    this.texture = this._bakeGalaxyTexture(2048, 1024);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.mapping = THREE.EquirectangularReflectionMapping;
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;
    this.texture.needsUpdate = true;

    const geo = new THREE.SphereGeometry(radius, 64, 32);
    const mat = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -20;
    this.mesh.rotation.z = THREE.MathUtils.degToRad(58);
    this.mesh.rotation.y = THREE.MathUtils.degToRad(20);
  }

  applyAsBackground(scene) {
    scene.background = this.texture;
  }

  _bakeGalaxyTexture(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#010208';
    ctx.fillRect(0, 0, w, h);

    // Very soft, dim nebula (won't compete with planets)
    for (let i = 0; i < 28; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 80 + Math.random() * 200;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(40,60,120,0.07)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    const bandY = h * 0.5;
    const bandH = h * 0.2;
    for (let x = 0; x < w; x += 2) {
      const warp = Math.sin(x * 0.007) * 30 + Math.sin(x * 0.019) * 14;
      for (let dy = -bandH; dy < bandH; dy += 2) {
        const y = bandY + warp + dy;
        if (y < 0 || y >= h) continue;
        const t = 1 - Math.abs(dy) / bandH;
        const dust = Math.pow(t, 1.6) * 0.18;
        ctx.fillStyle = `rgba(70,85,140,${dust})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Tiny 1px stars only — dim
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const bright = 0.12 + Math.random() * 0.28;
      ctx.fillStyle = `rgba(220,230,255,${bright})`;
      ctx.fillRect(x, y, 1, 1);
    }

    return new THREE.CanvasTexture(canvas);
  }

  update(delta) {
    if (this.texture) {
      this.texture.offset.x = (this.texture.offset.x + delta * 0.0015) % 1;
    }
  }
}

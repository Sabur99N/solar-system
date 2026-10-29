import * as THREE from 'three';
import {
  sunVertexShader,
  sunFragmentShader,
  sunAtmosphereVertex,
  sunAtmosphereFragment,
} from '../shaders/sun.js';

export class Sun {
  constructor(loader, data) {
    this.group = new THREE.Group();
    this.group.name = 'Sun';
    this.uniforms = {
      uTime: { value: 0 },
      uTexture: { value: null },
      uColorCore: { value: new THREE.Color('#ff6b00') },
      uColorHot: { value: new THREE.Color('#fff2a8') },
    };

    const texture = loader.load(data.texture);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.uniforms.uTexture.value = texture;

    const geo = new THREE.SphereGeometry(data.radius, 96, 96);
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: sunVertexShader,
      fragmentShader: sunFragmentShader,
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.group.add(this.mesh);

    // Inner corona
    this.glowUniforms = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#ff9a3c') },
    };
    const glowMat = new THREE.ShaderMaterial({
      uniforms: this.glowUniforms,
      vertexShader: sunAtmosphereVertex,
      fragmentShader: sunAtmosphereFragment,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.glow = new THREE.Mesh(
      new THREE.SphereGeometry(data.radius * 1.2, 64, 64),
      glowMat
    );
    this.group.add(this.glow);

    // Outer soft halo — always-on bloom fuel
    const haloMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: this.glowUniforms.uTime,
        uColor: { value: new THREE.Color('#ffb347') },
      },
      vertexShader: sunAtmosphereVertex,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 4.0);
          gl_FragColor = vec4(uColor * fresnel * 1.6, fresnel * 0.55);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.halo = new THREE.Mesh(
      new THREE.SphereGeometry(data.radius * 1.55, 48, 48),
      haloMat
    );
    this.group.add(this.halo);

    // Billboard sprite for stable screen-space glow
    const spriteMap = this._createGlowSprite();
    const spriteMat = new THREE.SpriteMaterial({
      map: spriteMap,
      color: 0xffc266,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.85,
    });
    this.sprite = new THREE.Sprite(spriteMat);
    this.sprite.scale.set(data.radius * 5.5, data.radius * 5.5, 1);
    this.group.add(this.sprite);

    this.light = new THREE.PointLight(0xfff0d0, 1400, 500, 1.5);
    this.light.castShadow = false;
    this.group.add(this.light);

    this.fill = new THREE.AmbientLight(0x1a1a2e, 0.4);
  }

  _createGlowSprite() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255, 250, 220, 1)');
    g.addColorStop(0.15, 'rgba(255, 200, 80, 0.9)');
    g.addColorStop(0.4, 'rgba(255, 140, 40, 0.35)');
    g.addColorStop(0.7, 'rgba(255, 100, 20, 0.08)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  update(elapsed) {
    this.uniforms.uTime.value = elapsed;
    this.glowUniforms.uTime.value = elapsed;
    this.mesh.rotation.y = elapsed * 0.04;
  }
}

import * as THREE from 'three';
import { orbitalSpeed, spinSpeed } from '../data/planets.js';
import {
  atmosphereVertexShader,
  atmosphereFragmentShader,
  earthVertexShader,
  earthFragmentShader,
  ringVertexShader,
  ringFragmentShader,
} from '../shaders/atmosphere.js';

const sharedLoader = new THREE.TextureLoader();

function loadMap(path) {
  const tex = sharedLoader.load(path);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export class Planet {
  /**
   * @param {object} data - planet definition from planets.js
   * @param {THREE.Vector3} lightPos - sun light position (usually origin)
   */
  constructor(data, lightPos = new THREE.Vector3(0, 0, 0)) {
    this.data = data;
    this.group = new THREE.Group();
    this.group.name = data.name;
    this.orbitSpeed = orbitalSpeed(data.orbitPeriodDays);
    this.spin = spinSpeed(data.rotationPeriodHours);
    this.angle = Math.random() * Math.PI * 2;
    this.lightPos = lightPos;
    this.moons = [];
    this.pickable = [];

    // Pivot for axial tilt
    this.tiltGroup = new THREE.Group();
    this.tiltGroup.rotation.z = THREE.MathUtils.degToRad(data.axialTilt || 0);
    this.group.add(this.tiltGroup);

    this._createBody();
    this._createAtmosphere();
    if (data.hasRings) this._createRings();
    this._createMoons();
    this._createOrbit();
  }

  _createBody() {
    const { data } = this;
    const geo = new THREE.SphereGeometry(data.size, 64, 64);

    if (data.id === 'earth') {
      this.uniforms = {
        uDayMap: { value: loadMap(data.texture) },
        uNightMap: { value: loadMap(data.nightTexture) },
        uCloudMap: { value: loadMap(data.cloudsTexture) },
        uTime: { value: 0 },
        uLightPos: { value: this.lightPos.clone() },
      };
      const mat = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: earthVertexShader,
        fragmentShader: earthFragmentShader,
      });
      this.mesh = new THREE.Mesh(geo, mat);
    } else {
      const mat = new THREE.MeshStandardMaterial({
        map: loadMap(data.texture),
        roughness: 0.85,
        metalness: 0.05,
      });
      this.mesh = new THREE.Mesh(geo, mat);
    }

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.userData.planetId = data.id;
    this.tiltGroup.add(this.mesh);
    this.pickable.push(this.mesh);
  }

  _createAtmosphere() {
    const { data } = this;
    if (!data.atmosphereIntensity) return;

    const geo = new THREE.SphereGeometry(data.size * 1.08, 48, 48);
    this.atmUniforms = {
      uColor: { value: new THREE.Color().fromArray(data.atmosphereColor) },
      uIntensity: { value: data.atmosphereIntensity },
      uLightPos: { value: this.lightPos.clone() },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.atmUniforms,
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.atmosphere = new THREE.Mesh(geo, mat);
    this.tiltGroup.add(this.atmosphere);
  }

  _createRings() {
    const { data } = this;
    const inner = data.size * (data.ringInner || 1.3);
    const outer = data.size * (data.ringOuter || 2.2);
    const geo = new THREE.RingGeometry(inner, outer, 128);

    // Fix UVs for radial sampling
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const len = Math.sqrt(x * x + y * y);
      const t = (len - inner) / (outer - inner);
      uv.setXY(i, t, t);
    }
    uv.needsUpdate = true;

    let ringMap = null;
    if (data.ringTexture) {
      ringMap = sharedLoader.load(data.ringTexture);
      ringMap.colorSpace = THREE.SRGBColorSpace;
    } else {
      // procedural placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 4;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 256, 0);
      grad.addColorStop(0, 'rgba(200,180,140,0)');
      grad.addColorStop(0.2, 'rgba(210,190,150,0.9)');
      grad.addColorStop(0.45, 'rgba(180,160,120,0.3)');
      grad.addColorStop(0.55, 'rgba(200,185,150,0.85)');
      grad.addColorStop(1, 'rgba(180,160,130,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 4);
      ringMap = new THREE.CanvasTexture(canvas);
    }

    this.ringUniforms = {
      uRingMap: { value: ringMap },
      uColor: { value: new THREE.Color(data.orbitColor) },
      uInner: { value: inner },
      uOuter: { value: outer },
      uLightPos: { value: this.lightPos.clone() },
      uOpacity: { value: data.id === 'saturn' ? 0.95 : 0.45 },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.ringUniforms,
      vertexShader: ringVertexShader,
      fragmentShader: ringFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.rings = new THREE.Mesh(geo, mat);
    this.rings.rotation.x = -Math.PI / 2;
    this.tiltGroup.add(this.rings);
  }

  _createMoons() {
    const { data } = this;
    (data.moons || []).forEach((moonData, i) => {
      const moonGroup = new THREE.Group();
      let mesh;

      if (moonData.texture) {
        const mat = new THREE.MeshStandardMaterial({
          map: loadMap(moonData.texture),
          roughness: 0.9,
        });
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(moonData.size, 32, 32),
          mat
        );
      } else {
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(moonData.size, 16, 16),
          new THREE.MeshStandardMaterial({
            color: moonData.color || 0xcccccc,
            roughness: 0.9,
          })
        );
      }

      mesh.castShadow = true;
      moonGroup.add(mesh);

      const moon = {
        group: moonGroup,
        mesh,
        angle: (i / Math.max(data.moons.length, 1)) * Math.PI * 2,
        orbitSpeed: orbitalSpeed(Math.abs(moonData.orbitPeriodDays)),
        spin: spinSpeed(moonData.rotationPeriodHours || 600),
        distance: moonData.distance,
        retrograde: (moonData.orbitPeriodDays || 0) < 0,
      };
      this.moons.push(moon);
      this.group.add(moonGroup);
    });
  }

  _createOrbit() {
    const curve = new THREE.EllipseCurve(
      0, 0,
      this.data.distance, this.data.distance,
      0, Math.PI * 2,
      false, 0
    );
    const points = curve.getPoints(180);
    const geo = new THREE.BufferGeometry().setFromPoints(
      points.map((p) => new THREE.Vector3(p.x, 0, p.y))
    );
    const mat = new THREE.LineBasicMaterial({
      color: this.data.orbitColor,
      transparent: true,
      opacity: 0.28,
    });
    this.orbit = new THREE.LineLoop(geo, mat);
  }

  update(elapsed, delta) {
    this.angle += this.orbitSpeed * delta;
    const d = this.data.distance;
    this.group.position.x = Math.cos(this.angle) * d;
    this.group.position.z = Math.sin(this.angle) * d;

    this.mesh.rotation.y += this.spin * delta;

    if (this.uniforms) {
      this.uniforms.uTime.value = elapsed;
      this.uniforms.uLightPos.value.copy(this.lightPos);
    }
    if (this.atmUniforms) {
      this.atmUniforms.uLightPos.value.copy(this.lightPos);
    }
    if (this.ringUniforms) {
      this.ringUniforms.uLightPos.value.copy(this.lightPos);
    }

    this.moons.forEach((moon) => {
      const dir = moon.retrograde ? -1 : 1;
      moon.angle += moon.orbitSpeed * delta * dir;
      moon.group.position.x = Math.cos(moon.angle) * moon.distance;
      moon.group.position.z = Math.sin(moon.angle) * moon.distance;
      moon.mesh.rotation.y += moon.spin * delta;
    });
  }

  setVisible(visible) {
    this.group.visible = visible;
    if (this.orbit) this.orbit.visible = visible;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

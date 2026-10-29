import gsap from 'gsap';
import * as THREE from 'three';

export class CameraController {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;
    this.focusTarget = null;
    this.focusOffset = new THREE.Vector3(6, 2.5, 8);
    this._tween = null;
    this._following = false;
    this._tmp = new THREE.Vector3();
    this._desired = new THREE.Vector3();
  }

  focusOn(object3D, distance = 8) {
    if (!object3D) return;
    this.focusTarget = object3D;
    this._following = false;

    // Wider framing so rings / moons / atmosphere aren't clipped
    this.focusOffset.set(distance * 0.85, distance * 0.42, distance * 1.25);

    const worldPos = new THREE.Vector3();
    object3D.getWorldPosition(worldPos);
    const endPos = worldPos.clone().add(this.focusOffset);

    this.controls.enabled = false;
    if (this._tween) this._tween.kill();

    const targetProxy = {
      x: this.controls.target.x,
      y: this.controls.target.y,
      z: this.controls.target.z,
    };

    this._tween = gsap.timeline({
      onComplete: () => {
        this.controls.target.copy(worldPos);
        this.controls.enabled = true;
        this._following = true;
      },
    });

    this._tween.to(
      this.camera.position,
      {
        x: endPos.x,
        y: endPos.y,
        z: endPos.z,
        duration: 1.8,
        ease: 'power3.inOut',
      },
      0
    );

    this._tween.to(
      targetProxy,
      {
        x: worldPos.x,
        y: worldPos.y,
        z: worldPos.z,
        duration: 1.8,
        ease: 'power3.inOut',
        onUpdate: () => {
          // Re-sample planet (it keeps orbiting) and blend
          object3D.getWorldPosition(this._tmp);
          this.controls.target.set(
            THREE.MathUtils.lerp(targetProxy.x, this._tmp.x, 0.35),
            THREE.MathUtils.lerp(targetProxy.y, this._tmp.y, 0.35),
            THREE.MathUtils.lerp(targetProxy.z, this._tmp.z, 0.35)
          );
          // Keep camera relative offset while flying in
          this._desired.copy(this._tmp).add(this.focusOffset);
          this.camera.position.lerp(this._desired, 0.08);
          this.controls.update();
        },
      },
      0
    );
  }

  overview() {
    this.focusTarget = null;
    this._following = false;
    this.controls.enabled = false;
    if (this._tween) this._tween.kill();

    const end = { x: 0, y: 32, z: 110 };
    const targetProxy = { x: this.controls.target.x, y: this.controls.target.y, z: this.controls.target.z };

    this._tween = gsap.timeline({
      onComplete: () => {
        this.controls.target.set(0, 0, 0);
        this.controls.enabled = true;
      },
    });

    this._tween.to(this.camera.position, { ...end, duration: 1.8, ease: 'power3.inOut' }, 0);
    this._tween.to(
      targetProxy,
      {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.8,
        ease: 'power3.inOut',
        onUpdate: () => {
          this.controls.target.set(targetProxy.x, targetProxy.y, targetProxy.z);
          this.controls.update();
        },
      },
      0
    );
  }

  /** Chase the focused planet so it stays framed while orbiting */
  update() {
    if (!this.focusTarget || !this._following) return;

    this.focusTarget.getWorldPosition(this._tmp);
    this.controls.target.lerp(this._tmp, 0.12);

    // Maintain viewing offset relative to planet
    this._desired.copy(this._tmp).add(this.focusOffset);
    this.camera.position.lerp(this._desired, 0.06);
  }
}

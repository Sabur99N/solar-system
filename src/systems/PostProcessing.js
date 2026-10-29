import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function createComposer(renderer, scene, camera) {
  const size = new THREE.Vector2();
  renderer.getSize(size);

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  composer.addPass(new RenderPass(scene, camera));

  // Bloom only for the sun — stars stay crisp pinpoints
  const bloomPass = new UnrealBloomPass(size.clone(), 0.85, 0.4, 0.85);
  bloomPass.threshold = 0.85;
  bloomPass.strength = 0.9;
  bloomPass.radius = 0.4;
  composer.addPass(bloomPass);

  composer.addPass(new OutputPass());

  return {
    composer,
    bloomPass,
    resize(width, height) {
      composer.setSize(width, height);
      bloomPass.resolution.set(width, height);
    },
  };
}

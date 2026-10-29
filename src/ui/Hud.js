import { PLANETS } from '../data/planets.js';

export class Hud {
  constructor({ onSelect, onReset, onToggleOrbits }) {
    this.root = document.getElementById('hud');
    this.onSelect = onSelect;
    this.speed = 1;

    if (!this.root) return;

    const list = this.root.querySelector('.hud__planets');
    PLANETS.forEach((p) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hud__planet';
      btn.dataset.id = p.id;
      btn.innerHTML = `<span class="hud__dot" style="--c:${p.orbitColor}"></span>${p.name}`;
      btn.addEventListener('click', () => {
        this.setActive(p.id);
        onSelect?.(p.id);
      });
      list.appendChild(btn);
    });

    this.root.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
      this.setActive(null);
      onReset?.();
    });

    this.root.querySelector('[data-action="orbits"]')?.addEventListener('click', (e) => {
      const pressed = e.currentTarget.getAttribute('aria-pressed') !== 'true';
      e.currentTarget.setAttribute('aria-pressed', String(pressed));
      onToggleOrbits?.(pressed);
    });

    const speedInput = this.root.querySelector('#time-scale');
    const speedLabel = this.root.querySelector('[data-speed-label]');
    speedInput?.addEventListener('input', () => {
      this.speed = Number(speedInput.value);
      if (speedLabel) speedLabel.textContent = `${this.speed.toFixed(1)}×`;
    });
  }

  setActive(id) {
    this.root?.querySelectorAll('.hud__planet').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.id === id);
    });
  }

  getTimeScale() {
    return this.speed;
  }
}

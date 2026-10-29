import gsap from 'gsap';

const FIELDS = [
  ['distance', 'distanceFromSun'],
  ['radius', 'radius'],
  ['mass', 'mass'],
  ['gravity', 'gravity'],
  ['lengthOfDay', 'lengthOfDay'],
  ['lengthOfYear', 'lengthOfYear'],
  ['temperature', 'temperature'],
  ['moons', 'moonsCount'],
];

export class InfoPanel {
  constructor({ onClose } = {}) {
    this.el = document.getElementById('info');
    this.closeBtn = document.getElementById('close');
    this.isOpen = false;
    this.onClose = onClose;

    this.closeBtn?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  open(planet) {
    if (!this.el || !planet) return;
    const data = planet.data || planet;

    document.getElementById('planet-name').textContent = data.name;
    document.getElementById('planet-short-description').textContent = data.description;
    document.getElementById('planet-image').src = data.image;
    document.getElementById('planet-image').alt = data.name;
    document.getElementById('planet-texture').src = data.texture;
    document.getElementById('planet-texture').alt = `${data.name} surface texture`;

    FIELDS.forEach(([id, key]) => {
      const node = document.getElementById(id);
      if (node) node.textContent = data[key] ?? '—';
    });

    this.el.style.setProperty('--accent', data.orbitColor || '#f0c14a');
    this.el.classList.add('is-open');
    this.el.setAttribute('aria-hidden', 'false');
    this.isOpen = true;

    gsap.fromTo(
      this.el,
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    );
    gsap.fromTo(
      '.info__stat',
      { x: 12, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, stagger: 0.04, delay: 0.12, ease: 'power2.out' }
    );
  }

  close() {
    if (!this.el || !this.isOpen) return;
    gsap.to(this.el, {
      x: 36,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        this.el.classList.remove('is-open');
        this.el.setAttribute('aria-hidden', 'true');
        this.isOpen = false;
        this.onClose?.();
      },
    });
  }
}

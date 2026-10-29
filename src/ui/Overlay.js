import gsap from 'gsap';

export function initOverlay({ onExplore }) {
  const overlay = document.querySelector('.overlay');
  const btn = document.querySelector('.explore-btn');
  if (!overlay || !btn) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.overlay__brand', { y: 36, opacity: 0, duration: 0.85 })
    .from('.overlay__title', { y: 48, opacity: 0, duration: 1 }, '-=0.5')
    .from('.overlay__lead', { y: 28, opacity: 0, duration: 0.75 }, '-=0.55')
    .from('.explore-btn', { y: 18, opacity: 0, duration: 0.55 }, '-=0.4');

  btn.addEventListener('click', () => {
    const exit = gsap.timeline({
      onComplete: () => {
        overlay.classList.add('is-hidden');
        overlay.setAttribute('aria-hidden', 'true');
        onExplore?.();
      },
    });
    exit
      .to('.overlay__content > *', { y: -24, opacity: 0, duration: 0.45, stagger: 0.05 })
      .to(overlay, { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, '-=0.15');
  });
}

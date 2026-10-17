/**
 * Staggered scroll reveal for `[data-reveal]`, adapted from the reference's
 * mosaic wave: elements entering together get increasing, capped delays.
 */
export function initReveal() {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach((el) => (el.dataset.visible = ''));
    return;
  }

  let waveStart = 0;
  let waveCount = 0;

  const observer = new IntersectionObserver(
    (entries) => {
      const now = performance.now();
      if (now - waveStart > 400) {
        waveStart = now;
        waveCount = 0;
      }
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.style.setProperty('--reveal-delay', `${Math.min(waveCount * 70, 420)}ms`);
        el.dataset.visible = '';
        waveCount++;
        observer.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );

  targets.forEach((el) => observer.observe(el));
}

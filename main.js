/**
 * Parallax scroll hero.
 * - Membaca progres scroll pada .hero-track (0 di atas, 1 saat hero selesai).
 * - Menulis ke CSS variable --p; CSS yang menggeser cup dan awan.
 * - rAF + lerp memberi inersia halus; loop berhenti sendiri saat nilai sudah sampai.
 */
(() => {
  const track = document.querySelector('[data-parallax-track]');
  if (!track) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const EASE = 0.12;          // 0.05 = sangat licin, 0.3 = responsif
  const SPEED = 1.15;         // >1 = elemen keluar sedikit lebih cepat dari scroll

  let target = 0;
  let current = 0;
  let running = false;

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  
  function write(v) {
    const val = v.toFixed(4);
    track.style.setProperty('--p', val);
    
    // Fallback/direct transform jika CSS var(--p) tidak terbaca otomatis pada beberapa browser
    const clouds = track.querySelectorAll('.cloud');
    const cups = track.querySelectorAll('.cup');
    
    clouds.forEach(cloud => {
      if (cloud.classList.contains('cloud--left')) {
        cloud.style.transform = `translate3d(calc(${val} * -110%), 0, 0)`;
      } else if (cloud.classList.contains('cloud--right')) {
        cloud.style.transform = `translate3d(calc(${val} * 110%), 0, 0)`;
      }
    });

    cups.forEach(cup => {
      if (cup.classList.contains('cup--left')) {
        cup.style.transform = `translate3d(calc(${val} * -140%), calc(${val} * 8%), 0) rotate(calc(${val} * -14deg))`;
      } else if (cup.classList.contains('cup--right')) {
        cup.style.transform = `translate3d(calc(${val} * 140%), calc(${val} * 8%), 0) rotate(calc(${val} * 14deg))`;
      }
    });
  }

  function measure() {
    const range = track.offsetHeight - window.innerHeight;
    const scrolled = -track.getBoundingClientRect().top;
    target = range > 0 ? clamp((scrolled / range) * SPEED) : 0;
  }

  function frame() {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.0005) current = target;
    write(current);
    if (current !== target) requestAnimationFrame(frame);
    else running = false;
  }

  function update() {
    measure();
    if (reduceMotion.matches) return write(0);
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  reduceMotion.addEventListener?.('change', update);

  // Posisi awal
  measure();
  current = target;
  write(reduceMotion.matches ? 0 : current);
})();

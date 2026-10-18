/* Petal, marigold and sparkle particles on one canvas. Sleeps when nothing is falling. */
window.Petals = (() => {
  const cv = document.getElementById('petals');
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MAX = 240;
  const parts = [];
  let W = 0, H = 0, dpr = 1, raf = 0, last = 0;

  const COLORS = {
    rose: ['#9E0F25', '#B8172F', '#CF3A52', '#E5798C', '#F2A7B6'],
    marigold: ['#F08A12', '#F6A21E', '#FBC02D', '#E06E0A'],
    leaf: ['#4F7A28', '#6E9A3A', '#86A84A'],
    gold: ['#E8CF8F', '#D4AF5F', '#F6E7B5', '#B8893A'],
    sparkle: ['#FFF4D0']
  };
  const sprites = {};

  function sprite(kind, color) {
    const key = kind + color;
    if (sprites[key]) return sprites[key];
    const s = 48, c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    g.translate(s / 2, s / 2);
    if (kind === 'rose') {
      const gr = g.createLinearGradient(0, -18, 0, 18);
      gr.addColorStop(0, color); gr.addColorStop(1, shade(color, -0.25));
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(0, 18);
      g.bezierCurveTo(-21, 6, -17, -17, -4, -17); g.quadraticCurveTo(0, -12, 4, -17);
      g.bezierCurveTo(17, -17, 21, 6, 0, 18); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(0, 14); g.quadraticCurveTo(-2, 0, 0, -11); g.stroke();
    } else if (kind === 'marigold') {
      g.fillStyle = color;
      g.beginPath(); g.moveTo(0, 15);
      g.bezierCurveTo(-10, 8, -10, -9, -7, -15); g.lineTo(-3.5, -11.5); g.lineTo(0, -16); g.lineTo(3.5, -11.5); g.lineTo(7, -15);
      g.bezierCurveTo(10, -9, 10, 8, 0, 15); g.fill();
      g.strokeStyle = 'rgba(120,40,0,.25)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(0, 12); g.lineTo(0, -10); g.stroke();
    } else if (kind === 'leaf') {
      g.fillStyle = color;
      g.beginPath(); g.moveTo(0, 18); g.quadraticCurveTo(-12, 0, 0, -18); g.quadraticCurveTo(12, 0, 0, 18); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(0, 15); g.lineTo(0, -15); g.stroke();
    } else if (kind === 'gold') {
      const gr = g.createLinearGradient(-8, -10, 8, 10);
      gr.addColorStop(0, '#FFF6D6'); gr.addColorStop(0.5, color); gr.addColorStop(1, shade(color, -0.3));
      g.fillStyle = gr;
      g.beginPath(); g.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2); g.fill();
    } else {
      const rg = g.createRadialGradient(0, 0, 0, 0, 0, 22);
      rg.addColorStop(0, 'rgba(255,250,228,1)'); rg.addColorStop(0.22, 'rgba(246,226,160,.75)'); rg.addColorStop(1, 'rgba(246,226,160,0)');
      g.fillStyle = rg; g.fillRect(-24, -24, 48, 48);
      g.fillStyle = '#FFFDF2';
      g.beginPath(); g.moveTo(0, -18); g.quadraticCurveTo(2, -2, 18, 0); g.quadraticCurveTo(2, 2, 0, 18);
      g.quadraticCurveTo(-2, 2, -18, 0); g.quadraticCurveTo(-2, -2, 0, -18); g.fill();
    }
    return (sprites[key] = c);
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const ch = v => Math.max(0, Math.min(255, Math.round(v + v * amt)));
    return `rgb(${ch(n >> 16)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  }

  function add(kind, x, y, vx, vy, o = {}) {
    if (parts.length >= MAX) return;
    const list = COLORS[kind] || COLORS.rose;
    const base = kind === 'sparkle' ? 7 + Math.random() * 9 : kind === 'gold' ? 3.5 + Math.random() * 3 : kind === 'marigold' ? 6 + Math.random() * 5 : 8 + Math.random() * 8;
    parts.push({
      kind, img: sprite(kind, list[(Math.random() * list.length) | 0]),
      x, y, vx, vy, size: base * (o.scale || 1),
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 2.6,
      phase: Math.random() * Math.PI * 2, swayF: 0.8 + Math.random() * 1.4, sway: 18 + Math.random() * 34,
      flip: Math.random() * Math.PI * 2, flipF: 1.6 + Math.random() * 2.8,
      grav: kind === 'sparkle' ? 0 : kind === 'gold' ? 70 : 52, drag: kind === 'sparkle' ? 1.8 : 1.05,
      age: 0, life: o.life || (kind === 'sparkle' ? 1.4 + Math.random() * 1.4 : 16)
    });
    wake();
  }

  function wake() {
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.age += dt;
      p.vx -= p.vx * p.drag * dt;
      p.vy += (p.grav - p.vy * p.drag) * dt;
      p.phase += p.swayF * dt;
      p.flip += p.flipF * dt;
      p.rot += p.vr * dt;
      p.x += (p.vx + Math.sin(p.phase) * p.sway) * dt;
      p.y += p.vy * dt;
      const fadeIn = Math.min(1, p.age * 6);
      const fadeOut = Math.min(1, (p.life - p.age) / 0.8);
      if (p.age > p.life || p.y > H + 40 || p.x < -60 || p.x > W + 60) { parts.splice(i, 1); continue; }
      const a = p.kind === 'sparkle' ? fadeIn * fadeOut * (0.55 + 0.45 * Math.sin(p.phase * 4)) : fadeIn * fadeOut;
      const s = p.size / 18;
      ctx.globalAlpha = Math.max(0, a);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(s * (p.kind === 'sparkle' ? 1 : Math.cos(p.flip) * 0.85 + 0.15 * Math.sign(Math.cos(p.flip) || 1)), s);
      ctx.drawImage(p.img, -24, -24);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    ctx.globalAlpha = 1;
    if (parts.length) raf = requestAnimationFrame(tick);
    else { raf = 0; ctx.clearRect(0, 0, W, H); }
  }

  const pick = kinds => kinds[(Math.random() * kinds.length) | 0];

  /* Radial burst from a point (the envelope opening, a lit diya) */
  function burst({ x = W / 2, y = H / 2, count = 60, kinds = ['rose', 'marigold', 'gold'], power = 1 } = {}) {
    if (reduce) count = Math.round(count / 4);
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2, sp = (180 + Math.random() * 520) * power;
      add(pick(kinds), x, y, Math.cos(ang) * sp, Math.sin(ang) * sp - 160 * power, { scale: 1.1 });
    }
  }

  /* Gentle fall from the top edge over a duration */
  function shower({ count = 30, duration = 3000, kinds = ['rose', 'marigold'] } = {}) {
    if (reduce) count = Math.round(count / 4);
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const k = pick(kinds);
        const y = k === 'sparkle' ? Math.random() * H * 0.7 : -24;
        add(k, Math.random() * W, y, (Math.random() - 0.5) * 30, k === 'sparkle' ? 0 : 30 + Math.random() * 50);
      }, Math.random() * duration);
    }
  }

  resize();
  addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) { cancelAnimationFrame(raf); raf = 0; }
    else if (!document.hidden && parts.length) wake();
  });

  return { burst, shower };
})();

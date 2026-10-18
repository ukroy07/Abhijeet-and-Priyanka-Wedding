/*
 * Background music. Plays INVITE.music.src if set; otherwise generates a santoor
 * melody in Raag Yaman over a tanpura drone (Karplus–Strong strings + reverb).
 */
window.Music = (() => {
  const cfg = (window.INVITE && window.INVITE.music) || {};
  const SR = 44100;
  const SA = 293.66;            // Sa = D4
  const BEAT = 0.44;
  const DEG = { '.D': -3, '.N': -1, S: 0, R: 2, G: 4, m: 6, P: 7, D: 9, N: 11, "S'": 12, "R'": 14, "G'": 16 };
  const SCALE = [-12, -10, -8, -6, -5, -3, -1, 0, 2, 4, 6, 7, 9, 11, 12, 14, 16, 18];
  const PHRASES = [
    ".N:1 R:1 G:2 R:1 S:3",
    ".N:1 R:1 G:1 m:1 P:4",
    "m:1 G:1 R:1 G:1 m:1 P:3",
    "G:1 m:1 D:1 N:1 S':4",
    "S':1 N:1 D:1 P:2 m:1 G:3",
    "P:1 m:1 G:1 R:1 S:4",
    "m:1 D:1 N:1 R':2 S':3",
    "N:1 R':1 G':2 R':1 S':3",
    "D:1 P:1 m:1 G:1 m:1 R:1 S:4",
    ".N:1 .D:1 .N:1 R:1 S:4"
  ].map(s => s.split(' ').map(t => { const [n, b] = t.split(':'); return [DEG[n], +b]; }));
  const PLAN = [0, 1, 2, 3, 4, 5, 9, 1, 6, 7, 4, 8, 0, 5];

  const tables = {};
  const buffers = {};
  const listeners = new Set();
  let jobs = null;
  let ctx = null, master = null, dry = null, conv = null;
  let playing = false, wanted = false, started = false, timer = 0;
  let melodyT = 0, droneT = 0, planI = 0;
  let el = null, volTimer = 0;

  /* ---------- string synthesis ---------- */
  function ks(freq, seconds, t60, bright) {
    const n = Math.floor(seconds * SR), out = new Float32Array(n);
    const D = SR / freq - 0.5;                       // loop length minus the averaging filter
    const L = Math.floor(D - 0.1), frac = D - L;     // allpass tunes the fractional part
    const C = (1 - frac) / (1 + frac);
    const line = new Float32Array(L);
    let lp = 0, mean = 0;
    for (let i = 0; i < L; i++) { lp += bright * (Math.random() * 2 - 1 - lp); line[i] = lp; mean += lp; }
    mean /= L;
    for (let i = 0; i < L; i++) line[i] -= mean;
    const g = Math.pow(0.001, 1 / (t60 * freq));
    let idx = 0, prev = 0, apIn = 0, apOut = 0;
    for (let i = 0; i < n; i++) {
      const x = line[idx];
      out[i] = x;
      const avg = 0.5 * (x + prev); prev = x;
      const ap = C * avg + apIn - C * apOut; apIn = avg; apOut = ap;
      line[idx] = ap * g;
      if (++idx === L) idx = 0;
    }
    return out;
  }

  function finish(arr, fadeSec) {
    let peak = 0;
    for (let i = 0; i < arr.length; i++) { const a = Math.abs(arr[i]); if (a > peak) peak = a; }
    const k = peak ? 0.9 / peak : 1, n = arr.length, fl = Math.floor(fadeSec * SR);
    for (let i = 0; i < n; i++) arr[i] *= k * (i > n - fl ? (n - i) / fl : 1);
    return arr;
  }

  // Two slightly detuned strings per course, like a santoor
  function santoor(semi) {
    const fq = SA * Math.pow(2, semi / 12);
    const t60 = Math.max(1.4, Math.min(3.4, 3.7 - fq / 420)), sec = Math.min(t60 + 0.5, 3.8);
    const a = ks(fq * 1.0011, sec, t60, 0.62), b = ks(fq * 0.9989, sec, t60 * 0.92, 0.55);
    for (let i = 0; i < a.length; i++) a[i] += b[i] * 0.85;
    return finish(a, 0.25);
  }

  // Long, warm pluck with a soft saturation for the jawari buzz
  function tanpura(fq) {
    const a = ks(fq, 6.4, 5.6, 0.5), k = Math.tanh(1.8);
    for (let i = 0; i < a.length; i++) a[i] = Math.tanh(1.8 * a[i]) / k;
    return finish(a, 0.6);
  }

  function queueJobs() {
    if (jobs) return;
    jobs = [];
    SCALE.forEach(s => jobs.push(() => { tables['s' + s] = santoor(s); }));
    [73.42, 110, 146.83].forEach(fq => jobs.push(() => { tables['t' + fq] = tanpura(fq); }));
  }

  // Render the note tables a little at a time so the page stays smooth
  function prepare() {
    if (cfg.src) return;
    queueJobs();
    const step = () => { const job = jobs.shift(); if (job) { job(); setTimeout(step, 30); } };
    setTimeout(step, 0);
  }

  function ensure() { queueJobs(); while (jobs.length) jobs.shift()(); }

  /* ---------- audio graph ---------- */
  // Dark, exponentially decaying noise: a soft hall reverb
  function impulse(sec) {
    const rate = ctx.sampleRate, len = Math.floor(rate * sec), ir = ctx.createBuffer(2, len, rate);
    const k = Math.exp(-6.9 / len), attack = rate * 0.012;
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      let lp = 0, env = 1;
      for (let i = 0; i < len; i++) {
        lp += 0.28 * (Math.random() * 2 - 1 - lp);
        d[i] = lp * env * (i < attack ? i / attack : 1);
        env *= k;
      }
    }
    return ir;
  }

  function init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* older Safari */ }
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 3;
    master = ctx.createGain(); master.gain.value = 0;
    dry = ctx.createGain(); dry.gain.value = 0.85;
    conv = ctx.createConvolver();
    const wet = ctx.createGain(); wet.gain.value = 0.42;
    dry.connect(master); conv.connect(wet); wet.connect(master);
    master.connect(comp); comp.connect(ctx.destination);
    return true;
  }

  function buf(key) {
    if (buffers[key]) return buffers[key];
    const arr = tables[key];
    if (!arr) return null;
    const b = ctx.createBuffer(1, arr.length, SR);
    b.getChannelData(0).set(arr);
    return (buffers[key] = b);
  }

  function voice(t, key, gain, pan) {
    const b = buf(key);
    if (!b) return;
    const src = ctx.createBufferSource();
    src.buffer = b;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(g);
    let out = g;
    if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); out = p; }
    out.connect(dry); out.connect(conv);
    src.start(Math.max(t, ctx.currentTime));
  }

  function phrase(t) {
    let idx = PLAN[planI++ % PLAN.length];
    if (Math.random() < 0.22) idx = (Math.random() * PHRASES.length) | 0;
    voice(t, 's' + (Math.random() < 0.7 ? -12 : -5), 0.2, -0.15);
    PHRASES[idx].forEach(([semi, beats]) => {
      const dur = beats * BEAT, pan = (semi / 16) * 0.5 - 0.1;
      if (beats >= 2 && Math.random() < 0.35) {             // kan: a quick grace note from above
        const up = SCALE[SCALE.indexOf(semi) + 1];
        if (up !== undefined) voice(t - 0.06, 's' + up, 0.15, pan);
      }
      voice(t + (Math.random() - 0.5) * 0.02, 's' + semi, 0.48 + Math.random() * 0.08, pan);
      if (beats >= 3) {                                        // santoor roll sustains long notes
        let k = 0;
        for (let tt = t + 0.3; tt < t + dur - 0.12; tt += 0.092, k++) {
          voice(tt, 's' + semi, Math.max(0.05, 0.14 - k * 0.007) * (0.85 + Math.random() * 0.3), pan);
        }
      }
      t += dur;
    });
    return t + BEAT * (1 + Math.round(Math.random() * 2));
  }

  function drone(t) {
    [[110, 0.15], [146.83, 0.11], [146.83, 0.11], [73.42, 0.17]]
      .forEach(([fq, g], i) => voice(t + i * 1.15, 't' + fq, g, i % 2 ? 0.2 : -0.2));
    return t + 4.9;
  }

  function pump() {
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    while (droneT < now + 1.5) droneT = drone(Math.max(droneT, now + 0.05));
    while (melodyT < now + 1.5) melodyT = phrase(Math.max(melodyT, now + 0.05));
  }

  function fadeTo(v, sec) {
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(v, t + sec);
  }

  /* ---------- mp3 mode ---------- */
  function rampVol(to, ms, done) {
    clearInterval(volTimer);
    const from = el.volume, t0 = performance.now();
    volTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      el.volume = from + (to - from) * k;
      if (k === 1) { clearInterval(volTimer); if (done) done(); }
    }, 40);
  }

  /* ---------- public ---------- */
  function set(state) {
    if (playing === state) return;
    playing = state;
    listeners.forEach(fn => fn(state));
  }

  // Call from a tap/click so browsers allow sound
  function play() {
    wanted = true;
    if (cfg.src) {
      if (!el) { el = new Audio(cfg.src); el.loop = true; el.volume = 0; }
      el.play().then(() => { set(true); rampVol(0.85, 2200); }).catch(() => set(false));
      return;
    }
    if (!ctx && !init()) return;
    const resumed = ctx.resume();
    const s = ctx.createBufferSource();                      // unlocks audio on iOS
    s.buffer = ctx.createBuffer(1, 1, 22050); s.connect(ctx.destination); s.start(0);
    set(true);
    if (resumed && resumed.then) resumed.then(() => { if (ctx.state !== 'running') set(false); });
    // the heavier setup waits until the tap has painted, so the envelope animation stays smooth
    setTimeout(() => {
      if (!playing) return;
      if (!conv.buffer) conv.buffer = impulse(3.2);
      ensure();
      if (!started) {
        started = true;
        const now = ctx.currentTime;
        droneT = now + 0.15;
        melodyT = now + 2.8;
      }
      fadeTo(0.75, 2.5);
      if (!timer) timer = setInterval(pump, 250);
      pump();
    }, 120);
  }

  function pause(soft) {
    if (!soft) wanted = false;
    if (cfg.src) {
      if (el) rampVol(0, 400, () => el.pause());
      set(false);
      return;
    }
    if (!ctx) return;
    fadeTo(0, 0.5);
    clearInterval(timer); timer = 0;
    set(false);
    setTimeout(() => { if (!playing && ctx.state === 'running') ctx.suspend(); }, 650);
  }

  function toggle() { playing ? pause() : play(); }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (playing) pause(true); }
    else if (wanted && !playing) play();
  });

  return {
    prepare, play, pause, toggle,
    on: fn => listeners.add(fn),
    get playing() { return playing; },
    get title() { return cfg.title || ''; }
  };
})();

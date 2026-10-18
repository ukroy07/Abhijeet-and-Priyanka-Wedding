/* Invitation behaviour: guest name, envelope, reveals, countdown, calendar, music, sharing. */
(() => {
  'use strict';
  const C = window.INVITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const later = (ms, fn) => setTimeout(fn, ms);
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const ICON = {
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    nav: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3 3 10.5l7.5 2.9L13.5 21 21 3Z"/></svg>',
    map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5 9 3l1.6 4.2-2 1.4a12 12 0 0 0 6.8 6.8l1.4-2 4.2 1.6-.5 2.4a2 2 0 0 1-2.1 1.6A16.5 16.5 0 0 1 5 5.6a2 2 0 0 1 1.6-2.1Z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3Z"/></svg>'
  };

  /* ---------- guest ---------- */
  const qs = new URLSearchParams(location.search);
  const guest = (qs.get('to') || qs.get('guest') || qs.get('name') || '')
    .replace(/_/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  const envName = guest || C.defaultEnvelope;
  $$('[data-guest="envelope"]').forEach(el => {
    el.textContent = envName;
    el.dataset.len = envName.length > 26 ? 'xl' : envName.length > 16 ? 'l' : 's';
  });
  $$('[data-guest="greeting"]').forEach(el => { el.textContent = guest || C.defaultGreeting; });
  const closingLine = $('#closingGuest');
  if (closingLine) closingLine.textContent = guest ? `We can’t wait to celebrate with you, ${guest}.` : 'We can’t wait to celebrate with you.';
  if (guest) document.title = `${guest} — you’re invited · ${C.groom} & ${C.bride}`;

  /* ---------- content ---------- */
  function renderStory() {
    $('#storyList').innerHTML = C.story.map((ch, i) => {
      const media = ch.img
        ? `<figure class="polaroid" data-parallax style="--ratio:${ch.ratio};--rot:${i % 2 ? 2.2 : -2.4}deg">
            <img src="assets/img/${ch.img}-${ch.widths[0]}.webp" srcset="${ch.widths.map(w => `assets/img/${ch.img}-${w}.webp ${w}w`).join(', ')}"
              sizes="(min-width: 900px) 440px, 80vw" alt="${esc(ch.alt || '')}" loading="lazy" decoding="async">
            ${ch.caption ? `<figcaption>${esc(ch.caption)}</figcaption>` : ''}
          </figure>`
        : `<div class="chapter__seal"><div class="emblem emblem--story">${Art.rangoli()}<span class="emblem__heart">♥</span></div></div>`;
      return `<article class="chapter${ch.img ? '' : ' chapter--text'}${i % 2 ? ' chapter--flip' : ''}" data-reveal>
        ${media}
        <div class="chapter__text">
          <span class="chapter__num">${ROMAN[i]}</span>
          <h3 class="chapter__title">${esc(ch.title)}</h3>
          <p class="chapter__hi deva">${esc(ch.hi)}</p>
          <p class="chapter__body">${esc(ch.text)}</p>
        </div>
      </article>`;
    }).join('');
  }

  function renderFamilies() {
    const card = f => `
      <article class="family" data-reveal>
        <span class="family__finial" aria-hidden="true">${Art.lotus()}</span>
        <p class="family__side deva">${esc(f.side)}</p>
        <p class="eyebrow">${esc(f.role)}</p>
        <h3 class="family__name">${esc(f.name)}</h3>
        <p class="family__rel">${esc(f.relation)}</p>
        <p class="family__parents">${f.parents.map(p => `<span>${esc(p)}</span>`).join('<i>&amp;</i>')}</p>
      </article>`;
    const [a, b] = C.families;
    $('#familyGrid').innerHTML = `${card(a)}<div class="family-knot" data-reveal aria-hidden="true">${Art.kalash()}</div>${card(b)}`;
  }

  function renderContact() {
    const nums = (C.contact || []).map(n => String(n).replace(/\D/g, '').slice(-10)).filter(n => n.length === 10);
    if (!nums.length) { $('#contact').remove(); return; }
    $('#contact').innerHTML = `
      <p class="eyebrow">For any assistance</p>
      <ul class="contact__list">${nums.map(n => {
        const pretty = `+91 ${n.slice(0, 5)} ${n.slice(5)}`;
        return `<li>
          <a class="contact__call" href="tel:+91${n}">${ICON.phone}<span>${pretty}</span></a>
          <a class="contact__wa" href="https://wa.me/91${n}" target="_blank" rel="noopener" aria-label="WhatsApp ${pretty}">${ICON.whatsapp}</a>
        </li>`;
      }).join('')}</ul>`;
  }

  function parts(ev) {
    const [y, m, d] = ev.date.split('-').map(Number);
    return { y, m, d, v: ev.venue ? C.venues[ev.venue] : null };
  }

  function renderDates() {
    $('#dateChips').innerHTML = C.events.map(ev => {
      const { m, d } = parts(ev);
      return `<a class="date-chip date-chip--${ev.theme}" href="#ev-${ev.id}">
        <b>${d}</b><span>${MON[m - 1]}</span><em>${esc(ev.parts ? ev.parts.join(' · ') : ev.title)}</em></a>`;
    }).join('');
  }

  function renderEvents() {
    $('#events').innerHTML = C.events.map(ev => {
      const { m, d, v } = parts(ev);
      const title = ev.parts
        ? ev.parts.map((p, k) => `<span class="part part--${k}">${esc(p)}</span>`).join('')
        : esc(ev.title);
      const where = v
        ? `<b>${esc(v.name)}</b>${v.alias ? `<em>${esc(v.alias)}</em>` : ''}<span>${esc(v.address)}</span>`
        : `<b>${esc(ev.place)}</b>`;
      return `<section class="event event--${ev.theme}" id="ev-${ev.id}" data-particles="${(ev.particles || []).join(',')}">
        <div class="event__inner" data-reveal>
          <p class="eyebrow event__day">${esc(ev.day)}</p>
          <div class="emblem">${Art.rangoli()}<div class="emblem__date"><b>${d}</b><span>${MON[m - 1]}</span></div></div>
          <p class="event__hi deva">${esc(ev.hi)}</p>
          <h3 class="event__title${ev.parts ? ' event__title--parts' : ''}">${title}${ev.sub ? `<span class="event__sub">${esc(ev.sub)}</span>` : ''}</h3>
          <p class="event__tag">${esc(ev.tagline)}</p>
          ${ev.time ? `<p class="event__time">${esc(ev.time)}</p>` : ''}
          <div class="event__place">${ICON.pin}<p>${where}</p></div>
          ${v ? `<a class="btn btn--event" href="${esc(v.directions)}" target="_blank" rel="noopener">${ICON.nav}<span>Get Directions</span></a>` : ''}
        </div>
      </section>`;
    }).join('');
  }

  function renderVenues() {
    $('#venueList').innerHTML = Object.values(C.venues).map(v => `
      <article class="venue" data-reveal>
        <p class="eyebrow">${esc(v.when)}</p>
        <h3 class="venue__name">${esc(v.name)}</h3>
        ${v.alias ? `<p class="venue__alias">${esc(v.alias)}</p>` : ''}
        <p class="venue__addr">${ICON.pin}<span>${esc(v.address)}</span></p>
        <div class="venue__map">
          <iframe data-src="${esc(v.embed)}" title="Map of ${esc(v.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
          <span class="venue__veil">${ICON.map}</span>
        </div>
        <div class="btn-row">
          <a class="btn btn--maroon" href="${esc(v.directions)}" target="_blank" rel="noopener">${ICON.nav}<span>Get Directions</span></a>
          <a class="btn btn--ghost" href="${esc(v.maps)}" target="_blank" rel="noopener">${ICON.map}<span>Open in Maps</span></a>
        </div>
      </article>`).join('');
  }

  function renderArt() {
    $$('[data-art]').forEach(el => {
      const kind = el.dataset.art;
      if (kind === 'seal') el.innerHTML = Art.seal(C.initials[0], C.initials[1]);
      else if (Art[kind]) el.innerHTML = Art[kind]();
    });
    $$('[data-corners]').forEach(el => {
      ['tl', 'tr', 'bl', 'br'].forEach(p => el.insertAdjacentHTML('beforeend', `<span class="corner corner--${p}" aria-hidden="true">${Art.corner()}</span>`));
    });
  }

  let garlandW = 0;
  function renderGarland() {
    const host = $('#garland');
    const w = host.clientWidth;
    if (!w || Math.abs(w - garlandW) < 60) return;
    garlandW = w;
    host.innerHTML = Art.garland(w);
  }

  renderFamilies();
  renderContact();
  renderStory();
  renderDates();
  renderEvents();
  renderVenues();
  renderArt();
  renderGarland();

  /* ---------- gate & envelope ---------- */
  const root = document.documentElement;
  const gate = $('#gate');
  const env = $('#envelope');
  const card = $('.card', env);
  const hero = $('#home');
  let opened = false;

  // golden dust drifting behind the envelope
  const dust = $('#dust');
  for (let i = 0; i < (reduce ? 0 : 26); i++) {
    const s = document.createElement('span');
    s.style.cssText = `left:${Math.random() * 100}%;top:${30 + Math.random() * 70}%;--x:${(Math.random() - 0.5) * 80}px;--t:${6 + Math.random() * 7}s;--d:-${Math.random() * 10}s;--s:${0.6 + Math.random() * 1.1}`;
    dust.appendChild(s);
  }

  function openInvite() {
    if (opened) return;
    opened = true;
    Music.play();
    gate.classList.add('is-opening');
    env.classList.add('is-open');
    const sb = $('.env__seal', env).getBoundingClientRect();
    Petals.burst({ x: sb.left + sb.width / 2, y: sb.top + sb.height / 2, count: 16, kinds: ['sparkle', 'gold'], power: 0.45 });
    const T = reduce ? [150, 400, 900] : [750, 1650, 2900];
    later(T[0], () => env.classList.add('card-out'));
    later(T[1], zoomCard);
    later(T[2], finishGate);
  }

  function zoomCard() {
    const r = card.getBoundingClientRect();
    const s = Math.max(innerWidth / r.width, innerHeight / r.height) * 1.06;
    const dx = innerWidth / 2 - (r.left + r.width / 2);
    const dy = innerHeight / 2 - (r.top + r.height / 2);
    env.classList.add('is-away');
    card.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${s.toFixed(3)})`;
    gate.classList.add('is-revealing');
    later(reduce ? 0 : 420, startHero);
    later(reduce ? 0 : 520, () => {
      Petals.burst({ x: innerWidth / 2, y: innerHeight * 0.4, count: 64, kinds: ['rose', 'marigold', 'gold', 'rose'] });
      Petals.shower({ count: 44, duration: 4600, kinds: ['rose', 'marigold', 'rose', 'gold'] });
    });
  }

  function finishGate() {
    gate.remove();
    root.classList.remove('is-locked');
    scrollTo(0, 0);
    const mb = $('#musicBtn');
    mb.hidden = false;
    requestAnimationFrame(() => mb.classList.add('is-in'));
    const toast = $('#musicToast');
    if (Music.title && Music.playing) {
      toast.textContent = `♪  ${Music.title}`;
      toast.classList.add('is-in');
      later(4200, () => toast.classList.remove('is-in'));
    }
  }

  function startHero() {
    renderGarland();
    hero.classList.add('is-live');
  }

  gate.addEventListener('click', openInvite);
  env.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openInvite(); }
  });
  env.focus({ preventScroll: true });

  /* ---------- reveals, visibility, particles ---------- */
  const revealIO = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    revealIO.unobserve(e.target);
  }), { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  $$('[data-reveal]').forEach(el => revealIO.observe(el));

  // pause rotating art when it is off screen
  const liveIO = new IntersectionObserver(entries => entries.forEach(e => {
    e.target.classList.toggle('is-visible', e.isIntersecting);
  }), { rootMargin: '80px' });
  $$('.event, .hero, .chapter--text, .countdown').forEach(el => liveIO.observe(el));

  const showered = new Set();
  const partIO = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting || showered.has(e.target) || !root.classList.contains('is-ready')) return;
    showered.add(e.target);
    const kinds = (e.target.dataset.particles || '').split(',').filter(Boolean);
    if (kinds.length) Petals.shower({ count: 22, duration: 2600, kinds });
  }), { threshold: 0.45 });
  $$('.event').forEach(el => partIO.observe(el));

  /* ---------- countdown ---------- */
  const target = new Date(C.countdownTo).getTime();
  const cells = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
  function setCell(el, v) {
    const t = String(v).padStart(2, '0');
    if (el.textContent === t) return;
    el.textContent = t;
    el.classList.remove('tick');
    void el.offsetWidth;
    el.classList.add('tick');
  }
  function tickCountdown() {
    let diff = target - Date.now();
    if (diff <= 0) {
      $('#cdGrid').hidden = true;
      $('#cdDone').hidden = false;
      return false;
    }
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5); diff -= h * 36e5;
    const m = Math.floor(diff / 6e4); diff -= m * 6e4;
    setCell(cells.d, d); setCell(cells.h, h); setCell(cells.m, m); setCell(cells.s, Math.floor(diff / 1000));
    return true;
  }
  if (tickCountdown()) {
    const cdTimer = setInterval(() => { if (!tickCountdown()) clearInterval(cdTimer); }, 1000);
  }

  /* ---------- calendar ---------- */
  const ymd = s => s.replace(/-/g, '');
  const nextDay = s => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10).replace(/-/g, ''); };
  const icsText = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const fold = line => line.length <= 73 ? line : line.match(/.{1,73}/g).join('\r\n ');

  function buildICS() {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Abhijeet and Priyanka//Wedding Invitation//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    C.events.forEach(ev => {
      const { v } = parts(ev);
      const name = `${ev.parts ? ev.parts.join(', ') : ev.title}${ev.sub ? ' ' + ev.sub : ''}`;
      L.push('BEGIN:VEVENT', `UID:${ev.id}-${ymd(ev.date)}@abhijeet-priyanka`, `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${ymd(ev.date)}`, `DTEND;VALUE=DATE:${nextDay(ev.date)}`,
        `SUMMARY:${icsText(`${name} — ${C.groom} & ${C.bride}`)}`,
        `LOCATION:${icsText(v ? `${v.name}, ${v.address}` : ev.place)}`,
        `DESCRIPTION:${icsText(ev.tagline + (ev.time ? `\n${ev.time}` : '') + (v ? `\nDirections: ${v.directions}` : ''))}`,
        'END:VEVENT');
    });
    L.push('END:VCALENDAR');
    return L.map(fold).join('\r\n');
  }

  $('#addCal').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([buildICS()], { type: 'text/calendar;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `${C.groom}-${C.bride}-Wedding.ics` });
    document.body.appendChild(a);
    a.click();
    a.remove();
    later(4000, () => URL.revokeObjectURL(url));
  });

  const main = C.events.find(e => e.date === C.countdownTo.slice(0, 10)) || C.events[0];
  const mainVenue = parts(main).v;
  $('#gcal').href = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
    action: 'TEMPLATE',
    text: `${C.groom} & ${C.bride} — ${main.title}${main.sub ? ' ' + main.sub : ''}`,
    dates: `${ymd(main.date)}/${nextDay(main.date)}`,
    location: mainVenue ? `${mainVenue.name}, ${mainVenue.address}` : main.place,
    details: `${C.span}\n${location.href.split(/[?#]/)[0]}`
  });

  /* ---------- maps (load only when near) ---------- */
  const mapIO = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const frame = $('iframe', e.target);
    frame.addEventListener('load', () => e.target.classList.add('is-loaded'), { once: true });
    frame.src = frame.dataset.src;
    mapIO.unobserve(e.target);
  }), { rootMargin: '400px 0px' });
  $$('.venue__map').forEach(el => mapIO.observe(el));

  /* ---------- music ---------- */
  const mb = $('#musicBtn');
  Music.on(state => {
    mb.classList.toggle('is-playing', state);
    mb.setAttribute('aria-pressed', String(state));
    mb.setAttribute('aria-label', state ? 'Pause music' : 'Play music');
  });
  mb.addEventListener('click', () => Music.toggle());
  later(500, () => Music.prepare());

  /* ---------- diya, rsvp, share ---------- */
  const diya = $('#diya');
  diya.addEventListener('click', () => {
    if (diya.classList.contains('is-lit')) return;
    diya.classList.add('is-lit');
    $('.diya__label', diya).textContent = 'Thank you for your blessings';
    const r = $('svg', diya).getBoundingClientRect();
    Petals.burst({ x: r.left + r.width / 2, y: r.top + r.height * 0.3, count: 18, kinds: ['sparkle', 'gold'], power: 0.5 });
    Petals.shower({ count: 34, duration: 2800, kinds: ['rose', 'marigold', 'rose'] });
  });

  if (C.rsvp && C.rsvp.whatsapp) {
    const msg = guest
      ? `Namaste! ${guest} will be there to bless ${C.groom} & ${C.bride} 🎉`
      : `Namaste! We will be there to bless ${C.groom} & ${C.bride} 🎉`;
    const rsvp = $('#rsvpBtn');
    rsvp.href = `https://wa.me/${C.rsvp.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    rsvp.hidden = false;
  }

  $('#shareBtn').addEventListener('click', async () => {
    const url = location.href.split(/[?#]/)[0];
    const text = `${C.groom} ♥ ${C.bride} · Wedding Invitation · ${C.span}`;
    if (navigator.share) {
      try { await navigator.share({ title: `${C.groom} & ${C.bride}`, text, url }); } catch (e) { /* closed */ }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank', 'noopener');
    }
  });

  /* ---------- scroll progress & parallax ---------- */
  const bar = $('#progress');
  const floaters = $$('[data-parallax]');
  let ticking = false;
  function onScroll() {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    if (reduce) return;
    floaters.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      const k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.setProperty('--py', `${(k * -28).toFixed(1)}px`);
    });
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  let resizeTimer = 0;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(renderGarland, 200); }, { passive: true });

  root.classList.add('is-ready');
})();

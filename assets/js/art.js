/* Hand-built SVG ornaments: rangoli emblems, marigold toran, floral dividers, corners, kalash, diya, wax seal. */
window.Art = (() => {
  const f = n => +n.toFixed(2);
  const TAU = Math.PI * 2;

  // Teardrop petal pointing up, from radius r0 to r1 with half-width w
  function petal(r0, r1, w) {
    const a = r0 + (r1 - r0) * 0.38, b = r0 + (r1 - r0) * 0.82;
    return `M0 ${f(-r0)}C${f(w)} ${f(-a)} ${f(w * 0.5)} ${f(-b)} 0 ${f(-r1)}C${f(-w * 0.5)} ${f(-b)} ${f(-w)} ${f(-a)} 0 ${f(-r0)}Z`;
  }
  function ring(n, d, cls, offset = 0) {
    let s = '';
    for (let i = 0; i < n; i++) s += `<path d="${d}" transform="rotate(${f(offset + (360 / n) * i)})" class="${cls}"/>`;
    return s;
  }
  function dots(n, r, size, cls, offset = 0) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = ((offset + (360 / n) * i) * Math.PI) / 180;
      s += `<circle cx="${f(Math.sin(a) * r)}" cy="${f(-Math.cos(a) * r)}" r="${size}" class="${cls}"/>`;
    }
    return s;
  }
  // Scalloped disc (for marigolds)
  function scallop(r, k, bump) {
    let d = '';
    for (let i = 0; i < k; i++) {
      const a0 = (i / k) * TAU, a1 = ((i + 1) / k) * TAU, am = (a0 + a1) / 2;
      if (!i) d += `M${f(Math.cos(a0) * r)} ${f(Math.sin(a0) * r)}`;
      d += `Q${f(Math.cos(am) * (r + bump))} ${f(Math.sin(am) * (r + bump))} ${f(Math.cos(a1) * r)} ${f(Math.sin(a1) * r)}`;
    }
    return d + 'Z';
  }

  /* Event emblem: three counter-rotating rings of petals around a disc */
  function rangoli() {
    return `<svg class="rangoli" viewBox="-110 -110 220 220" aria-hidden="true">
      <g class="rg rg--outer">${ring(24, petal(80, 102, 5.5), 'rg-line')}${dots(24, 105, 1.8, 'rg-dot', 7.5)}</g>
      <g class="rg rg--mid">${ring(12, petal(46, 86, 19), 'rg-fill')}${ring(12, petal(53, 78, 7), 'rg-line')}${dots(12, 89, 2.4, 'rg-dot2', 15)}</g>
      <g class="rg--inner">${ring(16, petal(43, 57, 5), 'rg-accent', 11.25)}<circle r="44" class="rg-disk"/><circle r="39.5" class="rg-line"/></g>
    </svg>`;
  }

  /* Large line mandala for the envelope backdrop */
  function mandala() {
    return `<svg viewBox="-230 -230 460 460" aria-hidden="true" fill="none" stroke="currentColor" stroke-width=".7">
      <circle r="222"/><circle r="214"/>
      ${ring(48, petal(160, 210, 7), '')}
      ${ring(32, petal(112, 160, 14), '')}
      ${ring(16, petal(64, 116, 22), '')}
      ${ring(16, petal(72, 104, 9), '')}
      <circle r="62"/><circle r="56"/>
      ${ring(12, petal(22, 54, 10), '')}
      <circle r="18"/>
      <g fill="currentColor" stroke="none">${dots(48, 218, 1.6, '', 3.75)}${dots(32, 164, 1.8, '', 5.6)}</g>
    </svg>`;
  }

  /* Marigold toran sized to a given width */
  function garland(W) {
    const H = 132;
    const n = Math.max(3, Math.round(W / (W < 640 ? 88 : 124)));
    const step = W / n;
    const defs = `<defs>
      <radialGradient id="mgO" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#FFC857"/><stop offset=".55" stop-color="#F28A10"/><stop offset="1" stop-color="#C45A06"/></radialGradient>
      <radialGradient id="mgY" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#FFEA8A"/><stop offset=".55" stop-color="#F7BD1D"/><stop offset="1" stop-color="#D08A05"/></radialGradient>
      <radialGradient id="mgR" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#F06A7E"/><stop offset=".55" stop-color="#B8172F"/><stop offset="1" stop-color="#7C0B1C"/></radialGradient>
      <linearGradient id="bell" x1="0" x2="1"><stop offset="0" stop-color="#8C6420"/><stop offset=".45" stop-color="#F3DD9A"/><stop offset="1" stop-color="#A47A2C"/></linearGradient>
      <g id="mg-o"><path d="${scallop(6.4, 11, 1.9)}" fill="url(#mgO)"/><path d="${scallop(4.1, 9, 1.3)}" fill="url(#mgO)" stroke="rgba(140,55,0,.35)" stroke-width=".5"/><circle r="1.5" fill="#A84A05"/></g>
      <g id="mg-y"><path d="${scallop(6.4, 11, 1.9)}" fill="url(#mgY)"/><path d="${scallop(4.1, 9, 1.3)}" fill="url(#mgY)" stroke="rgba(150,95,0,.35)" stroke-width=".5"/><circle r="1.5" fill="#C27D04"/></g>
      <g id="mg-r"><path d="${scallop(7.4, 12, 2)}" fill="url(#mgR)"/><path d="${scallop(4.6, 9, 1.4)}" fill="url(#mgR)" stroke="rgba(60,0,10,.35)" stroke-width=".5"/><circle r="1.6" fill="#5A0613"/></g>
      <path id="leaf" d="M0 0C4 -3 11 -3 15 0C11 3 4 3 0 0Z" fill="#4F7A28"/>
    </defs>`;
    let swags = '', strands = '', roses = '';
    for (let i = 0; i < n; i++) {
      const x0 = i * step, x1 = (i + 1) * step, mx = (x0 + x1) / 2, dip = 30 + (i % 2) * 6;
      const count = Math.max(6, Math.round(step / 7.6));
      for (let j = 1; j < count; j++) {
        const t = j / count, u = 1 - t;
        const x = u * u * x0 + 2 * u * t * mx + t * t * x1;
        const y = u * u * 6 + 2 * u * t * (6 + dip * 2) + t * t * 6;
        swags += `<use href="#mg-${j % 2 ? 'o' : 'y'}" x="${f(x)}" y="${f(y)}"/>`;
      }
    }
    for (let i = 0; i <= n; i++) {
      const x = i * step, len = i % 2 ? 5 : 7, delay = (i * 0.37) % 2.4;
      let s = `<g class="strand" style="animation-delay:-${f(delay)}s"><path d="M${f(x)} 4V${f(14 + (len - 1) * 11.5)}" stroke="#7A4B12" stroke-width=".8"/>`;
      for (let k = 0; k < len; k++) s += `<use href="#mg-${k % 2 ? 'y' : 'o'}" x="${f(x)}" y="${f(16 + k * 11.5)}"/>`;
      const by = 16 + len * 11.5;
      s += `<path d="M${f(x - 4.5)} ${f(by + 6)}C${f(x - 4.5)} ${f(by - 2)} ${f(x + 4.5)} ${f(by - 2)} ${f(x + 4.5)} ${f(by + 6)}L${f(x + 6)} ${f(by + 8.5)}H${f(x - 6)}Z" fill="url(#bell)"/><circle cx="${f(x)}" cy="${f(by + 10)}" r="1.6" fill="#8C6420"/></g>`;
      strands += s;
      roses += `<use href="#leaf" transform="translate(${f(x)} 7) rotate(-160)"/><use href="#leaf" transform="translate(${f(x)} 7) rotate(-20)"/><use href="#mg-r" x="${f(x)}" y="7"/>`;
    }
    return `<svg viewBox="0 0 ${f(W)} ${H}" width="${f(W)}" height="${H}" aria-hidden="true">${defs}
      <path d="M0 3.5H${f(W)}" stroke="#8C6420" stroke-width="1.4"/>${swags}${strands}${roses}</svg>`;
  }

  /* Floral vine divider that draws itself in */
  function divider() {
    const vine = 'M160 27C147 27 139 18 125 20S101 34 85 28S59 15 43 21S19 31 6 25';
    const leaves = [[125, 20, -32], [99, 31, 24], [71, 22, -24], [45, 21, 28], [24, 28, -14]];
    const side = `<path class="dv-vine" pathLength="1" d="${vine}"/>` +
      leaves.map(([x, y, a], i) => `<path class="dv-leaf" style="--i:${i}" d="M0 0C3 -4.5 9 -4.5 12 0C9 4.5 3 4.5 0 0Z" transform="translate(${x} ${y}) rotate(${a + (i % 2 ? 160 : -20)})"/>`).join('') +
      `<circle class="dv-bud" cx="6" cy="25" r="2"/><circle class="dv-bud" cx="112" cy="28" r="1.3"/><circle class="dv-bud" cx="58" cy="17" r="1.3"/>`;
    const lotus = [-64, -32, 0, 32, 64].map((a, i) => {
      const h = i === 2 ? 22 : Math.abs(a) > 40 ? 13 : 17;
      return `<path class="dv-petal" d="M160 ${30 - h}C${165 - (i === 2 ? 0 : 1)} ${30 - h * 0.6} ${165} ${26} 160 30C155 26 155 ${30 - h * 0.6} 160 ${30 - h}Z" transform="rotate(${a} 160 30)"/>`;
    }).join('');
    return `<svg class="divider" viewBox="0 0 320 40" aria-hidden="true">
      <g>${side}</g><g transform="matrix(-1 0 0 1 320 0)">${side}</g>
      <g class="dv-lotus">${lotus}<path class="dv-vine" pathLength="1" d="M146 31Q160 37 174 31"/></g>
    </svg>`;
  }

  /* Filigree for card corners (top-left; mirrored with CSS) */
  function corner() {
    return `<svg viewBox="0 0 120 120" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round">
      <path d="M6 116V44C6 22 22 6 44 6H116"/>
      <path d="M14 96V46C14 28 28 14 46 14H96" opacity=".6"/>
      <path d="M24 62C24 40 40 24 62 24"/>
      <path d="M34 34C40 26 52 26 54 34S44 46 39 40S43 30 48 34"/>
      <path d="M24 74C20 82 26 92 34 88S36 76 30 78"/>
      <path d="M74 24C82 20 92 26 88 34S76 36 78 30"/>
      <path d="M62 24C70 16 80 14 90 18" opacity=".7"/><path d="M24 62C16 70 14 80 18 90" opacity=".7"/>
      <g fill="currentColor" stroke="none"><circle cx="102" cy="6" r="2"/><circle cx="6" cy="102" r="2"/><circle cx="26" cy="26" r="2.4"/><circle cx="110" cy="10" r="1.2"/><circle cx="10" cy="110" r="1.2"/></g>
    </svg>`;
  }

  /* Kalash with mango leaves and coconut */
  function kalash() {
    return `<svg viewBox="0 0 64 74" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
      <g fill="currentColor" fill-opacity=".14">
        <path d="M32 27C24 24 15 25 7 30C15 33 25 32 32 27Z"/><path d="M32 27C40 24 49 25 57 30C49 33 39 32 32 27Z"/>
        <path d="M32 27C27 21 21 17 13 16C17 22 24 26 32 27Z"/><path d="M32 27C37 21 43 17 51 16C47 22 40 26 32 27Z"/>
        <ellipse cx="32" cy="17" rx="7.5" ry="9"/>
        <path d="M26 34C16 37 12 46 15 54C18 62 25 66 32 66C39 66 46 62 49 54C52 46 48 37 38 34Z"/>
      </g>
      <path d="M32 8C31 5 32 3 34 1.5M29 12C30 16 30 20 29 24M35 12C34 16 34 20 35 24"/>
      <path d="M21 28H43M24 28C24 31 26 32 26 34H38C38 32 40 31 40 28"/>
      <path d="M15.6 46C26 50.5 38 50.5 48.4 46M16 52C26 56 38 56 48 52"/>
      <path d="M27 66L25 71H39L37 66"/>
      <g fill="currentColor" stroke="none"><circle cx="24" cy="54.8" r="1.1"/><circle cx="32" cy="55.8" r="1.1"/><circle cx="40" cy="54.8" r="1.1"/><circle cx="28" cy="60" r=".9"/><circle cx="36" cy="60" r=".9"/></g>
    </svg>`;
  }

  /* Golden Ganesha emblem: mukut, ears, tilak, trunk curling to the right, halo behind */
  let gid = 0;
  function ganesha() {
    const u = 'gn' + (++gid);
    const trunkSides = 'M107 124C104 146 105 168 112 188C119 208 138 222 158 217C175 213 184 199 178 187C174 180 165 180 163 187C161 195 154 200 146 199C134 198 126 188 126 176C126 158 133 140 133 124';
    const trunk = `M104 103C106 111 107 118 107 124${trunkSides.slice(trunkSides.indexOf('C'))}C133 118 134 111 136 103Z`;
    const ear = 'M82 98C62 78 32 80 20 106C12 126 18 146 26 158C33 170 33 184 46 192C58 198 71 192 77 182C81 172 83 162 87 152Z';
    const earFold = 'M78 108C60 92 34 94 26 114C20 132 28 150 36 162C42 172 46 180 56 186';
    const earDots = 'M76 118C61 105 42 106 36 121C32 136 38 150 46 162C51 171 55 177 63 181';
    const mirror = 'matrix(-1 0 0 1 240 0)';
    const pearls = (n, x0, x1, y, dip, r) => {
      let s = '';
      for (let i = 0; i <= n; i++) {
        const t = i / n, x = x0 + (x1 - x0) * t, y2 = y + dip * 4 * t * (1 - t);
        s += `<circle cx="${f(x)}" cy="${f(y2)}" r="${r}"/>`;
      }
      return s;
    };
    return `<svg class="ganesha" viewBox="0 0 240 236" aria-hidden="true">
      <defs>
        <linearGradient id="${u}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FCEDB8"/><stop offset=".45" stop-color="#DDB45C"/><stop offset="1" stop-color="#A9792A"/></linearGradient>
        <linearGradient id="${u}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EBCB7C"/><stop offset="1" stop-color="#B0812F"/></linearGradient>
        <radialGradient id="${u}h"><stop offset="0" stop-color="#FFE7A0" stop-opacity=".6"/><stop offset=".7" stop-color="#FFE7A0" stop-opacity=".12"/><stop offset="1" stop-color="#FFE7A0" stop-opacity="0"/></radialGradient>
        <radialGradient id="${u}s"><stop offset="0" stop-color="#FFFBEA" stop-opacity=".7"/><stop offset="1" stop-color="#FFFBEA" stop-opacity="0"/></radialGradient>
        <clipPath id="${u}t"><path d="${trunk}"/></clipPath>
      </defs>
      <circle cx="120" cy="118" r="116" fill="url(#${u}h)"/>
      <g class="ganesha__halo" fill="none" stroke="#C49A45" stroke-width=".8" opacity=".55" transform="translate(120 118)">
        <circle r="111"/>${ring(32, petal(95, 109, 4), '')}
      </g>
      <g stroke="#6E4A12" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
        <path d="${ear}" fill="url(#${u}b)"/>
        <path d="${ear}" fill="url(#${u}b)" transform="${mirror}"/>
        <g fill="none">
          <path d="${earFold}" stroke-width="1"/><path d="${earFold}" stroke-width="1" transform="${mirror}"/>
          <path d="${earDots}" stroke="#8C1424" stroke-width="2.6" stroke-dasharray="0.1 7"/>
          <path d="${earDots}" stroke="#8C1424" stroke-width="2.6" stroke-dasharray="0.1 7" transform="${mirror}"/>
        </g>
        <path d="M76 96C70 130 80 160 100 180C110 189 130 189 140 180C160 160 170 130 164 96Z" fill="url(#${u}a)"/>
        <ellipse cx="90" cy="142" rx="11" ry="16" fill="url(#${u}s)" stroke="none"/><ellipse cx="150" cy="142" rx="11" ry="16" fill="url(#${u}s)" stroke="none" opacity=".6"/>
        <path d="M108 166C100 174 94 184 90 198C99 192 106 184 112 176Z" fill="#FFF8E8"/>
        <path d="M130 167C136 171 140 175 142 180L135 182C133 177 131 174 127 172Z" fill="#FFF8E8"/>
        <path d="M72 94C58 86 56 70 64 58C66 70 72 80 82 88ZM168 94C182 86 184 70 176 58C174 70 168 80 158 88Z" fill="url(#${u}b)"/>
        <path d="M80 88C82 66 96 46 105 26H135C144 46 158 66 160 88Z" fill="url(#${u}a)"/>
        <path d="M86 68Q120 59 154 68M96 47Q120 40 144 47" fill="none" stroke-width="1.1"/>
        <g fill="#FFF4D8" stroke-width=".6">${pearls(8, 91, 149, 73, -3, 1.9)}${pearls(6, 100, 140, 52, -2.4, 1.6)}</g>
        <path d="M120 0C129 9 131 18 120 28C109 18 111 9 120 0Z" fill="url(#${u}a)"/>
        <path d="M120 28C111 27 104 22 101 14C110 14 117 20 120 28ZM120 28C129 27 136 22 139 14C130 14 123 20 120 28Z" fill="url(#${u}b)"/>
        <path d="M70 95C92 80 148 80 170 95L170 104C148 89 92 89 70 104Z" fill="url(#${u}b)"/>
        <g fill="#B3172E" stroke="#6E4A12" stroke-width=".8">
          <ellipse cx="120" cy="77" rx="5" ry="6.5"/><ellipse cx="120" cy="56" rx="3.6" ry="4.8"/><ellipse cx="120" cy="37" rx="2.8" ry="3.6"/>
          <circle cx="120" cy="89" r="4.4"/><circle cx="95" cy="92.5" r="2.4"/><circle cx="145" cy="92.5" r="2.4"/>
        </g>
        <path d="${trunk}" fill="url(#${u}a)" stroke="none"/>
        <g clip-path="url(#${u}t)" fill="none" stroke-width=".9" opacity=".65">
          <path d="M98 134Q120 139 142 134M98 144Q120 149 142 144M98 154Q120 159 142 154M98 164Q120 169 142 164M98 174Q120 179 142 174"/>
        </g>
        <path d="${trunkSides}" fill="none"/>
        <path d="M104 103C106 111 107 118 107 124M136 103C134 111 133 118 133 124" fill="none" stroke-width="1" opacity=".45"/>
        <path d="M113 128C111 146 111 166 117 184" fill="none" stroke="#FFF6D8" stroke-width="1.6" opacity=".55"/>
        <path d="M86 111Q98 103 110 108M130 108Q142 103 154 111" fill="none" stroke-width="1.7"/>
        <path d="M88 121Q98 112 109 120Q98 126 88 121ZM131 120Q142 112 152 121Q142 126 131 120Z" fill="#FFF8E8" stroke-width="1.2"/>
        <circle cx="100" cy="119.6" r="2.7" fill="#2B1A10" stroke="none"/><circle cx="140" cy="119.6" r="2.7" fill="#2B1A10" stroke="none"/>
        <path d="M120 93C125 99 126 105 120 112C114 105 115 99 120 93Z" fill="#B3172E" stroke-width=".9"/>
      </g>
    </svg>`;
  }

  /* Small lotus finial */
  function lotus() {
    return `<svg viewBox="0 0 60 34" aria-hidden="true">
      <g fill="currentColor" fill-opacity=".18" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round">
        <path d="M30 2C36 10 37 22 30 32C23 22 24 10 30 2Z"/>
        <path d="M30 32C26 20 18 13 9 12C10 22 18 30 30 32Z"/><path d="M30 32C34 20 42 13 51 12C50 22 42 30 30 32Z"/>
        <path d="M30 32C22 26 10 25 2 28C8 33 20 34 30 32Z"/><path d="M30 32C38 26 50 25 58 28C52 33 40 34 30 32Z"/>
      </g></svg>`;
  }

  /* Diya with a flame that lights on tap */
  function diya() {
    return `<svg viewBox="0 0 120 100" aria-hidden="true">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE7A3" stop-opacity=".9"/><stop offset=".4" stop-color="#FFB547" stop-opacity=".35"/><stop offset="1" stop-color="#FF8A00" stop-opacity="0"/></radialGradient>
        <linearGradient id="flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF5A00"/><stop offset=".45" stop-color="#FFA41B"/><stop offset="1" stop-color="#FFE9A8"/></linearGradient>
        <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6E3A6"/><stop offset=".5" stop-color="#C49A45"/><stop offset="1" stop-color="#7E5719"/></linearGradient>
      </defs>
      <circle class="diya__glow" cx="60" cy="34" r="34" fill="url(#glow)"/>
      <g class="diya__flame"><path d="M60 10C67 23 72 32 67 41C65 45 62.5 47 60 47C57.5 47 55 45 53 41C48 32 53 23 60 10Z" fill="url(#flame)"/><path d="M60 27C63.5 33 64.5 38 60 44C55.5 38 56.5 33 60 27Z" fill="#FFF7DC"/></g>
      <path d="M60 46V52" stroke="#3A1F1A" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M14 53C18 70 38 80 60 80C82 80 102 70 106 53Z" fill="url(#brass)"/>
      <ellipse cx="60" cy="53" rx="46" ry="7.5" fill="#8C6420"/><ellipse cx="60" cy="52.4" rx="41" ry="5.4" fill="#5A3A0E"/>
      <path d="M24 63C44 71 76 71 96 63" fill="none" stroke="#FFF2C6" stroke-opacity=".55" stroke-width="1.2" stroke-dasharray="1.5 3.5" stroke-linecap="round"/>
      <path d="M48 80L44 87H76L72 80Z" fill="url(#brass)"/>
    </svg>`;
  }

  /* Wax seal with the couple's initials */
  function seal(a, b) {
    let d = '', seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const pts = [];
    for (let i = 0; i < 18; i++) {
      const ang = (i / 18) * TAU, r = 46 + (rnd() - 0.5) * 6;
      pts.push([Math.cos(ang) * r, Math.sin(ang) * r]);
    }
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      d += i ? `Q${f(p[0])} ${f(p[1])} ${f(mx)} ${f(my)}` : `M${f(mx)} ${f(my)}`;
    });
    d += `Q${f(pts[0][0])} ${f(pts[0][1])} ${f((pts[0][0] + pts[1][0]) / 2)} ${f((pts[0][1] + pts[1][1]) / 2)}Z`;
    return `<svg viewBox="-52 -52 104 104" aria-hidden="true">
      <defs>
        <radialGradient id="wax" cx="38%" cy="32%" r="78%"><stop offset="0" stop-color="#D2283F"/><stop offset=".55" stop-color="#8E0E21"/><stop offset="1" stop-color="#560512"/></radialGradient>
        <linearGradient id="sealGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBEBB8"/><stop offset=".5" stop-color="#D4AA55"/><stop offset="1" stop-color="#9C7428"/></linearGradient>
      </defs>
      <path d="${d}" fill="url(#wax)"/>
      <circle r="34" fill="none" stroke="#3E0410" stroke-opacity=".55" stroke-width="2.4"/>
      <circle r="34" fill="none" stroke="#FF9AA8" stroke-opacity=".22" stroke-width="1" transform="translate(-.8 -.8)"/>
      <g fill="none" stroke="url(#sealGold)" stroke-width=".8" opacity=".75">${ring(12, petal(27, 33, 2.4), '')}</g>
      <text x="-10" y="9" text-anchor="middle" class="seal__l">${a}</text>
      <text x="11" y="15" text-anchor="middle" class="seal__l">${b}</text>
    </svg>`;
  }

  return { rangoli, mandala, garland, divider, corner, kalash, ganesha, lotus, diya, seal };
})();

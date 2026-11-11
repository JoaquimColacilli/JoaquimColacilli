import { Doc, r } from '../lib/svg.mjs';
import { card, baseCss, gradient, noise, seeded, centerBaseline } from '../lib/ui.mjs';
import { WIDTH, COMPACT, type } from '../theme.mjs';
import { profile } from '../content.mjs';

// Same curves as the portfolio's <FloatingPaths /> (viewBox 696×316).
function floatingPaths(position) {
  return Array.from({ length: 36 }, (_, i) => ({
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
    opacity: 0.02 + i * 0.015,
  }));
}

const DESKTOP = {
  W: WIDTH,
  H: 382,
  pad: 48,
  radius: 20,
  eyebrow: type.eyebrow,
  corner: type.label,
  firstBase: 72,
  name: type.name,
  nameGap: 72,
  role: type.role,
  roleGap: 46,
  lead: type.lead,
  leadGap: 40,
  leadWidth: 560,
  leadLine: 27,
  pillH: 36,
  pillText: { ...type.item, size: 14 },
  focus: true,
  pathsScale: WIDTH / 696,
  pathsX: 0,
};

const COMPACT_LAYOUT = {
  W: COMPACT,
  H: 318,
  pad: 24,
  radius: 18,
  eyebrow: { ...type.eyebrow, size: 10.5 },
  corner: { ...type.label, size: 9.5, tracking: 0.1 },
  firstBase: 48,
  name: { ...type.name, size: 35 },
  nameGap: 48,
  role: { ...type.role, size: 15.5 },
  roleGap: 30,
  lead: { ...type.lead, size: 14.5 },
  leadGap: 30,
  leadWidth: COMPACT - 48,
  leadLine: 22,
  pillH: 34,
  pillText: { ...type.item, size: 13.5 },
  focus: false,
  pathsScale: 1.02,
  pathsX: -170,
};

export function hero(t, { compact = false, glyphs, idPrefix } = {}) {
  const L = compact ? COMPACT_LAYOUT : DESKTOP;
  const { W, H, pad } = L;
  const doc = new Doc({
    width: W,
    height: H,
    glyphs,
    idPrefix,
    title: `${profile.name} — ${profile.role}`,
    desc: `${profile.summary} Now: ${profile.now.text}. Based in ${profile.location}.`,
  });
  baseCss(doc);
  doc.style(
    '.fp path{stroke-dasharray:.62 1;animation:flow var(--d) linear infinite;animation-delay:var(--o)}' +
      '@keyframes flow{0%{stroke-dashoffset:0;opacity:.4}50%{stroke-dashoffset:-.81;opacity:1}100%{stroke-dashoffset:-1.62;opacity:.4}}' +
      '.pulse{transform-box:fill-box;transform-origin:center;animation:pulse 2.4s cubic-bezier(0,0,.2,1) infinite}' +
      '@keyframes pulse{0%{transform:scale(1);opacity:.6}80%,100%{transform:scale(3.2);opacity:0}}' +
      '.glow{transform-box:fill-box;transform-origin:center;animation:breathe 7s ease-in-out infinite}' +
      '@keyframes breathe{0%,100%{opacity:.75;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}',
  );

  const clip = doc.uid('clip');
  doc.def(`<clipPath id="${clip}"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${L.radius}"/></clipPath>`);
  card(doc, t, { w: W, h: H, radius: L.radius });

  // ── atmosphere ───────────────────────────────────────────────
  const gA = doc.uid('ga');
  const gB = doc.uid('gb');
  doc.def(
    `<radialGradient id="${gA}"><stop stop-color="${t.glowA}" stop-opacity="${t.glowAOpacity}"/><stop offset="1" stop-color="${t.glowA}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${gB}"><stop stop-color="${t.glowB}" stop-opacity="${t.glowBOpacity}"/><stop offset="1" stop-color="${t.glowB}" stop-opacity="0"/></radialGradient>`,
  );
  doc.add(`<g clip-path="url(#${clip})">`);
  doc.add(`<circle class="glow" cx="${r(W * 0.25)}" cy="${r(H * 0.25)}" r="${r(W * 0.39)}" fill="url(#${gA})"/>`);
  doc.add(`<circle class="glow" style="animation-delay:-3.5s" cx="${r(W * 0.83)}" cy="${r(H * 0.9)}" r="${r(W * 0.36)}" fill="url(#${gB})"/>`);

  // dot grid, fading towards the edges
  const dots = doc.uid('dots');
  const dm = doc.uid('dm');
  const dg = doc.uid('dg');
  doc.def(
    `<pattern id="${dots}" width="24" height="24" patternUnits="userSpaceOnUse" x="11" y="11"><circle cx="1" cy="1" r="1" fill="${t.dots}" fill-opacity="${t.dotOpacity}"/></pattern>`,
    `<radialGradient id="${dg}" cx="62%" cy="40%" r="62%"><stop stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`,
    `<mask id="${dm}"><rect width="${W}" height="${H}" fill="url(#${dg})"/></mask>`,
  );
  doc.add(`<rect width="${W}" height="${H}" fill="url(#${dots})" mask="url(#${dm})"/>`);

  // flowing paths, faded out behind the text column
  const pm = doc.uid('pm');
  const pg = doc.uid('pg');
  doc.def(
    `<linearGradient id="${pg}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#fff" stop-opacity="${compact ? 0.3 : 0.1}"/><stop offset=".48" stop-color="#fff" stop-opacity="${compact ? 0.5 : 0.28}"/><stop offset=".7" stop-color="#fff" stop-opacity=".85"/><stop offset=".85" stop-color="#fff"/></linearGradient>`,
    `<mask id="${pm}"><rect width="${W}" height="${H}" fill="url(#${pg})"/></mask>`,
  );
  const rand = seeded(7);
  const sc = L.pathsScale;
  doc.add(
    `<g mask="url(#${pm})"><g class="fp" transform="translate(${L.pathsX} ${r((H - 316 * sc) / 2)}) scale(${r(sc, 4)})" stroke="${t.strokes}" fill="none">`,
  );
  for (const position of [1, -1]) {
    for (const p of floatingPaths(position)) {
      const dur = 20 + rand() * 12;
      const off = -rand() * dur;
      doc.add(
        `<path d="${p.d}" pathLength="1" stroke-width="${r(p.width, 3)}" stroke-opacity="${r(p.opacity * 0.7 * t.strokeScale, 4)}" style="--d:${r(dur, 1)}s;--o:${r(off, 1)}s"/>`,
      );
    }
  }
  doc.add('</g></g>');
  noise(doc, { w: W, h: H, opacity: t.noiseOpacity });
  doc.add('</g>');

  // a lit edge on the top-left corner
  const edge = doc.uid('edge');
  doc.def(
    `<linearGradient id="${edge}" x1="0" y1="0" x2="${r(W * 0.55)}" y2="${H}" gradientUnits="userSpaceOnUse"><stop stop-color="${t.accent}" stop-opacity="${t.name === 'dark' ? 0.55 : 0.4}"/><stop offset=".5" stop-color="${t.accent}" stop-opacity="0"/></linearGradient>`,
  );
  doc.add(`<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="${L.radius}" stroke="url(#${edge})"/>`);

  // ── content ──────────────────────────────────────────────────
  let y = L.firstBase;
  doc.add('<g class="rise">');
  doc.text(profile.greeting.toUpperCase(), { ...L.eyebrow, x: pad, y, fill: t.muted });
  doc.text(`${profile.location.toUpperCase()}  ·  ${profile.timezone}`, { ...L.corner, x: W - pad, y, anchor: 'end', fill: t.faint });
  doc.add('</g>');

  y += L.nameGap;
  const name = doc.textPath(profile.name, { ...L.name, x: pad - L.name.size * 0.05, y });
  const fill = gradient(doc, t.gradient, name.x, name.x + name.width);
  doc.add(`<g class="rise" style="animation-delay:.12s"><path d="${name.d}" fill="${fill}"/></g>`);

  // a slow sheen across the name
  const nm = doc.uid('nm');
  const sw = doc.uid('sw');
  const travel = name.width + 260;
  doc.def(
    `<mask id="${nm}"><path d="${name.d}" fill="#fff"/></mask>`,
    `<linearGradient id="${sw}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity="${t.name === 'dark' ? 0.42 : 0.55}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
  );
  doc.style(
    `.sweep{animation:sweep 9s cubic-bezier(.45,0,.25,1) 2.2s infinite both}@keyframes sweep{0%{transform:translateX(0)}35%,100%{transform:translateX(${r(travel)}px)}}`,
  );
  doc.add(
    `<g mask="url(#${nm})"><rect class="sweep" x="${r(name.x - 200)}" y="${r(y - L.name.size * 1.05)}" width="150" height="${r(L.name.size * 1.4)}" fill="url(#${sw})"/></g>`,
  );

  y += L.roleGap;
  doc.add('<g class="rise" style="animation-delay:.22s">');
  const roleLines = doc.wrap([{ text: profile.role, style: { ...L.role, fill: t.cyan } }], W - pad * 2);
  doc.lines(roleLines, { x: pad, y, lineHeight: L.role.size * 1.3 });
  y += (roleLines.length - 1) * L.role.size * 1.3;
  doc.add('</g>');

  y += L.leadGap;
  const lead = { ...L.lead, fill: t.lead };
  const lines = doc.wrap([{ text: profile.summary, style: lead }], L.leadWidth);
  doc.add('<g class="rise" style="animation-delay:.32s">');
  doc.lines(lines, { x: pad, y, lineHeight: L.leadLine });
  doc.add('</g>');

  // status pill
  const rowTop = H - pad - L.pillH + (compact ? 2 : 0);
  const pillH = L.pillH;
  const nowStyle = { ...type.label, size: compact ? 10 : 10.5 };
  const textStyle = L.pillText;
  const focusStyle = { ...textStyle, font: 'text-regular' };
  const nowW = doc.measure(profile.now.label, nowStyle);
  const txtW = doc.measure(profile.now.text, textStyle);
  const focusText = L.focus ? `·  ${profile.focus}` : '';
  const focusW = focusText ? doc.measure(focusText, focusStyle) + 10 : 0;
  const pillW = 16 + 8 + 12 + nowW + 12 + 1 + 12 + txtW + focusW + 16;
  doc.add('<g class="rise" style="animation-delay:.42s">');
  doc.add(
    `<rect x="${pad + 0.5}" y="${rowTop + 0.5}" width="${r(pillW - 1)}" height="${pillH - 1}" rx="${(pillH - 1) / 2}" fill="${t.elevated}" fill-opacity="${t.name === 'dark' ? 0.85 : 1}" stroke="${t.border}"/>`,
  );
  const cy = rowTop + pillH / 2;
  const dx = pad + 16 + 4;
  doc.add(`<circle class="pulse" cx="${dx}" cy="${cy}" r="4" fill="${t.live}"/>`);
  doc.add(`<circle cx="${dx}" cy="${cy}" r="4" fill="${t.live}"/>`);
  let x = dx + 4 + 12;
  doc.text(profile.now.label, { ...nowStyle, x, y: centerBaseline(rowTop, pillH, nowStyle), fill: t.muted });
  x += nowW + 12;
  doc.add(`<path d="M${r(x + 0.5)} ${rowTop + 11}V${rowTop + pillH - 11}" stroke="${t.border}"/>`);
  x += 13;
  const main = doc.text(profile.now.text, { ...textStyle, x, y: centerBaseline(rowTop, pillH, textStyle), fill: t.text });
  if (focusText) {
    doc.text(focusText, { ...focusStyle, x: x + main.width + 10, y: centerBaseline(rowTop, pillH, textStyle), fill: t.muted });
  }
  doc.add('</g>');
  return doc;
}

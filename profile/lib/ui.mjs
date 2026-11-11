import { r, roundedRect } from './svg.mjs';
import { type } from '../theme.mjs';
import { getFont } from './text.mjs';

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const ym = (s) => {
  const [y, m] = s.split('-').map(Number);
  return { y, m };
};

export const fmtMonth = (s) => {
  const { y, m } = ym(s);
  return `${MONTHS[m - 1]} ${y}`;
};

/** LinkedIn-style duration, both months inclusive. */
export function duration(start, end, now = new Date()) {
  const a = ym(start);
  const b = end ? ym(end) : { y: now.getFullYear(), m: now.getMonth() + 1 };
  const total = b.y * 12 + b.m - (a.y * 12 + a.m) + 1;
  const years = Math.floor(total / 12);
  const months = total % 12;
  const parts = [];
  if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (months) parts.push(`${months} mo${months > 1 ? 's' : ''}`);
  return parts.join(' ') || '1 mo';
}

/** Baseline that vertically centres cap-height text inside a box. */
export function centerBaseline(top, height, style) {
  const font = getFont(style.font);
  const cap = (font.capHeight / font.unitsPerEm) * style.size;
  return top + height / 2 + cap / 2;
}

/** Shared CSS: entrance + reduced motion guard. */
export function baseCss(doc) {
  doc.style(
    '.rise{animation:rise .9s cubic-bezier(.2,.75,.2,1) both}' +
      '@keyframes rise{from{opacity:0;transform:translateY(8px)}}' +
      '.fade{animation:fade 1.2s ease-out both}' +
      '@keyframes fade{from{opacity:0}}' +
      '@media (prefers-reduced-motion:reduce){*{animation:none!important}}',
  );
}

/** The card surface used by every panel. */
export function card(doc, t, { x = 0, y = 0, w, h, radius = 18 }) {
  const fill = doc.uid('cf');
  const hl = doc.uid('hl');
  doc.def(
    `<linearGradient id="${fill}" x1="0" y1="${y}" x2="0" y2="${y + h}" gradientUnits="userSpaceOnUse"><stop stop-color="${t.cardFrom}"/><stop offset="1" stop-color="${t.cardTo}"/></linearGradient>`,
  );
  doc.add(
    `<rect x="${r(x + 0.5)}" y="${r(y + 0.5)}" width="${r(w - 1)}" height="${r(h - 1)}" rx="${radius}" fill="url(#${fill})" stroke="${t.border}"/>`,
  );
  if (t.highlightOpacity) {
    doc.def(
      `<linearGradient id="${hl}" x1="${x}" y1="0" x2="${x + w}" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="${t.highlight}" stop-opacity="0"/><stop offset=".5" stop-color="${t.highlight}" stop-opacity="${t.highlightOpacity}"/><stop offset="1" stop-color="${t.highlight}" stop-opacity="0"/></linearGradient>`,
    );
    doc.add(`<path d="M${r(x + radius)} ${r(y + 0.5)}H${r(x + w - radius)}" stroke="url(#${hl})"/>`);
  }
}

/** Pill chip; returns its width. `dot` adds a small colour marker. */
export function chip(doc, t, text, { x, y, h = 24, style = type.chip, padX = 10, dot = null, tone = 'accent' }) {
  const tw = doc.measure(text, style);
  const dotSpace = dot ? 12 : 0;
  const w = tw + padX * 2 + dotSpace;
  const fill = tone === 'accent' ? t.chipFill : t.elevated;
  const fillOp = tone === 'accent' ? t.chipFillOpacity : 1;
  const stroke = tone === 'accent' ? t.chipStroke : t.border;
  const strokeOp = tone === 'accent' ? t.chipStrokeOpacity : 1;
  const color = tone === 'accent' ? t.chipText : t.body;
  doc.add(
    `<rect x="${r(x + 0.5)}" y="${r(y + 0.5)}" width="${r(w - 1)}" height="${h - 1}" rx="${(h - 1) / 2}" fill="${fill}" fill-opacity="${fillOp}" stroke="${stroke}" stroke-opacity="${strokeOp}"/>`,
  );
  if (dot) doc.add(`<circle cx="${r(x + padX + 3)}" cy="${r(y + h / 2)}" r="3" fill="${dot}"/>`);
  doc.text(text, { ...style, x: x + padX + dotSpace, y: centerBaseline(y, h, style), fill: color });
  return w;
}

/** Lays chips out in rows; returns the total height used. */
export function chipFlow(doc, t, items, { x, y, maxWidth, gap = 8, rowGap = 8, h = 24, style = type.chip, dots, tone }) {
  let cx = x;
  let cy = y;
  items.forEach((item, i) => {
    const label = typeof item === 'string' ? item : item.label;
    const dot = dots ? dots(label, i) : null;
    const w = doc.measure(label, style) + 20 + (dot ? 12 : 0);
    if (cx > x && cx + w > x + maxWidth) {
      cx = x;
      cy += h + rowGap;
    }
    chip(doc, t, label, { x: cx, y: cy, h, style, dot, tone });
    cx += w + gap;
  });
  return cy + h - y;
}

/** Horizontal rule that fades out at both ends. */
export function fadeRule(doc, t, { x1, x2, y, color, opacity = 1 }) {
  const id = doc.uid('fr');
  doc.def(
    `<linearGradient id="${id}" x1="${x1}" y1="0" x2="${x2}" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="${color}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`,
  );
  doc.add(`<path d="M${r(x1)} ${r(y)}H${r(x2)}" stroke="url(#${id})"/>`);
}

/** Gradient across a horizontal span, for text and accents. */
export function gradient(doc, colors, x1, x2, { y1 = 0, y2 = 0 } = {}) {
  const id = doc.uid('lg');
  const stops = colors
    .map((c, i) => `<stop offset="${r(i / (colors.length - 1), 3)}" stop-color="${c}"/>`)
    .join('');
  doc.def(`<linearGradient id="${id}" x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" gradientUnits="userSpaceOnUse">${stops}</linearGradient>`);
  return `url(#${id})`;
}

export function noise(doc, { x = 0, y = 0, w, h, opacity, clip }) {
  const id = doc.uid('nz');
  doc.def(
    `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`,
  );
  doc.add(
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#${id})" opacity="${opacity}"${clip ? ` clip-path="url(#${clip})"` : ''}/>`,
  );
}

/** Deterministic pseudo-random numbers so builds are reproducible. */
export function seeded(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export { roundedRect };

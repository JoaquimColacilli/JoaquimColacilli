import { Doc, r } from '../lib/svg.mjs';
import { baseCss, gradient, MONTHS } from '../lib/ui.mjs';
import { WIDTH, COMPACT, type } from '../theme.mjs';
import { profile } from '../content.mjs';

/** Closing line above the repeated links row. */
export function footerStrip(t, { compact = false, now = new Date(), glyphs, idPrefix } = {}) {
  const W = compact ? COMPACT : WIDTH;
  const H = compact ? 118 : 104;
  const doc = new Doc({ width: W, height: H, title: "Let's talk", desc: `${profile.location} · ${profile.timezone}`, glyphs, idPrefix });
  baseCss(doc);
  doc.add(`<path d="M2 28.5H${W - 2}" stroke="${t.border}"/>`);
  const base = compact ? 74 : 84;
  const title = doc.textPath("Let's talk.", { ...type.section, size: compact ? 26 : 30, tracking: -0.025, x: 2, y: base });
  doc.add(`<path d="${title.d}" fill="${gradient(doc, t.gradient, title.x, title.x + title.width)}"/>`);

  const meta = compact ? { ...type.label, size: 9.5, tracking: 0.1 } : type.label;
  const place = `${profile.location.toUpperCase()}  ·  ${profile.timezone}`;
  const stamp = `UPDATED ${MONTHS[now.getMonth()].toUpperCase()} ${now.getFullYear()}`;
  const metaBase = compact ? base + 26 : base - 2;
  if (compact) doc.text(place, { ...meta, x: 2, y: metaBase, fill: t.faint });
  else doc.text(place, { ...meta, x: title.x + title.width + 18, y: metaBase, fill: t.faint });
  const s = doc.text(stamp, { ...meta, x: W - 2, y: metaBase, anchor: 'end', fill: t.faint });
  if (!compact) doc.add(`<circle cx="${r(s.x - 12)}" cy="${metaBase - 4}" r="3" fill="${t.live}"/>`);
  return doc;
}

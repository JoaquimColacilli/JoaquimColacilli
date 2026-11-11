import { Doc, r } from '../lib/svg.mjs';
import { baseCss, centerBaseline, gradient } from '../lib/ui.mjs';
import { icon } from '../lib/icons.mjs';
import { measure } from '../lib/text.mjs';
import { WIDTH, COMPACT, type } from '../theme.mjs';

export const PILL_HEIGHT = 56; // image height used in the README for every pill

/** Clickable button for the links row (each one is its own image). */
export function linkPill(t, link, { compact = false, glyphs, idPrefix } = {}) {
  const h = compact ? 38 : 42;
  const top = PILL_HEIGHT - h;
  const padX = compact ? 15 : 20;
  const gapRight = compact ? 8 : 10;
  const style = compact ? { ...type.button, size: 13.5 } : type.button;
  const textW = measure(link.label, style);
  const iconSize = compact ? 13 : 14;
  const w = Math.ceil(padX + textW + 7 + iconSize + padX - 2);
  const doc = new Doc({ width: w + gapRight, height: PILL_HEIGHT, title: link.label, desc: link.href, glyphs, idPrefix });
  if (link.primary) {
    const fill = gradient(doc, t.button, 0, w);
    doc.add(`<rect x="0" y="${top}" width="${w}" height="${h}" rx="11" fill="${fill}"/>`);
    doc.add(`<rect x=".5" y="${top + 0.5}" width="${w - 1}" height="${h - 1}" rx="10.5" stroke="#fff" stroke-opacity=".18"/>`);
  } else {
    doc.add(`<rect x=".5" y="${top + 0.5}" width="${w - 1}" height="${h - 1}" rx="10.5" fill="${t.elevated}" stroke="${t.border}"/>`);
  }
  const color = link.primary ? '#FFFFFF' : t.text;
  doc.text(link.label, { ...style, x: padX, y: centerBaseline(top, h, style), fill: color });
  doc.add(
    icon('arrow-up-right', {
      x: r(padX + textW + 7),
      y: r(top + h / 2 - iconSize / 2),
      size: iconSize,
      stroke: link.primary ? '#FFFFFF' : t.muted,
      width: 1.6,
    }),
  );
  return doc;
}

/** "01  Stack ───────── meta" divider that opens every section. */
export function sectionStrip(t, { index, title, meta }, { compact = false, glyphs, idPrefix } = {}) {
  const W = compact ? COMPACT : WIDTH;
  const H = compact ? 76 : 90;
  const base = compact ? 52 : 64;
  const doc = new Doc({ width: W, height: H, title: `${index} ${title}`, desc: meta || '', glyphs, idPrefix });
  baseCss(doc);
  const idxStyle = compact ? { ...type.index, size: 11.5 } : type.index;
  const titleStyle = compact ? { ...type.section, size: 21 } : type.section;
  const idx = doc.text(index, { ...idxStyle, x: 2, y: base - 1, fill: t.accent });
  const tx = 2 + idx.width + (compact ? 10 : 12);
  const tt = doc.text(title, { ...titleStyle, x: tx, y: base, fill: t.text });
  const lineStart = tx + tt.width + (compact ? 14 : 20);
  let lineEnd = W - 2;
  if (meta && !compact) {
    const m = doc.text(meta.toUpperCase(), { ...type.label, x: W - 2, y: base - 1, anchor: 'end', fill: t.faint });
    lineEnd = m.x - 18;
  }
  const lineY = base - (compact ? 5 : 5.5);
  const g = gradient(doc, [t.accent, t.border, t.border], lineStart, lineEnd);
  doc.add(`<path d="M${r(lineStart)} ${lineY}H${r(lineEnd)}" stroke="${g}"/>`);
  doc.add(`<circle cx="${r(lineStart)}" cy="${lineY}" r="2" fill="${t.accent}"/>`);
  return doc;
}

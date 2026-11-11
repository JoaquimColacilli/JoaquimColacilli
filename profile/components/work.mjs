import { Doc, r } from '../lib/svg.mjs';
import { card, baseCss, centerBaseline } from '../lib/ui.mjs';
import { icon } from '../lib/icons.mjs';
import { WIDTH, COMPACT, type, techColor } from '../theme.mjs';

const host = (href) => href.replace(/^https?:\/\//, '').replace(/\/$/, '');

function glowBehindIcon(doc, t, cx, cy, radius, clip) {
  const glow = doc.uid('wg');
  doc.def(
    `<radialGradient id="${glow}"><stop stop-color="${t.accentStrong}" stop-opacity="${t.name === 'dark' ? 0.12 : 0.07}"/><stop offset="1" stop-color="${t.accentStrong}" stop-opacity="0"/></radialGradient>`,
  );
  doc.add(`<circle cx="${r(cx)}" cy="${r(cy)}" r="${radius}" fill="url(#${glow})" clip-path="url(#${clip})"/>`);
}

function iconTile(doc, t, name, x, y, size) {
  doc.add(`<rect x="${r(x + 0.5)}" y="${r(y + 0.5)}" width="${size - 1}" height="${size - 1}" rx="${size > 32 ? 10 : 9}" fill="${t.elevated}" stroke="${t.border}"/>`);
  const glyph = Math.round(size * 0.5);
  doc.add(icon(name, { x: r(x + (size - glyph) / 2), y: r(y + (size - glyph) / 2), size: glyph, stroke: t.accent, width: 1.7 }));
}

/**
 * One project card = one image, so the whole card can be a link. Each image is
 * exactly half the column wide; the gutter is baked into the side facing the
 * neighbouring card.
 */
export function workCard(t, item, column, { compact = false, glyphs, idPrefix } = {}) {
  const W = compact ? COMPACT : WIDTH;
  const HALF = W / 2;
  const GUTTER = compact ? 10 : 16;
  const CARD_H = compact ? 132 : 164;
  const H = CARD_H + GUTTER;
  const x0 = column === 0 ? 0 : GUTTER / 2;
  const w = HALF - GUTTER / 2;
  const doc = new Doc({
    width: HALF,
    height: H,
    glyphs,
    idPrefix,
    title: `${item.title} — ${item.kind}`,
    desc: `${item.description} ${item.action}: ${item.href}`,
  });
  baseCss(doc);
  const radius = compact ? 14 : 16;
  card(doc, t, { x: x0, y: 0, w, h: CARD_H, radius });
  const clip = doc.uid('cc');
  doc.def(`<clipPath id="${clip}"><rect x="${x0 + 1}" y="1" width="${w - 2}" height="${CARD_H - 2}" rx="${radius - 1}"/></clipPath>`);
  return compact ? compactCard(doc, t, item, x0, w, CARD_H, clip) : fullCard(doc, t, item, x0, w, CARD_H, clip);
}

function fullCard(doc, t, item, x0, w, CARD_H, clip) {
  const PAD = 22;
  const tile = 36;
  const tileY = PAD - 2;
  glowBehindIcon(doc, t, x0 + PAD + 18, PAD + 18, 80, clip);
  iconTile(doc, t, item.icon, x0 + PAD, tileY, tile);
  doc.text(item.title, { ...type.cardTitle, x: x0 + PAD + tile + 14, y: centerBaseline(tileY, tile, type.cardTitle), fill: t.text });

  // kind tag
  const tag = { ...type.labelSm, size: 9.5, tracking: 0.12 };
  const label = item.kind.toUpperCase();
  const tagW = doc.measure(label, tag) + 16;
  const tagX = x0 + w - PAD - tagW;
  const tagY = tileY + (tile - 20) / 2;
  doc.add(`<rect x="${r(tagX + 0.5)}" y="${r(tagY + 0.5)}" width="${r(tagW - 1)}" height="19" rx="9.5" fill="${t.elevated}" stroke="${t.border}"/>`);
  doc.text(label, { ...tag, x: tagX + 8, y: centerBaseline(tagY, 20, tag), fill: t.muted });

  // description (max two lines)
  const desc = { ...type.bodySm, fill: t.body };
  const lines = doc.wrap([{ text: item.description, style: desc }], w - PAD * 2).slice(0, 2);
  doc.lines(lines, { x: x0 + PAD, y: PAD + tile + 26, lineHeight: 20 });

  // footer: languages (or the domain) + action
  const footTop = CARD_H - PAD - 22;
  const action = { ...type.label, size: 10.5, tracking: 0.1 };
  const actionLabel = item.action.toUpperCase();
  const aw = doc.measure(actionLabel, action);
  const ax = x0 + w - PAD - 14 - 6 - aw;
  doc.text(actionLabel, { ...action, x: ax, y: centerBaseline(footTop, 22, action), fill: t.accent });
  doc.add(icon('arrow-up-right', { x: r(x0 + w - PAD - 14), y: footTop + 4, size: 14, stroke: t.accent, width: 1.6 }));

  if (item.tech?.length) {
    // GitHub-style "● Language" markers
    const st = { ...type.chip, size: 11, tracking: 0 };
    const base = centerBaseline(footTop, 22, st);
    let tx = x0 + PAD;
    for (const name of item.tech) {
      const width = 13 + doc.measure(name, st);
      if (tx + width > ax - 14) break;
      doc.add(`<circle cx="${r(tx + 4)}" cy="${r(footTop + 11)}" r="4" fill="${techColor(name, t)}"/>`);
      doc.text(name, { ...st, x: tx + 13, y: base, fill: t.muted });
      tx += width + 16;
    }
  } else {
    doc.text(host(item.href), { ...type.label, size: 10.5, tracking: 0.04, x: x0 + PAD, y: centerBaseline(footTop, 22, type.label), fill: t.muted });
  }
  return doc;
}

function compactCard(doc, t, item, x0, w, CARD_H, clip) {
  const PAD = 14;
  const tile = 30;
  glowBehindIcon(doc, t, x0 + PAD + 15, PAD + 15, 56, clip);
  iconTile(doc, t, item.icon, x0 + PAD, PAD, tile);
  doc.add(icon('arrow-up-right', { x: r(x0 + w - PAD - 14), y: PAD + 8, size: 14, stroke: t.accent, width: 1.6 }));

  const title = { ...type.cardTitle, size: 14.5 };
  const lines = doc.wrap([{ text: item.title, style: { ...title, fill: t.text } }], w - PAD * 2).slice(0, 2);
  const kindBase = CARD_H - PAD - 2;
  const lineH = 18;
  const firstBase = kindBase - 22 - (lines.length - 1) * lineH;
  doc.lines(lines, { x: x0 + PAD, y: firstBase, lineHeight: lineH });

  // lead language like GitHub's repo cards, or the client tag
  const lead = item.tech?.[0];
  if (lead) {
    const st = { ...type.chip, size: 10.5, tracking: 0 };
    doc.add(`<circle cx="${r(x0 + PAD + 3.5)}" cy="${r(kindBase - 3.5)}" r="3.5" fill="${techColor(lead, t)}"/>`);
    doc.text(lead, { ...st, x: x0 + PAD + 12, y: kindBase, fill: t.muted });
  } else {
    doc.text(`${item.kind} site`.toUpperCase(), { ...type.labelSm, size: 9, tracking: 0.1, x: x0 + PAD, y: kindBase, fill: t.muted });
  }
  return doc;
}

import { Doc, r } from '../lib/svg.mjs';
import { card, baseCss, fmtMonth } from '../lib/ui.mjs';
import { WIDTH, COMPACT, type } from '../theme.mjs';
import { education } from '../content.mjs';

export function educationPanel(t, { compact = false, glyphs, idPrefix } = {}) {
  const W = compact ? COMPACT : WIDTH;
  const PAD = compact ? 22 : 32;
  const colW = compact ? W - PAD * 2 - 8 : (W - PAD * 2 - 48) / 2;
  const leftX = PAD + 4;
  const rightX = compact ? leftX : PAD + colW + 48;
  const label = compact ? { ...type.label, size: 10 } : type.label;
  const school = { ...type.company, size: compact ? 16.5 : 18 };
  const body = { ...type.body, size: compact ? 13 : 14 };
  const small = { ...type.bodySm, size: compact ? 12.5 : 13 };
  const item = { ...type.item, size: compact ? 13.5 : 14 };

  const draw = (doc) => {
    let y = PAD + 14;
    education.schools.forEach((s, i) => {
      if (i) y += compact ? 28 : 30;
      const range = `${fmtMonth(s.start)} — ${s.end ? fmtMonth(s.end) : 'Present'}`.toUpperCase();
      const rg = doc.text(range, { ...label, x: leftX, y, fill: t.muted });
      if (s.status) {
        doc.add(`<circle cx="${r(leftX + rg.width + 11)}" cy="${y - 4}" r="1.5" fill="${t.faint}"/>`);
        doc.text(s.status.toUpperCase(), { ...label, x: leftX + rg.width + 22, y, fill: t.live });
      }
      y += compact ? 25 : 28;
      doc.text(s.school, { ...school, x: leftX, y, fill: t.text });
      y += compact ? 20 : 22;
      doc.text(s.detail, { ...small, x: leftX, y, fill: t.muted });
      y += compact ? 21 : 23;
      const lines = doc.wrap([{ text: s.program, style: { ...body, fill: t.body } }], colW);
      doc.lines(lines, { x: leftX, y, lineHeight: compact ? 19 : 21 });
      y += (lines.length - 1) * (compact ? 19 : 21);
    });
    const leftBottom = y;

    if (compact) {
      y += 28;
      doc.add(`<path d="M${leftX} ${y + 0.5}H${W - PAD - 4}" stroke="${t.divider}"/>`);
      y += 32;
    } else {
      y = PAD + 14;
    }
    doc.text('COMPLEMENTARY TRAINING', { ...label, x: rightX, y, fill: t.muted });
    y += compact ? 26 : 28;
    education.training.forEach((c, i) => {
      if (i) y += compact ? 28 : 30;
      doc.text(c.name, { ...item, x: rightX, y, fill: t.text });
      doc.text(c.year, { ...label, x: rightX + colW, y: y - 1, anchor: 'end', fill: t.faint });
      if (c.detail) {
        y += compact ? 19 : 20;
        const lines = doc.wrap([{ text: c.detail, style: { ...small, fill: t.body } }], colW - (compact ? 0 : 40));
        doc.lines(lines, { x: rightX, y, lineHeight: compact ? 18 : 19 });
        y += (lines.length - 1) * (compact ? 18 : 19);
      }
    });
    y += compact ? 30 : 32;
    doc.text('LANGUAGES', { ...label, x: rightX, y, fill: t.muted });
    y += compact ? 26 : 28;
    education.languages.forEach((l, i) => {
      if (i) y += compact ? 22 : 24;
      doc.text(l.name, { ...item, x: rightX, y, fill: t.text });
      doc.text(l.level, { ...small, x: rightX + colW, y, anchor: 'end', fill: t.muted });
    });
    return Math.max(leftBottom, y) + PAD;
  };

  const height = Math.ceil(draw(new Doc({ width: W, height: 1 })));
  const doc = new Doc({
    width: W,
    height,
    glyphs,
    idPrefix,
    title: 'Education',
    desc:
      education.schools.map((s) => `${s.program} — ${s.school}, ${s.detail}`).join('. ') +
      `. Training: ${education.training.map((c) => c.name + (c.detail ? ` (${c.detail})` : '')).join(', ')}. Languages: ${education.languages
        .map((l) => `${l.name} (${l.level})`)
        .join(', ')}.`,
  });
  baseCss(doc);
  card(doc, t, { w: W, h: height, radius: compact ? 16 : 18 });
  if (!compact) doc.add(`<path d="M${r(PAD + colW + 24 + 0.5)} ${PAD}V${height - PAD}" stroke="${t.divider}"/>`);
  doc.add('<g class="fade">');
  draw(doc);
  doc.add('</g>');
  return doc;
}

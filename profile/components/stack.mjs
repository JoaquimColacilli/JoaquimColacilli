import { Doc, r } from '../lib/svg.mjs';
import { card, baseCss, chipFlow, centerBaseline } from '../lib/ui.mjs';
import { WIDTH, COMPACT, type, techColor } from '../theme.mjs';
import { stack } from '../content.mjs';

export function stackPanel(t, { compact = false, glyphs, idPrefix } = {}) {
  const W = compact ? COMPACT : WIDTH;
  const PAD = compact ? 20 : 28;
  const perRow = compact ? 2 : stack.groups.length;
  const item = compact ? { ...type.item, size: 13.5 } : type.item;
  const label = compact ? { ...type.label, size: 10 } : type.label;
  const chipStyle = { ...type.chip, size: 10.5 };
  const chipH = compact ? 24 : 26;
  const step = compact ? 25 : 28;

  const draw = (doc) => {
    const colW = (W - PAD * 2) / perRow;
    let top = PAD + 2;
    for (let start = 0; start < stack.groups.length; start += perRow) {
      const row = stack.groups.slice(start, start + perRow);
      const maxItems = Math.max(...row.map((g) => g.items.length));
      const itemsTop = top + (compact ? 38 : 44);
      const rowBottom = itemsTop + (maxItems - 1) * step + 12;
      if (start > 0) doc.add(`<path d="M${PAD + 6} ${r(top - 18.5)}H${W - PAD - 6}" stroke="${t.divider}"/>`);
      row.forEach((group, i) => {
        const cellX = PAD + i * colW;
        const x = cellX + (i === 0 ? 6 : compact ? 18 : 24);
        if (i > 0) doc.add(`<path d="M${r(cellX + 0.5)} ${top - 4}V${rowBottom}" stroke="${t.divider}"/>`);
        doc.text(group.label.toUpperCase(), { ...label, x, y: top + 10, fill: t.muted });
        if (!compact) {
          doc.text(String(group.items.length).padStart(2, '0'), { ...label, x: cellX + colW - 18, y: top + 10, anchor: 'end', fill: t.faint });
        }
        group.items.forEach((name, j) => {
          const y = itemsTop + j * step;
          doc.add(`<circle cx="${r(x + 4)}" cy="${r(y - item.size * 0.36)}" r="3.5" fill="${techColor(name, t)}"/>`);
          doc.text(name, { ...item, x: x + 17, y, fill: t.text });
        });
      });
      top = rowBottom + (compact ? 40 : 44);
    }

    let y = top - (compact ? 18 : 22);
    doc.add(`<path d="M${PAD + 6} ${y + 0.5}H${W - PAD - 6}" stroke="${t.divider}"/>`);
    y += compact ? 20 : 22;

    const rows = [
      { label: 'Also', items: stack.also, tone: 'neutral' },
      { label: 'Practices', items: stack.practices, tone: 'accent' },
    ];
    rows.forEach((row, i) => {
      if (compact) {
        if (i) y += 22;
        doc.text(row.label.toUpperCase(), { ...label, x: PAD + 6, y: y + 8, fill: t.muted });
        y += 20;
        y += chipFlow(doc, t, row.items, { x: PAD + 6, y, maxWidth: W - PAD * 2 - 12, h: chipH, gap: 6, rowGap: 7, style: chipStyle, tone: row.tone });
      } else {
        if (i) y += 14;
        const chipsX = PAD + 112;
        doc.text(row.label.toUpperCase(), { ...label, x: PAD + 6, y: centerBaseline(y, chipH, label), fill: t.muted });
        y += chipFlow(doc, t, row.items, { x: chipsX, y, maxWidth: W - PAD - 6 - chipsX, h: chipH, gap: 7, style: chipStyle, tone: row.tone });
      }
    });
    return y + PAD + 2;
  };

  const height = Math.ceil(draw(new Doc({ width: W, height: 1 })));
  const doc = new Doc({
    width: W,
    height,
    glyphs,
    idPrefix,
    title: 'Tech stack',
    desc: stack.groups.map((g) => `${g.label}: ${g.items.join(', ')}`).join('. ') + `. Also: ${stack.also.join(', ')}.`,
  });
  baseCss(doc);
  card(doc, t, { w: W, h: height, radius: compact ? 16 : 18 });
  doc.add('<g class="fade">');
  draw(doc);
  doc.add('</g>');
  return doc;
}

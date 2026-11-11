import { Doc, r } from '../lib/svg.mjs';
import { card, baseCss, chipFlow, fmtMonth, duration, centerBaseline } from '../lib/ui.mjs';
import { WIDTH, COMPACT, type, techColor } from '../theme.mjs';
import { experience } from '../content.mjs';

/** "**bold** rest" → styled spans */
export function richSpans(text, normal, strong) {
  return text
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((part) => (part.startsWith('**') ? { text: part.slice(2, -2), style: strong } : { text: part, style: normal }));
}

function currentTag(doc, t, x, base, compact) {
  const tag = { ...type.labelSm, size: compact ? 9 : 9.5, tracking: 0.12 };
  const tw = doc.measure('CURRENT', tag);
  const h = compact ? 17 : 18;
  const top = base - (compact ? 12 : 12.5);
  doc.add(
    `<rect x="${r(x + 0.5)}" y="${r(top + 0.5)}" width="${r(tw + 16 - 1)}" height="${h - 1}" rx="${(h - 1) / 2}" fill="${t.live}" fill-opacity=".1" stroke="${t.live}" stroke-opacity=".35"/>`,
  );
  doc.text('CURRENT', { ...tag, x: x + 8, y: centerBaseline(top, h, tag), fill: t.live });
}

export function experiencePanel(t, { compact = false, now = new Date(), glyphs, idPrefix } = {}) {
  const W = compact ? COMPACT : WIDTH;
  const PAD = compact ? 20 : 32;
  const LINE_X = PAD + (compact ? 5 : 7);
  const X = PAD + (compact ? 26 : 36);
  const RIGHT = W - PAD;
  const bodySize = compact ? 13 : 14;
  const lineH = compact ? 20 : 22;
  const normal = { ...type.body, size: bodySize, fill: t.body };
  const strong = { ...type.strong, size: bodySize, fill: t.text };
  const company = compact ? { ...type.company, size: 17 } : type.company;
  const meta = compact ? { ...type.label, size: 9.5, tracking: 0.08 } : type.label;

  const draw = (doc) => {
    let y = PAD + 4;
    const nodes = [];
    experience.forEach((job, i) => {
      if (i) y += compact ? 30 : 34;
      const base = y + 15;
      const current = !job.end;
      const range = `${fmtMonth(job.start)} — ${job.end ? fmtMonth(job.end) : 'Present'}`.toUpperCase();
      const dur = duration(job.start, job.end, now).toUpperCase();

      const c = doc.text(job.company, { ...company, x: X, y: base, fill: t.text });
      if (compact) {
        if (current) currentTag(doc, t, X + c.width + 10, base, true);
        y = base + 21;
        doc.text(job.role, { ...type.item, size: 13, x: X, y, fill: t.muted });
        y += 19;
        const rg = doc.text(range, { ...meta, x: X, y, fill: t.muted });
        doc.add(`<circle cx="${r(rg.x + rg.width + 9)}" cy="${y - 3.5}" r="1.5" fill="${t.faint}"/>`);
        doc.text(dur, { ...meta, x: rg.x + rg.width + 18, y, fill: t.faint });
        y += 28;
      } else {
        let x = X + c.width + 10;
        doc.text('/', { ...type.item, x, y: base, fill: t.faint });
        x += 14;
        const role = doc.text(job.role, { ...type.item, size: 14.5, x, y: base, fill: t.muted });
        x += role.width + 12;
        if (current) currentTag(doc, t, x, base, false);
        const d = doc.text(dur, { ...meta, x: RIGHT, y: base - 1, anchor: 'end', fill: t.faint });
        doc.text(range, { ...meta, x: d.x - 22, y: base - 1, anchor: 'end', fill: t.muted });
        doc.add(`<circle cx="${r(d.x - 11)}" cy="${base - 5}" r="1.5" fill="${t.faint}"/>`);
        y = base + 32;
      }
      nodes.push({ y: base - 6, current });

      const textX = X + (compact ? 14 : 18);
      job.bullets.forEach((bullet, j) => {
        if (j) y += lineH + (compact ? 6 : 6);
        const lines = doc.wrap(richSpans(bullet, normal, strong), RIGHT - textX);
        doc.add(`<circle cx="${X + 3}" cy="${r(y - bodySize * 0.32)}" r="${compact ? 2.2 : 2.5}" fill="${t.accentStrong}"/>`);
        doc.lines(lines, { x: textX, y, lineHeight: lineH });
        y += (lines.length - 1) * lineH;
      });

      y += compact ? 16 : 18;
      y += chipFlow(doc, t, job.tech, {
        x: X,
        y,
        maxWidth: RIGHT - X,
        h: compact ? 22 : 24,
        gap: compact ? 6 : 7,
        rowGap: 6,
        style: compact ? { ...type.chip, size: 10 } : type.chip,
        dots: (label) => techColor(label, t),
      });
    });
    return { height: y + PAD, nodes };
  };

  const probe = draw(new Doc({ width: W, height: 1 }));
  const height = Math.ceil(probe.height);
  const doc = new Doc({
    width: W,
    height,
    glyphs,
    idPrefix,
    title: 'Experience',
    desc: experience
      .map((j) => `${j.company} — ${j.role}, ${fmtMonth(j.start)} to ${j.end ? fmtMonth(j.end) : 'present'}: ${j.bullets.join(' ').replace(/\*\*/g, '')}`)
      .join(' '),
  });
  baseCss(doc);
  doc.style(
    '.ping{transform-box:fill-box;transform-origin:center;animation:ping 2.6s cubic-bezier(0,0,.2,1) infinite}' +
      '@keyframes ping{0%{transform:scale(1);opacity:.55}80%,100%{transform:scale(2.4);opacity:0}}',
  );
  card(doc, t, { w: W, h: height, radius: compact ? 16 : 18 });

  // timeline rail
  const { nodes } = probe;
  const rail = doc.uid('rail');
  doc.def(
    `<linearGradient id="${rail}" x1="0" y1="${nodes[0].y}" x2="0" y2="${nodes[nodes.length - 1].y}" gradientUnits="userSpaceOnUse"><stop stop-color="${t.accentStrong}" stop-opacity=".9"/><stop offset=".55" stop-color="${t.border}"/><stop offset="1" stop-color="${t.border}" stop-opacity=".4"/></linearGradient>`,
  );
  doc.add(`<path d="M${LINE_X} ${nodes[0].y}V${r(height - PAD - 8)}" stroke="url(#${rail})" stroke-width="1.5"/>`);
  for (const n of nodes) {
    if (n.current) {
      doc.add(`<circle class="ping" cx="${LINE_X}" cy="${n.y}" r="5.5" fill="${t.accentStrong}"/>`);
      doc.add(`<circle cx="${LINE_X}" cy="${n.y}" r="9" fill="${t.accentStrong}" fill-opacity=".14"/>`);
      doc.add(`<circle cx="${LINE_X}" cy="${n.y}" r="5" fill="${t.accent}" stroke="${t.cardFrom}" stroke-width="1.5"/>`);
    } else {
      doc.add(`<circle cx="${LINE_X}" cy="${n.y}" r="5" fill="${t.cardFrom}" stroke="${t.muted}" stroke-width="1.5"/>`);
    }
  }

  doc.add('<g class="fade">');
  draw(doc);
  doc.add('</g>');
  return doc;
}

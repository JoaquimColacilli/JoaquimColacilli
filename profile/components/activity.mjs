import { Doc, r } from '../lib/svg.mjs';
import { card, baseCss, gradient, MONTHS, centerBaseline } from '../lib/ui.mjs';
import { shape } from '../lib/text.mjs';
import { WIDTH, COMPACT, type } from '../theme.mjs';

/** Streaks and totals from the calendar (a day counts when it has ≥ 1 contribution). */
export function stats(calendar) {
  const days = calendar.days;
  let longest = 0;
  let run = 0;
  let active = 0;
  for (const d of days) {
    if (d.count > 0) {
      active++;
      run++;
      longest = Math.max(longest, run);
    } else run = 0;
  }
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--; // today isn't over yet
  let current = 0;
  while (i >= 0 && days[i].count > 0) {
    current++;
    i--;
  }
  return { total: calendar.total, active, longest, current, perActive: active ? calendar.total / active : 0 };
}

const fmtInt = (n) => n.toLocaleString('en-US');

function syncedLabel(iso, timeZone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (k) => parts.find((p) => p.type === k)?.value;
  return `Synced ${get('day')} ${get('month')} ${get('year')}, ${get('hour')}:${get('minute')}`;
}

/** Rolling digits: each digit is a clipped strip of 0–9 that settles on its value. */
function odometer(doc, value, { x, y, style, fill }) {
  const text = fmtInt(value);
  const s = shape(text, style);
  const size = style.size;
  const L = Math.round(size * 1.15);
  const clip = doc.uid('oc');
  doc.def(
    `<clipPath id="${clip}"><rect x="${r(x - 4)}" y="${r(y - size * 0.86)}" width="${r(s.advance * s.scale + 8)}" height="${r(size * 1.04)}"/></clipPath>`,
  );
  doc.style('.odo{animation:odo 1.8s cubic-bezier(.16,1,.3,1) both}@keyframes odo{from{transform:translateY(0)}}');
  const out = [`<g clip-path="url(#${clip})" fill="${fill}">`];
  let digit = 0;
  s.glyphs.forEach((g, i) => {
    const ch = text[i];
    const gx = x + g.x * s.scale;
    if (!/\d/.test(ch)) {
      out.push(`<path d="${doc.textPath(ch, { ...style, x: gx, y }).d}"/>`);
      return;
    }
    let strip = '';
    for (let k = 0; k <= 9; k++) strip += doc.textPath(String(k), { ...style, x: gx, y: y + k * L }).d;
    out.push(
      `<g class="odo" style="transform:translateY(${-Number(ch) * L}px);animation-delay:${r(0.2 + digit * 0.1, 2)}s"><path d="${strip}"/></g>`,
    );
    digit++;
  });
  out.push('</g>');
  doc.add(out.join(''));
  return s.advance * s.scale;
}

/** Splits days into Sunday-first weeks. */
function toWeeks(days) {
  const weeks = [];
  for (const d of days) {
    const wd = new Date(`${d.date}T00:00:00Z`).getUTCDay();
    if (!weeks.length || wd === 0) weeks.push([]);
    weeks[weeks.length - 1].push({ ...d, wd });
  }
  return weeks;
}

export function activityPanel(t, calendar, { compact = false, palette = 'brand', timeZone = 'UTC', glyphs, idPrefix } = {}) {
  const W = compact ? COMPACT : WIDTH;
  const PAD = compact ? 20 : 32;
  const PITCH = compact ? 13 : 14;
  const CELL = compact ? 10 : 11;
  const st = stats(calendar);
  const heat = palette === 'github' ? t.heatGithub : t.heat;

  let weeks = toWeeks(calendar.days);
  const labelGutter = compact ? 28 : 40;
  const maxWeeks = Math.floor((W - PAD * 2 - labelGutter + (PITCH - CELL)) / PITCH);
  if (weeks.length > maxWeeks) weeks = weeks.slice(weeks.length - maxWeeks);

  const numStyle = compact ? { ...type.big, size: 38 } : type.big;
  const statStyle = compact ? { ...type.stat, size: 20 } : type.stat;
  const x = PAD + 4;
  const numBase = PAD + (compact ? 38 : 52);
  const statsBase = compact ? numBase + 50 : numBase;
  const monthBase = compact ? statsBase + 38 : numBase + 52;
  const gridY = monthBase + (compact ? 10 : 12);
  const gridBottom = gridY + 7 * PITCH - (PITCH - CELL);
  const footBase = gridBottom + (compact ? 30 : 34);
  const H = footBase + PAD - 4;
  const gridW = weeks.length * PITCH - (PITCH - CELL);
  const gridX = W - PAD - (compact ? 0 : 4) - gridW;

  const doc = new Doc({
    width: W,
    height: H,
    glyphs,
    idPrefix,
    title: `${fmtInt(st.total)} contributions in the last year`,
    desc: `${st.active} active days, longest streak ${st.longest} days, current streak ${st.current} days.`,
  });
  baseCss(doc);
  doc.style(
    '.col{animation:col .7s cubic-bezier(.2,.75,.2,1) both}@keyframes col{from{opacity:0;transform:translateY(5px)}}' +
      '.today{transform-box:fill-box;transform-origin:center;animation:ping 2.4s cubic-bezier(0,0,.2,1) infinite}' +
      '@keyframes ping{0%{transform:scale(1);opacity:.7}80%,100%{transform:scale(2.2);opacity:0}}',
  );
  card(doc, t, { w: W, h: H, radius: compact ? 16 : 18 });

  // ── headline number ─────────────────────────────────────────
  const probe = shape(fmtInt(st.total), numStyle);
  const numW = probe.advance * probe.scale;
  odometer(doc, st.total, { x, y: numBase, style: numStyle, fill: gradient(doc, t.gradient, x, x + numW) });
  const labelX = x + numW + (compact ? 12 : 14);
  doc.text('contributions', { ...type.item, size: compact ? 13.5 : 15, x: labelX, y: numBase - (compact ? 16 : 20), fill: t.text });
  doc.text('in the last year', { ...type.bodySm, size: compact ? 12.5 : 13.5, x: labelX, y: numBase - 1, fill: t.muted });

  // ── stat blocks ─────────────────────────────────────────────
  const blocks = [
    { value: fmtInt(st.active), label: 'Active days' },
    { value: String(st.longest), unit: st.longest === 1 ? 'day' : 'days', label: compact ? 'Best streak' : 'Longest streak' },
    { value: st.perActive.toFixed(1), unit: '/ day', label: compact ? 'When active' : 'Avg. when active' },
  ];
  const blockW = compact ? (W - PAD * 2 - 8) / 3 : 124;
  let bx = compact ? x : W - PAD - 4 - blockW * blocks.length;
  const statLabel = { ...type.labelSm, size: compact ? 8.5 : 9.5, tracking: 0.12 };
  blocks.forEach((b, i) => {
    const vx = bx + (i ? (compact ? 14 : 22) : 0);
    if (i) doc.add(`<path d="M${r(bx + 0.5)} ${r(statsBase - statStyle.size * 1.55)}V${statsBase + 2}" stroke="${t.divider}"/>`);
    const v = doc.text(b.value, { ...statStyle, features: { tnum: true }, x: vx, y: statsBase - (compact ? 13 : 14), fill: t.text });
    if (b.unit) doc.text(b.unit, { ...type.bodySm, size: compact ? 11.5 : 13, x: vx + v.width + 4, y: statsBase - (compact ? 13 : 14), fill: t.muted });
    doc.text(b.label.toUpperCase(), { ...statLabel, x: vx, y: statsBase + 1, fill: t.muted });
    bx += blockW;
  });

  // ── calendar grid ───────────────────────────────────────────
  const monthStyle = { ...type.labelSm, size: compact ? 9 : 10, tracking: 0.06 };
  let lastLabel = -10;
  weeks.forEach((week, ci) => {
    const month = Number(week[0].date.slice(5, 7));
    const prev = ci ? Number(weeks[ci - 1][0].date.slice(5, 7)) : null;
    const starts = ci === 0 ? Number(week[0].date.slice(8, 10)) <= 14 : month !== prev;
    if (starts && ci - lastLabel >= 3 && ci < weeks.length - 1) {
      doc.text(MONTHS[month - 1], { ...monthStyle, x: gridX + ci * PITCH, y: monthBase, fill: t.muted });
      lastLabel = ci;
    }
  });
  const dayStyle = { ...type.labelSm, size: compact ? 9 : 10, tracking: 0.04 };
  ['Mon', 'Wed', 'Fri'].forEach((label, k) => {
    const row = k * 2 + 1;
    doc.text(label, { ...dayStyle, x: gridX - (compact ? 7 : 10), y: centerBaseline(gridY + row * PITCH, CELL, dayStyle), anchor: 'end', fill: t.faint });
  });

  const rx = compact ? 2.5 : 3;
  const glowCells = [];
  const cols = weeks.map((week, ci) => {
    const cx = gridX + ci * PITCH;
    const cells = week.map((d) => {
      const cy = gridY + d.wd * PITCH;
      if (d.level === 4 && t.name === 'dark') glowCells.push(`<rect x="${cx}" y="${cy}" width="${CELL}" height="${CELL}" rx="${rx}"/>`);
      return `<rect x="${cx}" y="${cy}" width="${CELL}" height="${CELL}" rx="${rx}" fill="${heat[d.level]}"/>`;
    });
    return `<g class="col" style="animation-delay:${r(0.25 + ci * (compact ? 0.03 : 0.014), 3)}s">${cells.join('')}</g>`;
  });
  if (glowCells.length) {
    const blur = doc.uid('bl');
    doc.def(`<filter id="${blur}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5"/></filter>`);
    doc.add(`<g class="fade" style="animation-delay:1s" filter="url(#${blur})" fill="${heat[4]}" opacity=".45">${glowCells.join('')}</g>`);
  }
  doc.add(cols.join(''));

  // today
  const lastWeek = weeks[weeks.length - 1];
  const today = lastWeek[lastWeek.length - 1];
  const tx = gridX + (weeks.length - 1) * PITCH;
  const ty = gridY + today.wd * PITCH;
  doc.add(`<rect class="today" x="${tx}" y="${ty}" width="${CELL}" height="${CELL}" rx="${rx}" fill="none" stroke="${t.accent}" stroke-width="1.2"/>`);
  doc.add(`<rect x="${tx - 1.5}" y="${ty - 1.5}" width="${CELL + 3}" height="${CELL + 3}" rx="${rx + 1}" fill="none" stroke="${t.accent}"/>`);

  // ── footer ──────────────────────────────────────────────────
  const foot = { ...type.labelSm, size: compact ? 8.5 : 10, tracking: 0.08 };
  doc.text(syncedLabel(calendar.fetchedAt, timeZone).toUpperCase(), { ...foot, x, y: footBase, fill: t.faint });
  let lx = W - PAD - (compact ? 0 : 4);
  const more = doc.text('MORE', { ...foot, x: lx, y: footBase, anchor: 'end', fill: t.faint });
  lx = more.x - (compact ? 6 : 8);
  const sw = compact ? 9 : CELL;
  for (let lvl = 4; lvl >= 0; lvl--) {
    lx -= sw;
    doc.add(`<rect x="${r(lx)}" y="${r(footBase - sw + 1.5)}" width="${sw}" height="${sw}" rx="${rx}" fill="${heat[lvl]}"/>`);
    lx -= compact ? 2.5 : 3;
  }
  doc.text('LESS', { ...foot, x: lx - (compact ? 4 : 5), y: footBase, anchor: 'end', fill: t.faint });
  return doc;
}

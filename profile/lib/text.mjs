// Text → vector outlines.
// GitHub serves README images with a strict CSP, so web fonts inside SVGs are
// not reliable. Every glyph is converted to a path once per file (<defs>) and
// reused with <use>, which keeps the typography identical on every OS.
import * as fontkit from 'fontkit';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const FILES = {
  'display-bold': 'inter-ui/display/InterDisplay-Bold.woff2',
  'display-semibold': 'inter-ui/display/InterDisplay-SemiBold.woff2',
  'display-medium': 'inter-ui/display/InterDisplay-Medium.woff2',
  'text-regular': 'inter-ui/web/Inter-Regular.woff2',
  'text-medium': 'inter-ui/web/Inter-Medium.woff2',
  'text-semibold': 'inter-ui/web/Inter-SemiBold.woff2',
  'mono-regular': 'jetbrains-mono/fonts/webfonts/JetBrainsMonoNL-Regular.woff2',
  'mono-medium': 'jetbrains-mono/fonts/webfonts/JetBrainsMonoNL-Medium.woff2',
};

const fonts = new Map();
export function getFont(key) {
  if (!FILES[key]) throw new Error(`Unknown font "${key}"`);
  if (!fonts.has(key)) {
    fonts.set(key, fontkit.create(readFileSync(path.join(ROOT, 'node_modules', FILES[key]))));
  }
  return fonts.get(key);
}

const NO_LIGATURES = { liga: false, clig: false, dlig: false };

/** Shapes a string and returns glyphs with pen positions in font units. */
export function shape(text, style) {
  const font = getFont(style.font);
  const features = { ...NO_LIGATURES, ...(style.features || {}) };
  const run = font.layout(text, features);
  const upm = font.unitsPerEm;
  const track = (style.tracking || 0) * upm;
  const glyphs = [];
  let pen = 0;
  run.glyphs.forEach((glyph, i) => {
    const pos = run.positions[i];
    glyphs.push({ glyph, x: pen + pos.xOffset, y: pos.yOffset });
    pen += pos.xAdvance + (i < run.glyphs.length - 1 ? track : 0);
  });
  return { font, upm, glyphs, advance: pen, scale: style.size / upm };
}

export function measure(text, style) {
  if (!text) return 0;
  const s = shape(text, style);
  return s.advance * s.scale;
}

const fmt = (n, p) => {
  const v = +n.toFixed(p);
  return Object.is(v, -0) ? '0' : String(v);
};

/** Serialises a fontkit path. `map` lets callers bake a transform in. */
export function pathData(commands, map = (x, y) => [x, y], precision = 0) {
  let d = '';
  for (const { command, args } of commands) {
    const pts = [];
    for (let i = 0; i < args.length; i += 2) pts.push(...map(args[i], args[i + 1]));
    const nums = pts.map((v) => fmt(v, precision)).join(' ');
    if (command === 'moveTo') d += `M${nums}`;
    else if (command === 'lineTo') d += `L${nums}`;
    else if (command === 'quadraticCurveTo') d += `Q${nums}`;
    else if (command === 'bezierCurveTo') d += `C${nums}`;
    else if (command === 'closePath') d += 'Z';
  }
  return d.replace(/ -/g, '-');
}

/**
 * Greedy word wrap over styled spans.
 * spans: [{ text, style }] → lines: [{ width, runs: [{ text, style, x }] }]
 */
export function wrap(spans, maxWidth) {
  const tokens = [];
  for (const span of spans) {
    for (const part of span.text.split(/(\s+)/)) {
      if (!part) continue;
      const space = /^\s+$/.test(part);
      tokens.push({ text: space ? ' ' : part, space, style: span.style, w: measure(space ? ' ' : part, span.style) });
    }
  }
  const lines = [];
  let line = [];
  let width = 0;
  const flush = () => {
    while (line.length && line[line.length - 1].space) width -= line.pop().w;
    if (line.length) lines.push(toRuns(line, width));
    line = [];
    width = 0;
  };
  for (const tok of tokens) {
    if (tok.space && !line.length) continue;
    if (!tok.space && width + tok.w > maxWidth && line.length) flush();
    if (tok.space && !line.length) continue;
    line.push(tok);
    width += tok.w;
  }
  flush();
  return lines;
}

function toRuns(tokens, width) {
  const runs = [];
  let x = 0;
  for (const tok of tokens) {
    const last = runs[runs.length - 1];
    if (last && last.style === tok.style) last.text += tok.text;
    else runs.push({ text: tok.text, style: tok.style, x });
    x += tok.w;
  }
  return { width, runs };
}

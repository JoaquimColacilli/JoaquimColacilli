import { shape, measure, wrap, pathData } from './text.mjs';

export const r = (n, p = 2) => {
  const v = +Number(n).toFixed(p);
  return Object.is(v, -0) ? 0 : v;
};

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Glyph outlines shared by one output file (both theme layers reuse them). */
export class Glyphs {
  constructor() {
    this.ids = new Map();
    this.defs = [];
  }

  ref(fontKey, glyph) {
    const key = `${fontKey}:${glyph.id}`;
    let id = this.ids.get(key);
    if (!id) {
      id = `g${this.ids.size.toString(36)}`;
      this.ids.set(key, id);
      this.defs.push(`<path id="${id}" d="${pathData(glyph.path.commands)}"/>`);
    }
    return id;
  }
}

/** One SVG drawing: collects defs, CSS and body markup. */
export class Doc {
  constructor({ width, height, title, desc = '', glyphs = null, idPrefix = '' }) {
    Object.assign(this, { width, height, title, desc, idPrefix });
    this.glyphs = glyphs || new Glyphs();
    this.defs = [];
    this.css = [];
    this.body = [];
    this.n = 0;
  }

  uid(prefix = 'u') {
    return `${this.idPrefix}${prefix}${(this.n++).toString(36)}`;
  }

  add(...parts) {
    this.body.push(...parts.flat());
    return this;
  }

  def(...parts) {
    this.defs.push(...parts.flat());
    return this;
  }

  style(css) {
    this.css.push(css);
    return this;
  }

  glyphRef(fontKey, glyph) {
    return this.glyphs.ref(fontKey, glyph);
  }

  measure(text, style) {
    return measure(text, style);
  }

  wrap(spans, maxWidth) {
    return wrap(spans, maxWidth);
  }

  /** Renders a single line of text. Returns the markup and its width in px. */
  textMarkup(text, { x, y, anchor = 'start', fill, opacity, cls, attrs = '', ...style }) {
    const s = shape(text, style);
    const width = s.advance * s.scale;
    const x0 = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
    const uses = s.glyphs
      .filter((g) => g.glyph.path.commands.length)
      .map((g) => `<use href="#${this.glyphRef(style.font, g.glyph)}" x="${Math.round(g.x)}"${g.y ? ` y="${Math.round(g.y)}"` : ''}/>`)
      .join('');
    const extra = [
      fill ? ` fill="${fill}"` : '',
      opacity != null ? ` opacity="${opacity}"` : '',
      cls ? ` class="${cls}"` : '',
      attrs ? ` ${attrs}` : '',
    ].join('');
    const sc = r(s.scale, 6);
    const markup = `<g transform="translate(${r(x0)} ${r(y)}) scale(${sc} ${-sc})"${extra}>${uses}</g>`;
    return { markup, width, x: x0 };
  }

  text(text, opts) {
    const { markup, width, x } = this.textMarkup(text, opts);
    this.add(markup);
    return { width, x };
  }

  /** Text as one absolute path (used where a shared gradient must span the run). */
  textPath(text, { x, y, anchor = 'start', ...style }) {
    const s = shape(text, style);
    const width = s.advance * s.scale;
    const x0 = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
    let d = '';
    for (const g of s.glyphs) {
      if (!g.glyph.path.commands.length) continue;
      d += pathData(
        g.glyph.path.commands,
        (gx, gy) => [x0 + (g.x + gx) * s.scale, y - (g.y + gy) * s.scale],
        2,
      );
    }
    return { d, width, x: x0 };
  }

  /** Renders wrapped lines produced by wrap(). */
  lines(lines, { x, y, lineHeight, fill }) {
    lines.forEach((line, i) => {
      for (const run of line.runs) {
        this.text(run.text, { ...run.style, x: x + run.x, y: y + i * lineHeight, fill: run.style.fill || fill });
      }
    });
    return lines.length * lineHeight;
  }

  render() {
    return svgFile(this, {
      css: unique(this.css).join(''),
      defs: this.defs.join(''),
      body: this.body.join(''),
    });
  }
}

const unique = (list) => [...new Set(list)];

function svgFile(doc, { css, defs, body }) {
  const { width, height } = doc;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-labelledby="title desc">`,
    `<title id="title">${esc(doc.title)}</title>`,
    `<desc id="desc">${esc(doc.desc)}</desc>`,
    css ? `<style>${css}</style>` : '',
    `<defs>${doc.glyphs.defs.join('')}${defs}</defs>`,
    body,
    '</svg>',
  ].join('');
}

/**
 * Light + dark drawings in one file that follows the OS colour scheme.
 * Used for the small-screen variants, where <picture> already spends its media query on width.
 */
export function bothThemes(light, dark) {
  if (light.height !== dark.height || light.width !== dark.width) {
    throw new Error(`Theme layers differ in size: ${light.width}×${light.height} vs ${dark.width}×${dark.height}`);
  }
  return svgFile(light, {
    css:
      unique([...light.css, ...dark.css]).join('') +
      '.td{display:none}@media (prefers-color-scheme:dark){.tl{display:none}.td{display:inline}}',
    defs: light.defs.join('') + dark.defs.join(''),
    body: `<g class="tl">${light.body.join('')}</g><g class="td">${dark.body.join('')}</g>`,
  });
}

/** Rounded-rect path with independent corner radii [tl, tr, br, bl]. */
export function roundedRect(x, y, w, h, radius) {
  const [tl, tr, br, bl] = Array.isArray(radius) ? radius : [radius, radius, radius, radius];
  return [
    `M${r(x + tl)} ${r(y)}`,
    `H${r(x + w - tr)}`,
    tr ? `A${tr} ${tr} 0 0 1 ${r(x + w)} ${r(y + tr)}` : '',
    `V${r(y + h - br)}`,
    br ? `A${br} ${br} 0 0 1 ${r(x + w - br)} ${r(y + h)}` : '',
    `H${r(x + bl)}`,
    bl ? `A${bl} ${bl} 0 0 1 ${r(x)} ${r(y + h - bl)}` : '',
    `V${r(y + tl)}`,
    tl ? `A${tl} ${tl} 0 0 1 ${r(x + tl)} ${r(y)}` : '',
    'Z',
  ].join('');
}

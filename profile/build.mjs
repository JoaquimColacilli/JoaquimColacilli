// Renders every panel of the profile README into dist/:
//   <name>-dark.svg / <name>-light.svg   desktop, picked by GitHub's theme via <picture>
//   <name>-compact.svg                   phones, one file that follows the OS theme
//
//   node profile/build.mjs                     → needs GITHUB_TOKEN for the activity panel
//   node profile/build.mjs --sample-activity   → offline preview with bundled sample data
//   node profile/build.mjs --out some/dir
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { themes } from './theme.mjs';
import { links, work, profile, settings } from './content.mjs';
import { sections } from './sections.mjs';
import { Glyphs, bothThemes } from './lib/svg.mjs';
import { hero } from './components/hero.mjs';
import { linkPill, sectionStrip } from './components/basics.mjs';
import { stackPanel } from './components/stack.mjs';
import { experiencePanel } from './components/experience.mjs';
import { workCard } from './components/work.mjs';
import { activityPanel } from './components/activity.mjs';
import { educationPanel } from './components/education.mjs';
import { footerStrip } from './components/footer.mjs';
import { fetchCalendar } from './lib/github.mjs';

const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const out = path.resolve(option('--out') ?? 'dist');
const now = new Date();

let calendar = null;
if (args.includes('--sample-activity')) {
  calendar = JSON.parse(readFileSync(new URL('./fixtures/activity-sample.json', import.meta.url), 'utf8'));
} else if (process.env.GITHUB_TOKEN) {
  try {
    calendar = await fetchCalendar(process.env.GITHUB_USER || profile.github, process.env.GITHUB_TOKEN);
  } catch (error) {
    // keep drawing everything else; the workflow reuses the last published activity panel
    console.log(`::warning::Activity panel skipped: ${error.message}`);
  }
} else {
  console.warn('No GITHUB_TOKEN set: skipping the activity panel (use --sample-activity to preview it).');
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
let count = 0;
let bytes = 0;
const write = (name, svg) => {
  writeFileSync(path.join(out, name), svg);
  count++;
  bytes += Buffer.byteLength(svg);
};

/** Writes the desktop pair and the compact file for one panel. */
function panel(name, draw) {
  for (const t of Object.values(themes)) write(`${name}-${t.name}.svg`, draw(t, {}).render());
  const glyphs = new Glyphs();
  const light = draw(themes.light, { compact: true, glyphs, idPrefix: 'l' });
  const dark = draw(themes.dark, { compact: true, glyphs, idPrefix: 'd' });
  write(`${name}-compact.svg`, bothThemes(light, dark));
}

panel('hero', (t, o) => hero(t, o));
for (const link of links) panel(`link-${link.id}`, (t, o) => linkPill(t, link, o));
for (const s of sections()) panel(`section-${s.id}`, (t, o) => sectionStrip(t, s, o));
panel('stack', (t, o) => stackPanel(t, o));
panel('experience', (t, o) => experiencePanel(t, { ...o, now }));
work.forEach((item, i) => panel(`work-${item.id}`, (t, o) => workCard(t, item, i % 2, o)));
if (calendar) {
  const opts = { palette: settings.heatmap, timeZone: settings.timeZone };
  panel('activity', (t, o) => activityPanel(t, calendar, { ...opts, ...o }));
  writeFileSync(path.join(out, 'activity.json'), JSON.stringify({ total: calendar.total, fetchedAt: calendar.fetchedAt }, null, 2));
}
panel('education', (t, o) => educationPanel(t, o));
panel('footer', (t, o) => footerStrip(t, { ...o, now }));

console.log(`Wrote ${count} SVGs (${(bytes / 1024).toFixed(0)} KB) to ${path.relative(process.cwd(), out) || '.'}`);

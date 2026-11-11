# Profile generator

Every panel of the profile README is an SVG drawn by this folder. Text is converted to
vector outlines (Inter, Inter Display and JetBrains Mono), so it looks the same on every
OS without depending on fonts GitHub can't load.

## Editing

1. Change what the profile says in `content.mjs` (colours live in `theme.mjs`).
2. If you added or removed a link or a project, run `npm run readme` to rewrite `README.md`.
3. Push to `main`. The **Profile images** workflow redraws everything and publishes it to
   the `output` branch, which the README reads from.

The workflow also runs every 6 hours to refresh the activity panel with the real
contribution calendar (GitHub GraphQL API). Private contributions are counted when
"Private contributions" is enabled in the profile's contribution settings; alternatively,
save a classic token with `read:user` as the `PROFILE_TOKEN` secret.

## Previewing locally

```bash
npm ci
npm run build:sample   # writes dist/ using bundled sample activity data
```

Each panel comes in three files: `*-dark.svg` and `*-light.svg` for desktop (GitHub picks
one through `<picture>` and the theme), and `*-compact.svg` for screens under 560px, a
single file that follows the system theme.

## Files

| Path | What it is |
| --- | --- |
| `content.mjs` | Texts, links, projects, settings |
| `theme.mjs` | Colours, type scale, layout widths |
| `components/` | One file per panel |
| `lib/text.mjs` | Shaping and glyph outlines (fontkit) |
| `lib/svg.mjs` | SVG document builder |
| `lib/github.mjs` | Contribution calendar query |
| `build.mjs` | Writes every SVG to `dist/` |
| `readme.mjs` | Writes `README.md` |

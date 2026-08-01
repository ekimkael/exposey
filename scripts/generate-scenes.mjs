// Generates the reading-log scene artwork in assets/scenes/.
// Each scene is a stylised "open book somewhere" photo: gradient ambience +
// a book drawn from its four corners, so the text lines follow the page slant.
// Run with: node scripts/generate-scenes.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 413;
const H = 600;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'scenes');

/** Open-book corner geometry, shared by both pages. */
const CX = W / 2;
const BASE = 470;
const PAGE_H = 175;
const HALF_W = 152;

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const pts = (list) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

/**
 * One page as a quad: spine-top, outer-top, outer-bottom, spine-bottom.
 * `dir` is -1 for the left page, 1 for the right.
 */
function page(dir) {
  return {
    spineTop: [CX, BASE - PAGE_H],
    outerTop: [CX + dir * HALF_W, BASE - PAGE_H + 24],
    outerBottom: [CX + dir * (HALF_W - 11), BASE + 15],
    spineBottom: [CX, BASE],
  };
}

/** Text lines interpolated across the page quad, so they slant with it. */
function textLines(p, ink) {
  const count = 9;
  let out = '';
  for (let i = 0; i < count; i++) {
    const t = (i + 1) / (count + 1);
    const inner = lerp(p.spineTop, p.spineBottom, t);
    const outer = lerp(p.outerTop, p.outerBottom, t);
    // Ragged right edge, and a shorter line at the end of each "paragraph".
    const len = i === count - 1 ? 0.55 : 0.78 + ((i * 7) % 5) * 0.035;
    const a = lerp(inner, outer, 0.1);
    const b = lerp(inner, outer, 0.1 + len * 0.85);
    out += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${ink}" stroke-width="3.4" stroke-linecap="round" opacity="0.42"/>`;
  }
  return out;
}

function bookSvg(paper, ink) {
  let out = '';
  for (const dir of [-1, 1]) {
    const p = page(dir);
    const quad = pts([p.spineTop, p.outerTop, p.outerBottom, p.spineBottom]);
    // Page block underneath, giving the book some thickness.
    const block = pts([
      p.outerTop,
      p.outerBottom,
      [p.outerBottom[0] - dir * 4, p.outerBottom[1] + 13],
      [p.outerTop[0] - dir * 4, p.outerTop[1] + 13],
    ]);
    out += `<polygon points="${block}" fill="${ink}" opacity="0.28"/>`;
    out += `<polygon points="${quad}" fill="${paper}"/>`;
    out += textLines(p, ink);
  }
  // Gutter shadow along the spine.
  out += `<rect x="${CX - 9}" y="${BASE - PAGE_H}" width="18" height="${PAGE_H}" fill="url(#gutter)"/>`;
  return out;
}

function sceneSvg({ sky, mid, ground, glow, glowX, glowY, glowR, horizon, paper, ink }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${sky}"/>
<stop offset="${horizon}" stop-color="${mid}"/>
<stop offset="1" stop-color="${ground}"/>
</linearGradient>
<radialGradient id="glow" cx="${glowX}" cy="${glowY}" r="${glowR}">
<stop offset="0" stop-color="${glow}" stop-opacity="0.85"/>
<stop offset="1" stop-color="${glow}" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gutter" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="${ink}" stop-opacity="0"/>
<stop offset="0.5" stop-color="${ink}" stop-opacity="0.5"/>
<stop offset="1" stop-color="${ink}" stop-opacity="0"/>
</linearGradient>
<radialGradient id="vignette" cx="0.5" cy="0.45" r="0.78">
<stop offset="0.5" stop-color="#000" stop-opacity="0"/>
<stop offset="1" stop-color="#000" stop-opacity="0.5"/>
</radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
<ellipse cx="${CX}" cy="${BASE + 18}" rx="${HALF_W + 14}" ry="26" fill="#000" opacity="0.22"/>
${bookSvg(paper, ink)}
<rect width="${W}" height="${H}" fill="url(#vignette)"/>
</svg>
`;
}

/** 14 ambiences, loosely tracking the settings in the reference clip. */
const scenes = {
  '01-beach': { sky: '#2f6ea8', mid: '#8fb6cf', ground: '#b9b0a0', glow: '#ffffff', glowX: '0.5', glowY: '0.3', glowR: '0.55', horizon: '0.46', paper: '#f2ece0', ink: '#3d3a33' },
  '02-cafe': { sky: '#4a2c18', mid: '#8a5325', ground: '#c98f4d', glow: '#ffcb7a', glowX: '0.72', glowY: '0.22', glowR: '0.5', horizon: '0.4', paper: '#f6e9d2', ink: '#4a3826' },
  '03-plane': { sky: '#9fb4c4', mid: '#63798c', ground: '#3d4a57', glow: '#ffffff', glowX: '0.24', glowY: '0.2', glowR: '0.38', horizon: '0.34', paper: '#eef1f2', ink: '#3a4048' },
  '04-bedside': { sky: '#2a1d16', mid: '#54372a', ground: '#7d5540', glow: '#ffb765', glowX: '0.3', glowY: '0.18', glowR: '0.42', horizon: '0.42', paper: '#f4e3cc', ink: '#4d3826' },
  '05-park': { sky: '#5b8a4a', mid: '#7ba85e', ground: '#4f6c3c', glow: '#dcf3a6', glowX: '0.6', glowY: '0.16', glowR: '0.5', horizon: '0.38', paper: '#f3efe2', ink: '#39402f' },
  '06-train': { sky: '#7b8f99', mid: '#4d5f6b', ground: '#2f3b44', glow: '#cfe3ec', glowX: '0.18', glowY: '0.26', glowR: '0.4', horizon: '0.36', paper: '#edeef0', ink: '#363f46' },
  '07-kitchen': { sky: '#e6dcc2', mid: '#c9b58a', ground: '#9c8a6a', glow: '#fff6d8', glowX: '0.5', glowY: '0.14', glowR: '0.5', horizon: '0.4', paper: '#fbf4e6', ink: '#4a4335' },
  '08-balcony': { sky: '#e8804a', mid: '#c05a55', ground: '#6b3348', glow: '#ffd08a', glowX: '0.5', glowY: '0.24', glowR: '0.58', horizon: '0.44', paper: '#f7e6d4', ink: '#4d3330' },
  '09-library': { sky: '#241a12', mid: '#4a3320', ground: '#6d4c2e', glow: '#e0a765', glowX: '0.66', glowY: '0.2', glowR: '0.44', horizon: '0.42', paper: '#f0e0c6', ink: '#43331f' },
  '10-bath': { sky: '#dfeaea', mid: '#b6cfd1', ground: '#8fadb2', glow: '#ffffff', glowX: '0.4', glowY: '0.18', glowR: '0.46', horizon: '0.4', paper: '#fbf8f2', ink: '#3f4a4c' },
  '11-forest': { sky: '#1f3a26', mid: '#33573a', ground: '#22301f', glow: '#a8d68a', glowX: '0.56', glowY: '0.14', glowR: '0.46', horizon: '0.36', paper: '#eceadd', ink: '#2f3a2c' },
  '12-desk': { sky: '#131a2a', mid: '#24304a', ground: '#39415c', glow: '#ffc98a', glowX: '0.28', glowY: '0.2', glowR: '0.4', horizon: '0.4', paper: '#f2ead9', ink: '#39364a' },
  '13-snow': { sky: '#c3d8e8', mid: '#e2ecf3', ground: '#aabecd', glow: '#ffffff', glowX: '0.5', glowY: '0.22', glowR: '0.55', horizon: '0.44', paper: '#fdfbf7', ink: '#44505c' },
  '14-hammock': { sky: '#8fa15e', mid: '#b7a05e', ground: '#7d6a38', glow: '#ffe9a8', glowX: '0.66', glowY: '0.18', glowR: '0.5', horizon: '0.4', paper: '#f7efd9', ink: '#4a4128' },
};

mkdirSync(OUT, { recursive: true });
for (const [name, palette] of Object.entries(scenes)) {
  writeFileSync(join(OUT, `${name}.svg`), sceneSvg(palette));
}
console.log(`wrote ${Object.keys(scenes).length} scenes to ${OUT}`);

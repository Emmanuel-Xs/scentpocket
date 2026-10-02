// One-off generator for favicons, PWA icons and the OG image. Run: node scripts/make-brand-assets.mjs
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const INK = '#1C1915'
const CREAM = '#FAF6EF'
const mark = (fill, stitch) => `
<rect x="37" y="2" width="26" height="14" rx="4" fill="${fill}"/>
<rect x="44" y="15" width="12" height="10" rx="1.5" fill="${fill}"/>
<path d="M14 31 Q14 25 20 25 H80 Q86 25 86 31 V70 Q86 78 81 85 L69 104 Q65 112 56 112 H44 Q35 112 31 104 L19 85 Q14 78 14 70 Z" fill="${fill}"/>
<path d="M23 35 H77 V69 Q77 75 73 80 L62 98 Q59 103 53 103 H47 Q41 103 38 98 L27 80 Q23 75 23 69 Z" stroke="${stitch}" stroke-width="2.5" stroke-dasharray="5 4" stroke-linejoin="round" stroke-linecap="round" fill="none"/>`

// Mark centred on a square cream tile; `scale` is the mark height as a share of the tile.
const tile = (size, scale) => {
  const h = size * scale
  const w = h * (100 / 116)
  const x = (size - w) / 2
  const y = (size - h) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${CREAM}"/><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 100 116">${mark(INK, CREAM)}</svg></svg>`
}
const png = (svg, file, size) =>
  sharp(Buffer.from(svg)).resize(size, size).png().toFile(`public/${file}`)

writeFileSync(
  'public/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 116">${mark(INK, CREAM)}</svg>`,
)
await png(tile(512, 0.62), 'favicon-32.png', 32)
await png(tile(512, 0.62), 'favicon-16.png', 16)
await png(tile(512, 0.62), 'apple-touch-icon.png', 180)
await png(tile(512, 0.62), 'icon-192.png', 192)
await png(tile(512, 0.62), 'icon-512.png', 512)
// Maskable: mark inside the central 80% safe zone.
await png(tile(512, 0.5), 'icon-512-maskable.png', 512)

// OG image 1200x630: the wordmark logo on cream, tagline under it.
const logo = await sharp('public/email/scentpocket-email-logo.png')
  .resize({ width: 720 })
  .toBuffer()
const lh = (await sharp(logo).metadata()).height
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${CREAM}"/>
<text x="600" y="${315 + lh / 2 + 70}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="46" font-style="italic" fill="${INK}">A scent for every pocket.</text>
<text x="600" y="${315 + lh / 2 + 124}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#5E564C">Real perfumes, honest prices, dupes that let you smell the part.</text></svg>`
await sharp(Buffer.from(svg))
  .composite([{ input: logo, left: 240, top: Math.round(315 - lh / 2 - 40) }])
  .png()
  .toFile('public/og-image.png')

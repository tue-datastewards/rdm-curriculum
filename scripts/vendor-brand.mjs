#!/usr/bin/env node
/**
 * Copies the design tokens and the specific assets this site uses from the
 * TU/e "This is RDM" brand kit (internal, v1.0.0).
 *
 *   BRANDKIT_PATH=~/dev/tue-rdm-brandkit node scripts/vendor-brand.mjs
 *
 * The kit is not a dependency: assets are committed so builds are reproducible
 * and do not depend on a local checkout.
 */
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

const kit = process.env.BRANDKIT_PATH ?? join(homedir(), 'dev/tue-rdm-brandkit')
const publicBrand = join(process.cwd(), 'public', 'brand')

// Only the icons the site actually renders, instead of the full 221 kB sprite.
const ICONS = [
  'icon-document-bars',
  'icon-target-chart',
  'icon-laptop-idea-panel',
  'icon-clipboard-growth',
  'icon-binary-document',
  'icon-magnifier-chart',
  'icon-laptop-globe',
  'icon-funnel-chart',
  'icon-database-pie',
  'icon-clipboard-growth',
]

await mkdir(publicBrand, { recursive: true })
await mkdir(join(process.cwd(), 'src', 'styles'), { recursive: true })

await copyFile(join(kit, 'tokens', 'tokens.css'), join(process.cwd(), 'src', 'styles', 'rdm-tokens.css'))
console.log('✓ tokens.css')

for (const name of ['tue-logo-wordmark-purple.svg', 'tue-logo-wordmark-white.svg', 'tue-logo-stacked-purple.svg']) {
  await copyFile(join(kit, 'assets', 'logos', name), join(publicBrand, name))
  console.log(`✓ ${name}`)
}

await copyFile(join(kit, 'assets', 'logos', 'tue-logo-stacked-purple.svg'), join(publicBrand, 'favicon.svg'))
await copyFile(join(kit, 'assets', 'qr', 'qr-rdm-black.svg'), join(publicBrand, 'qr-rdm.svg'))
console.log('✓ favicon, booklet QR')

// Hero artwork: the four-row tile, recoloured for use on the purple band.
const tile = await readFile(join(kit, 'assets', 'icons', 'icon-wallpaper-tile.svg'), 'utf8')
await writeFile(join(publicBrand, 'wallpaper-dark.svg'), tile.replaceAll('#6E4061', '#4A133C'))
console.log('✓ wallpaper-dark.svg (recoloured tile)')

const sprite = await readFile(join(kit, 'assets', 'icons', 'icons.svg'), 'utf8')
const selected = []
for (const id of [...new Set(ICONS)]) {
  const match = sprite.match(new RegExp(`<symbol id="${id}"[\\s\\S]*?</symbol>`))
  if (!match) throw new Error(`Icon not found in brand kit: ${id}`)
  selected.push(match[0])
}
await writeFile(
  join(publicBrand, 'icons.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute" width="0" height="0" aria-hidden="true">\n${selected.join('\n')}\n</svg>\n`,
)
console.log('✓ icons.svg (10 symbols)')

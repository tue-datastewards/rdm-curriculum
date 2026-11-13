import { copyFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')

// GitLab Pages serves 404.html for unknown paths. Serving a copy of the app
// there lets the client-side router resolve deep links like /modules/M01.
await copyFile(join(dist, 'index.html'), join(dist, '404.html'))

// Kept for portability; GitLab Pages ignores it. GitHub Pages would otherwise
// run Jekyll over files beginning with an underscore.
await writeFile(join(dist, '.nojekyll'), '')

console.log('✓ Added 404.html fallback and .nojekyll')

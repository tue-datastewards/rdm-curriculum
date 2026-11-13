#!/usr/bin/env node
/**
 * Copies the Sveltia CMS browser bundle into public/admin so the editor is
 * served from the same internal GitLab Pages site as the course. The bundle is
 * not committed; `npm run dev` and `npm run build` call this automatically.
 */
import { cp, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

const source = join(process.cwd(), 'node_modules', '@sveltia', 'cms', 'dist')
const packageRoot = join(process.cwd(), 'node_modules', '@sveltia', 'cms')
const target = join(process.cwd(), 'public', 'admin')

await mkdir(target, { recursive: true })

await cp(join(source, 'sveltia-cms.js'), join(target, 'sveltia-cms.js'))
await rm(join(target, 'sveltia-cms.mjs'), { force: true })

for (const dir of ['chunks']) {
  await rm(join(target, dir), { recursive: true, force: true })
  await cp(join(source, dir), join(target, dir), {
    recursive: true,
    filter: (path) => !path.endsWith('.map'),
  })
}

// UI translations live at the package root, not in dist/.
await rm(join(target, 'locales'), { recursive: true, force: true })
await cp(join(packageRoot, 'locales'), join(target, 'locales'), { recursive: true })

console.log('✓ Sveltia CMS copied to public/admin')

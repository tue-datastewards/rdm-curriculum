import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')
const indexPath = join(dist, 'index.html')

let html = await readFile(indexPath, 'utf8')

// Preview deployments share the production host, so keep draft modules and the
// staff views out of search results.
if (process.env.PREVIEW === '1') {
  html = html.replace(
    '<head>',
    '<head>\n    <meta name="robots" content="noindex" />',
  )
  await writeFile(indexPath, html)
}

// GitHub Pages serves 404.html for unknown paths, and always the copy at the
// site root — even for nested paths such as /pr-preview/pr-12/modules/M01.
// Serving a copy of the app there lets the client-side router resolve deep
// links like /modules/M01. The inline script runs before the module bundle: for
// a path inside a PR preview it redirects to that preview's home, because a
// sub-path preview cannot have its own 404 fallback and would otherwise fall
// through to the production app.
const previewRedirect = String.raw`
    <script>
      var match = location.pathname.match(/^(.*\/pr-preview\/pr-\d+)(?:\/|$)/)
      if (match) location.replace(match[1] + '/')
    </script>`

html = html.replace('</head>', `${previewRedirect}\n  </head>`)
await writeFile(join(dist, '404.html'), html)

// Keep GitHub Pages from running Jekyll over the build output.
await writeFile(join(dist, '.nojekyll'), '')

console.log('✓ Added 404.html fallback and .nojekyll')

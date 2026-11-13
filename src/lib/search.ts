import { curriculum } from '../data/curriculum'
import { publishedMilos, publishedModules } from '../data/derive'
import { moduleNumber } from './labels'

export type SearchKind = 'Module' | 'Section' | 'Resource'

export type SearchHit = {
  id: string
  title: string
  context: string
  href: string
  kind: SearchKind
  text: string
}

function plain(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

let index: SearchHit[] | undefined

function getIndex(): SearchHit[] {
  if (index) return index

  index = []
  for (const module of publishedModules(curriculum)) {
    const number = moduleNumber(module.id)

    index.push({
      id: `module:${module.id}`,
      title: module.title,
      context: `Module ${number}`,
      href: `/modules/${module.id}`,
      kind: 'Module',
      text: plain(`${module.summary} ${module.description}`).toLowerCase(),
    })

    for (const milo of publishedMilos(module)) {
      index.push({
        id: `section:${milo.id}`,
        title: milo.learnerTitle || milo.statement,
        context: `Module ${number} · Section`,
        href: `/modules/${module.id}#${milo.id}`,
        kind: 'Section',
        text: plain(
          `${milo.learnerStatement} ${milo.statement} ${milo.content} ${milo.teaching.learner}`,
        ).toLowerCase(),
      })

      for (const resource of milo.resources) {
        index.push({
          id: `resource:${milo.id}:${resource.label}`,
          title: resource.label,
          context: `Module ${number} · ${milo.learnerTitle || milo.statement}`,
          href: resource.url ?? `/modules/${module.id}#${milo.id}`,
          kind: 'Resource',
          text: plain(`${resource.note ?? ''} ${resource.label}`).toLowerCase(),
        })
      }
    }
  }

  return index
}

export function searchCurriculum(query: string): SearchHit[] {
  const term = query.trim().toLowerCase()
  if (term.length < 2) return []

  return getIndex()
    .map((hit) => {
      const title = hit.title.toLowerCase()
      let score = 0
      if (title === term) score = 100
      else if (title.startsWith(term)) score = 80
      else if (title.includes(term)) score = 60
      else if (hit.text.includes(term)) score = 30
      return { hit, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((entry) => entry.hit)
}

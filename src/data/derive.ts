import { missingComponents } from './schema'
import type { Curriculum, Cilo, Milo, Module } from './schema'

export type MiloEntry = { module: Module; milo: Milo }

export function allMilos(curriculum: Curriculum): MiloEntry[] {
  return curriculum.modules.flatMap((module) =>
    module.milos.map((milo) => ({ module, milo })),
  )
}

export function ciloCoverage(curriculum: Curriculum): Map<string, MiloEntry[]> {
  const coverage = new Map<string, MiloEntry[]>(
    curriculum.cilos.map((cilo) => [cilo.id, []]),
  )
  for (const entry of allMilos(curriculum)) {
    for (const ciloId of entry.milo.cilos) {
      coverage.get(ciloId)?.push(entry)
    }
  }
  return coverage
}

/** Unique CILO ids addressed by a module, in course order. */
export function moduleCiloIds(module: Module, cilos: Cilo[]): string[] {
  const used = new Set(module.milos.flatMap((milo) => milo.cilos))
  return cilos.filter((cilo) => used.has(cilo.id)).map((cilo) => cilo.id)
}

export function stats(curriculum: Curriculum) {
  const entries = allMilos(curriculum)
  return {
    cilos: curriculum.cilos.length,
    modules: curriculum.modules.length,
    milos: entries.length,
    links: entries.reduce((total, { milo }) => total + milo.cilos.length, 0),
    complete: entries.filter(({ milo }) => milo.status === 'complete').length,
    migrated: entries.filter(({ milo }) => milo.status === 'migrated').length,
    drafts: entries.filter(({ milo }) => milo.status === 'draft').length,
    incomplete: entries.filter(
      ({ milo }) => missingComponents(milo).length > 0,
    ).length,
  }
}

export function alignmentGaps(curriculum: Curriculum) {
  const coverage = ciloCoverage(curriculum)
  const entries = allMilos(curriculum)
  return {
    uncoveredCilos: curriculum.cilos.filter(
      (cilo) => (coverage.get(cilo.id)?.length ?? 0) === 0,
    ),
    unalignedMilos: entries.filter(({ milo }) => milo.cilos.length === 0),
    incompleteMilos: entries.filter(
      ({ milo }) => missingComponents(milo).length > 0,
    ),
  }
}

export function publishedModules(curriculum: Curriculum): Module[] {
  return curriculum.modules.filter((module) => module.published)
}

export function publishedMilos(module: Module): Milo[] {
  return module.milos.filter((milo) => milo.published)
}

export function publishedEntries(curriculum: Curriculum): MiloEntry[] {
  return publishedModules(curriculum).flatMap((module) =>
    publishedMilos(module).map((milo) => ({ module, milo })),
  )
}

/** Coverage calculated from published content only, for learner-facing views. */
export function publishedCiloCoverage(curriculum: Curriculum): Map<string, MiloEntry[]> {
  const coverage = new Map<string, MiloEntry[]>(
    curriculum.cilos.map((cilo) => [cilo.id, []]),
  )
  for (const entry of publishedEntries(curriculum)) {
    for (const ciloId of entry.milo.cilos) {
      coverage.get(ciloId)?.push(entry)
    }
  }
  return coverage
}

/** Unique CILO ids addressed by the published part of a module. */
export function publishedModuleCiloIds(module: Module, cilos: Cilo[]): string[] {
  const used = new Set(publishedMilos(module).flatMap((milo) => milo.cilos))
  return cilos.filter((cilo) => used.has(cilo.id)).map((cilo) => cilo.id)
}

export function learnerStats(curriculum: Curriculum) {
  const modules = publishedModules(curriculum)
  const entries = publishedEntries(curriculum)
  return {
    modules,
    moduleCount: modules.length,
    sections: entries.length,
    firstModule: modules[0],
  }
}

/** Previous/next published module, for the reading flow. */
export function moduleNeighbours(
  curriculum: Curriculum,
  moduleId: string,
): { previous?: Module; next?: Module } {
  const modules = publishedModules(curriculum)
  const index = modules.findIndex((module) => module.id === moduleId)
  if (index === -1) return {}
  return { previous: modules[index - 1], next: modules[index + 1] }
}

/** Group MILO entries by module, preserving curriculum order. */
export function groupByModule(entries: MiloEntry[]) {
  const groups: { module: Module; milos: Milo[] }[] = []
  for (const { module, milo } of entries) {
    let group = groups.find((item) => item.module.id === module.id)
    if (!group) {
      group = { module, milos: [] }
      groups.push(group)
    }
    group.milos.push(milo)
  }
  return groups
}

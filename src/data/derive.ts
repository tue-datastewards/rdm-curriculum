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

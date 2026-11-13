import { useSyncExternalStore } from 'react'

/**
 * Learner progress is stored locally, never on a server. The shape is versioned
 * so a future change can migrate or discard old progress safely.
 */
export type ProgressState = {
  sections: Record<string, boolean>
  modules: Record<string, string>
  lastVisited?: { moduleId: string; sectionId?: string }
}

const STORAGE_KEY = 'rdm-curriculum:progress:v1'
const EMPTY: ProgressState = { sections: {}, modules: {} }

let snapshot: ProgressState | undefined
const listeners = new Set<() => void>()

function read(): ProgressState {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    return {
      sections: parsed.sections ?? {},
      modules: parsed.modules ?? {},
      lastVisited: parsed.lastVisited,
    }
  } catch {
    return EMPTY
  }
}

function getSnapshot(): ProgressState {
  snapshot ??= read()
  return snapshot
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return
    snapshot = read()
    listener()
  }
  window.addEventListener('storage', onStorage)

  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function write(next: ProgressState): void {
  snapshot = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Private mode or a full quota: the site still works, just without progress.
  }
  for (const listener of listeners) listener()
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export const progressActions = {
  setSection(sectionId: string, done: boolean): void {
    const state = getSnapshot()
    const sections = { ...state.sections }
    if (done) sections[sectionId] = true
    else delete sections[sectionId]
    write({ ...state, sections })
  },

  toggleSection(sectionId: string): void {
    const state = getSnapshot()
    progressActions.setSection(sectionId, !state.sections[sectionId])
  },

  setModuleComplete(moduleId: string, sectionIds: string[], complete: boolean): void {
    const state = getSnapshot()
    const sections = { ...state.sections }
    const modules = { ...state.modules }

    for (const id of sectionIds) {
      if (complete) sections[id] = true
      else delete sections[id]
    }

    if (complete) modules[moduleId] = new Date().toISOString()
    else delete modules[moduleId]

    write({ sections, modules, lastVisited: state.lastVisited })
  },

  visit(moduleId: string, sectionId?: string): void {
    const state = getSnapshot()
    write({ ...state, lastVisited: { moduleId, sectionId } })
  },

  reset(): void {
    write({ sections: {}, modules: {} })
  },
}

export function moduleProgress(
  state: ProgressState,
  sectionIds: string[],
): { done: number; total: number; percent: number; complete: boolean } {
  const done = sectionIds.filter((id) => state.sections[id]).length
  const total = sectionIds.length
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    complete: total > 0 && done === total,
  }
}

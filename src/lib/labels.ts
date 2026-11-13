import type { LearningPath, Level } from '../data/schema'

export const levelLabel: Record<Level, string> = {
  introductory: 'Introductory',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export const pathLabel: Record<LearningPath, string> = {
  core: 'Core track',
  elective: 'Elective',
  all: 'All learning paths',
}

/** Official curriculum number from the module ID: M06 → 06. */
export function moduleNumber(moduleId: string): string {
  const digits = moduleId.replace(/\D/g, '')
  return (digits || '0').padStart(2, '0')
}

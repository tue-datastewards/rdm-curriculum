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

export function moduleNumber(index: number): string {
  return String(index + 1).padStart(2, '0')
}

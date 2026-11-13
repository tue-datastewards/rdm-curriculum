import { z } from 'zod'

/**
 * The YAML files in /data are the single source of truth. This schema is the
 * contract between the content, the site, the editor (Sveltia CMS) and the
 * validation script (`npm run check`).
 */

const idPatterns = {
  cilo: /^C\d{1,2}$/,
  module: /^M\d{2}$/,
  milo: /^M\d{2}\.[A-Z]$/,
}

const httpUrl = z
  .string()
  .refine((value) => /^https?:\/\/\S+$/.test(value), 'Must be an http(s) URL')

export const PHASES = ['preparatory', 'in-session'] as const
export const STATUSES = ['complete', 'migrated', 'draft'] as const
export const LEARNING_PATHS = ['core', 'elective', 'all'] as const
export const LEVELS = ['introductory', 'intermediate', 'advanced'] as const

export const CiloSchema = z.object({
  id: z.string().regex(idPatterns.cilo, 'CILO id must look like C1'),
  title: z.string().min(1),
  statement: z.string().min(1),
})

export const ResourceSchema = z.object({
  label: z.string().min(1),
  url: httpUrl.optional(),
  note: z.string().optional(),
})

export const TeachingSchema = z.object({
  teacher: z.string().default(''),
  learner: z.string().default(''),
})

export const MiloSchema = z.object({
  id: z.string().regex(idPatterns.milo, 'MILO id must look like M01.A'),
  statement: z.string().min(1),
  learnerTitle: z.string().default(''),
  learnerStatement: z.string().default(''),
  phase: z.enum(PHASES).default('in-session'),
  status: z.enum(STATUSES).default('complete'),
  published: z.boolean().default(false),
  cilos: z.array(z.string()).default([]),
  content: z.string().default(''),
  teaching: TeachingSchema.default({ teacher: '', learner: '' }),
  resources: z.array(ResourceSchema).default([]),
  assessment: z.string().default(''),
  notes: z.string().optional(),
})

export const ModuleSchema = z.object({
  id: z.string().regex(idPatterns.module, 'Module id must look like M01'),
  title: z.string().min(1),
  summary: z.string().default(''),
  description: z.string().default(''),
  duration: z.string().default(''),
  level: z.enum(LEVELS).default('introductory'),
  learningPath: z.enum(LEARNING_PATHS).default('core'),
  prerequisites: z.string().default(''),
  published: z.boolean().default(false),
  milos: z.array(MiloSchema).default([]),
})

export const CourseSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  tagline: z.string().default(''),
  audience: z.string().default(''),
  duration: z.string().default(''),
  contact: z.string().default(''),
  version: z.string().min(1),
  description: z.string().default(''),
})

export const CurriculumSchema = z.object({
  course: CourseSchema,
  cilos: z.array(CiloSchema),
  modules: z.array(ModuleSchema),
})

export type Cilo = z.infer<typeof CiloSchema>
export type Resource = z.infer<typeof ResourceSchema>
export type Teaching = z.infer<typeof TeachingSchema>
export type Milo = z.infer<typeof MiloSchema>
export type Module = z.infer<typeof ModuleSchema>
export type Course = z.infer<typeof CourseSchema>
export type Curriculum = z.infer<typeof CurriculumSchema>
export type Status = (typeof STATUSES)[number]
export type Phase = (typeof PHASES)[number]
export type LearningPath = (typeof LEARNING_PATHS)[number]
export type Level = (typeof LEVELS)[number]

export type Severity = 'error' | 'warning'

export type ValidationIssue = {
  severity: Severity
  code: string
  message: string
  where?: string
}

function duplicates<T>(items: T[], key: (item: T) => string): string[] {
  const seen = new Set<string>()
  const dupes = new Set<string>()
  for (const item of items) {
    const value = key(item)
    if (seen.has(value)) dupes.add(value)
    seen.add(value)
  }
  return [...dupes]
}

/** Components that are still empty for a MILO, in display order. */
export function missingComponents(milo: Milo): string[] {
  const missing: string[] = []
  if (!milo.content.trim()) missing.push('content')
  if (!milo.teaching.teacher.trim()) missing.push("teacher's activity")
  if (!milo.teaching.learner.trim()) missing.push("learner's activity")
  if (milo.resources.length === 0) missing.push('resources')
  if (!milo.assessment.trim()) missing.push('assessment')
  return missing
}

/**
 * Referential and editorial checks. Errors block the build; warnings are
 * intentionally allowed so that unfinished modules can be published as drafts.
 */
export function validateCurriculum(curriculum: Curriculum): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  const ciloIds = new Set(curriculum.cilos.map((cilo) => cilo.id))
  const miloEntries = curriculum.modules.flatMap((module) =>
    module.milos.map((milo) => ({ module, milo })),
  )

  for (const id of duplicates(curriculum.cilos, (cilo) => cilo.id)) {
    issues.push({
      severity: 'error',
      code: 'duplicate-cilo',
      message: `CILO id "${id}" is defined more than once.`,
      where: 'data/cilos',
    })
  }

  for (const id of duplicates(curriculum.modules, (module) => module.id)) {
    issues.push({
      severity: 'error',
      code: 'duplicate-module',
      message: `Module id "${id}" is defined more than once.`,
      where: 'data/modules',
    })
  }

  for (const id of duplicates(miloEntries, ({ milo }) => milo.id)) {
    issues.push({
      severity: 'error',
      code: 'duplicate-milo',
      message: `MILO id "${id}" is used more than once.`,
      where: 'data/modules',
    })
  }

  for (const { module, milo } of miloEntries) {
    if (!milo.id.startsWith(`${module.id}.`)) {
      issues.push({
        severity: 'error',
        code: 'milo-prefix',
        message: `MILO "${milo.id}" lives in module ${module.id}; its id should start with "${module.id}.".`,
        where: `${module.id} / ${milo.id}`,
      })
    }

    for (const ciloId of milo.cilos) {
      if (!ciloIds.has(ciloId)) {
        issues.push({
          severity: 'error',
          code: 'unknown-cilo',
          message: `MILO "${milo.id}" refers to CILO "${ciloId}", which does not exist.`,
          where: `${module.id} / ${milo.id}`,
        })
      }
    }

    if (milo.cilos.length === 0) {
      issues.push({
        severity: 'warning',
        code: 'unaligned-milo',
        message: `MILO "${milo.id}" is not linked to any CILO.`,
        where: `${module.id} / ${milo.id}`,
      })
    }

    const missing = missingComponents(milo)
    if (missing.length > 0) {
      issues.push({
        severity: 'warning',
        code: 'incomplete-milo',
        message: `MILO "${milo.id}" is missing: ${missing.join(', ')}.`,
        where: `${module.id} / ${milo.id}`,
      })
    }
  }

  for (const cilo of curriculum.cilos) {
    const served = miloEntries.some(({ milo }) => milo.cilos.includes(cilo.id))
    if (!served) {
      issues.push({
        severity: 'warning',
        code: 'uncovered-cilo',
        message: `CILO "${cilo.id} (${cilo.title})" is not addressed by any MILO yet.`,
        where: 'data/cilos',
      })
    }
  }

  for (const module of curriculum.modules) {
    if (module.milos.length === 0) {
      issues.push({
        severity: 'warning',
        code: 'empty-module',
        message: `Module "${module.id}" has no MILOs yet.`,
        where: module.id,
      })
    }
  }

  // Learner-facing checks: anything published must be complete enough to read.
  for (const module of curriculum.modules.filter((item) => item.published)) {
    if (!module.summary.trim()) {
      issues.push({
        severity: 'error',
        code: 'published-module-summary',
        message: `Published module "${module.id}" needs a summary for the learner view.`,
        where: module.id,
      })
    }
    if (!module.duration.trim()) {
      issues.push({
        severity: 'error',
        code: 'published-module-duration',
        message: `Published module "${module.id}" needs a duration for the learner view.`,
        where: module.id,
      })
    }
    if (!module.milos.some((milo) => milo.published)) {
      issues.push({
        severity: 'error',
        code: 'published-module-empty',
        message: `Published module "${module.id}" has no published MILOs.`,
        where: module.id,
      })
    }
  }

  for (const { module, milo } of miloEntries.filter(({ milo }) => milo.published)) {
    if (!milo.content.trim()) {
      issues.push({
        severity: 'error',
        code: 'published-milo-content',
        message: `MILO "${milo.id}" is published but has no content.`,
        where: `${module.id} / ${milo.id}`,
      })
    }
    if (milo.resources.length > 0 && milo.resources.every((resource) => !resource.url)) {
      issues.push({
        severity: 'warning',
        code: 'published-resources',
        message: `MILO "${milo.id}" only has resources without links; learners cannot open them.`,
        where: `${module.id} / ${milo.id}`,
      })
    }
  }

  const hasPublishedMilos = miloEntries.some(({ milo }) => milo.published)
  if (hasPublishedMilos) {
    for (const cilo of curriculum.cilos) {
      const served = miloEntries.some(
        ({ milo }) => milo.published && milo.cilos.includes(cilo.id),
      )
      if (!served) {
        issues.push({
          severity: 'warning',
          code: 'learner-uncovered-cilo',
          message: `CILO "${cilo.id}" is not addressed by any published MILO.`,
          where: 'data/cilos',
        })
      }
    }
  }

  return issues
}

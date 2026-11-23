import { useEffect, useId, useRef, useState } from 'react'
import type { MatchActivity as MatchActivityData, MatchRound } from '../data/schema'
import { cn } from '../lib/cn'
import { progressActions } from '../lib/progress'

type Placement = number | null

function indices(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index)
}

function shuffled<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const current = result[i]
    result[i] = result[j]
    result[j] = current
  }
  return result
}

function roundLabel(round: MatchRound, index: number): string {
  return round.title || `Round ${index + 1}`
}

function sentence(value: string): string {
  const trimmed = value.trim()
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

function RoundBoard({
  round,
  roundIndex,
  totalRounds,
  solved,
  focusOnMount,
  onSolved,
  onNext,
  hasNext,
  announce,
}: {
  round: MatchRound
  roundIndex: number
  totalRounds: number
  solved: boolean
  focusOnMount: boolean
  onSolved: () => void
  onNext: () => void
  hasNext: boolean
  announce: (message: string) => void
}) {
  const [placements, setPlacements] = useState<Placement[]>(() =>
    solved ? indices(round.pairs.length) : round.pairs.map(() => null),
  )
  const [order] = useState<number[]>(() =>
    solved ? indices(round.pairs.length) : shuffled(indices(round.pairs.length)),
  )
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(solved)
  const [results, setResults] = useState<boolean[] | null>(() =>
    solved ? round.pairs.map(() => true) : null,
  )
  const [overProblem, setOverProblem] = useState<number | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (focusOnMount) heading.current?.focus()
  }, [focusOnMount])

  const remaining = order.filter((solution) => !placements.includes(solution))
  const isSolved = checked && results !== null && results.every(Boolean)
  const score = results?.filter(Boolean).length ?? 0

  function place(problemIndex: number, solutionIndex: number): void {
    if (checked) return
    setPlacements((current) => {
      const next = [...current]
      for (let index = 0; index < next.length; index += 1) {
        if (next[index] === solutionIndex) next[index] = null
      }
      next[problemIndex] = solutionIndex
      return next
    })
    setSelected(null)
    announce(
      `Placed: ${sentence(round.pairs[solutionIndex].solution)} On problem: ${sentence(
        round.pairs[problemIndex].problem,
      )}`,
    )
  }

  function remove(problemIndex: number): void {
    if (checked) return
    const solutionIndex = placements[problemIndex]
    setPlacements((current) => {
      const next = [...current]
      next[problemIndex] = null
      return next
    })
    if (solutionIndex !== null) {
      announce(`Returned to the practices: ${sentence(round.pairs[solutionIndex].solution)}`)
    }
  }

  function select(solutionIndex: number): void {
    if (checked) return
    const next = selected === solutionIndex ? null : solutionIndex
    setSelected(next)
    announce(
      next === null
        ? 'Selection cleared.'
        : `Selected: ${sentence(round.pairs[solutionIndex].solution)} Now choose a problem.`,
    )
  }

  function check(): void {
    if (placements.some((placement) => placement === null)) return
    const nextResults = placements.map(
      (placement, problemIndex) => placement === problemIndex,
    )
    setResults(nextResults)
    setChecked(true)
    setSelected(null)
    const correct = nextResults.filter(Boolean).length
    if (correct === round.pairs.length) {
      announce(`Round ${roundIndex + 1} complete. All ${correct} matches are correct.`)
      onSolved()
    } else {
      announce(`${correct} of ${round.pairs.length} correct. Read the feedback or try again.`)
    }
  }

  function retry(): void {
    setPlacements((current) =>
      current.map((placement, problemIndex) =>
        results?.[problemIndex] ? placement : null,
      ),
    )
    setResults(null)
    setChecked(false)
    setSelected(null)
    announce('Incorrect matches were returned to the practices. Correct matches stay in place.')
  }

  const primaryLabel = !checked
    ? 'Check answers'
    : isSolved
      ? hasNext
        ? 'Next round →'
        : 'Round complete'
      : 'Try again'

  const primaryDisabled = (!checked && remaining.length > 0) || (isSolved && !hasNext)

  function primaryAction(): void {
    if (!checked) check()
    else if (isSolved && hasNext) onNext()
    else if (!isSolved) retry()
  }

  return (
    <div
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || selected === null) return
        event.stopPropagation()
        setSelected(null)
        announce('Selection cleared.')
      }}
    >
      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 ref={heading} tabIndex={-1} className="text-sm font-bold">
          Round {roundIndex + 1} of {totalRounds}
          {round.title && (
            <span className="font-normal text-muted"> · {round.title}</span>
          )}
        </h4>
        <p className="text-xs text-muted">
          {remaining.length} of {round.pairs.length} practices left
        </p>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className="lg:order-2">
          <p className="rdm-label text-muted">Practices</p>
          <ul className="mt-3 space-y-2">
            {remaining.map((solutionIndex) => (
              <li key={solutionIndex}>
                <button
                  type="button"
                  draggable={!checked}
                  aria-pressed={selected === solutionIndex}
                  onClick={() => select(solutionIndex)}
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', String(solutionIndex))
                    event.dataTransfer.effectAllowed = 'move'
                    setSelected(null)
                  }}
                  onDragEnd={() => setOverProblem(null)}
                  className={cn(
                    'w-full border px-3 py-2.5 text-left text-sm leading-snug transition select-none',
                    selected === solutionIndex
                      ? 'border-brand bg-brand text-paper'
                      : 'border-rule bg-paper text-ink hover:border-brand hover:bg-wash',
                    checked
                      ? 'cursor-default opacity-70'
                      : 'cursor-grab active:cursor-grabbing',
                  )}
                >
                  {round.pairs[solutionIndex].solution}
                </button>
              </li>
            ))}
            {remaining.length === 0 && (
              <li className="border border-dashed border-rule px-3 py-3 text-sm text-muted">
                All practices are placed.
              </li>
            )}
          </ul>
        </div>

        <div className="lg:order-1">
          <p className="rdm-label text-muted">Data problems</p>
          <ul className="mt-3 space-y-2">
            {round.pairs.map((pair, problemIndex) => {
              const placement = placements[problemIndex]
              const result = results?.[problemIndex]
              const slotLabel =
                placement === null
                  ? 'Empty drop zone.'
                  : `Contains: ${sentence(round.pairs[placement].solution)}`

              return (
                <li key={problemIndex}>
                  <div
                    onClick={() => {
                      if (checked) return
                      if (selected !== null) place(problemIndex, selected)
                      else if (placement === null) {
                        announce('Choose a practice first, then choose this problem.')
                      }
                    }}
                    onDragOver={(event) => {
                      if (checked) return
                      event.preventDefault()
                      event.dataTransfer.dropEffect = 'move'
                      setOverProblem(problemIndex)
                    }}
                    onDragLeave={(event) => {
                      const next = event.relatedTarget as Node | null
                      if (next && event.currentTarget.contains(next)) return
                      setOverProblem((current) =>
                        current === problemIndex ? null : current,
                      )
                    }}
                    onDrop={(event) => {
                      event.preventDefault()
                      setOverProblem(null)
                      if (checked) return
                      const solutionIndex = Number(
                        event.dataTransfer.getData('text/plain'),
                      )
                      if (
                        Number.isInteger(solutionIndex) &&
                        solutionIndex >= 0 &&
                        solutionIndex < round.pairs.length
                      ) {
                        place(problemIndex, solutionIndex)
                      }
                    }}
                    className={cn(
                      'border p-4 transition',
                      checked && result === true
                        ? 'border-success'
                        : checked && result === false
                          ? 'border-danger'
                          : 'border-rule',
                      !checked && 'cursor-pointer hover:border-brand',
                      overProblem === problemIndex && 'border-brand bg-wash',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 font-mono text-xs font-bold text-brand">
                        {String(problemIndex + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm font-medium leading-snug">{pair.problem}</p>
                    </div>

                    <button
                      type="button"
                      aria-label={`Problem ${problemIndex + 1}: ${sentence(
                        pair.problem,
                      )} ${
                        selected !== null
                          ? `Selected practice: ${sentence(round.pairs[selected].solution)} `
                          : ''
                      }${slotLabel}`}
                      className={cn(
                        'mt-3 w-full border border-dashed px-3 py-2.5 text-left text-sm leading-snug transition',
                        placement === null
                          ? 'border-rule text-muted'
                          : 'border-brand bg-wash font-bold text-brand',
                        selected !== null &&
                          placement === null &&
                          'border-brand bg-wash-strong text-brand',
                        overProblem === problemIndex && 'border-brand bg-wash-strong',
                        checked && result === true && 'border-success bg-paper',
                        checked && result === false && 'border-danger bg-paper',
                        !checked && 'cursor-pointer',
                        checked && 'cursor-default',
                      )}
                    >
                      {placement === null
                        ? 'Drop a practice here'
                        : round.pairs[placement].solution}
                    </button>

                    {placement !== null && !checked && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          remove(problemIndex)
                        }}
                        className="mt-2 cursor-pointer text-[11px] font-bold uppercase tracking-[0.06em] text-muted underline decoration-1 underline-offset-2 hover:text-brand"
                      >
                        Remove
                      </button>
                    )}

                    {checked && result !== undefined && (
                      <div className="mt-3 border-t border-rule pt-4">
                        <p
                          className={cn(
                            'text-sm font-bold',
                            result ? 'text-success' : 'text-danger',
                          )}
                        >
                          {result ? '✓ Correct' : '✗ Not this one'}
                        </p>
                        {!result && (
                          <p className="mt-1.5 text-sm">
                            <span className="font-bold">Correct practice:</span>{' '}
                            {round.pairs[problemIndex].solution}
                          </p>
                        )}
                        {pair.explanation && (
                          <p className="mt-2 max-w-prose text-base leading-relaxed text-muted">
                            {pair.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-rule pt-4">
        <button
          type="button"
          onClick={primaryAction}
          disabled={primaryDisabled}
          className="btn btn-primary"
        >
          {primaryLabel}
        </button>
        {checked && results && (
          <p className="text-sm">
            <span className="font-bold">{score}</span> of {round.pairs.length} correct.
          </p>
        )}
        {!checked && remaining.length > 0 && (
          <p className="text-xs text-muted">
            Place all {round.pairs.length} practices to check your answers.
          </p>
        )}
      </div>
    </div>
  )
}

export function MatchActivity({
  activity,
  miloId,
}: {
  activity: MatchActivityData
  miloId: string
}) {
  const [roundIndex, setRoundIndex] = useState(0)
  const [solved, setSolved] = useState<boolean[]>(() => activity.rounds.map(() => false))
  const [attempt, setAttempt] = useState(0)
  const [focusRound, setFocusRound] = useState(false)
  const [message, setMessage] = useState('')
  const headingId = useId()
  const instructionsId = useId()

  const pairCount = activity.rounds.reduce((total, round) => total + round.pairs.length, 0)
  const solvedCount = solved.filter(Boolean).length
  const allSolved = solved.length > 0 && solved.every(Boolean)
  const current = activity.rounds[roundIndex] ?? activity.rounds[0]
  const title = activity.title || 'Match the problem to the practice'

  useEffect(() => {
    if (!allSolved) return
    progressActions.setSection(miloId, true)
    setMessage(`Activity complete. All ${pairCount} pairs matched. This section is marked done.`)
  }, [allSolved, pairCount, miloId])

  function goToRound(index: number): void {
    setRoundIndex(index)
    setFocusRound(true)
  }

  function handleSolved(index: number): void {
    if (solved[index]) return
    const next = [...solved]
    next[index] = true
    setSolved(next)
    const complete = next.filter(Boolean).length
    setMessage(
      `Round ${index + 1} complete. ${complete} of ${next.length} rounds complete.`,
    )
  }

  function restart(): void {
    setSolved(activity.rounds.map(() => false))
    setAttempt((value) => value + 1)
    setRoundIndex(0)
    setFocusRound(true)
    setMessage('Activity restarted.')
  }

  return (
    <section
      className="mt-8 max-w-4xl"
      aria-labelledby={headingId}
      aria-describedby={activity.instructions ? instructionsId : undefined}
    >
      <div className="print-hide border border-rule">
        <header className="border-b border-rule bg-wash p-5 sm:p-6">
          <p className="rdm-label text-brand">Activity</p>
          <h3 id={headingId} className="mt-2 text-xl font-bold leading-tight tracking-tight">
            {title}
          </h3>
          {activity.instructions && (
            <p id={instructionsId} className="mt-2 text-sm leading-relaxed text-muted">
              {activity.instructions}
            </p>
          )}
        </header>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            {activity.rounds.map((round, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToRound(index)}
                aria-current={index === roundIndex ? 'step' : undefined}
                aria-label={`Round ${index + 1}: ${roundLabel(round, index)}${
                  solved[index] ? ' (complete)' : ''
                }`}
                className={cn(
                  'cursor-pointer border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] transition',
                  index === roundIndex
                    ? 'border-brand bg-brand text-paper'
                    : 'border-rule text-muted hover:border-brand hover:text-brand',
                )}
              >
                Round {index + 1}
                {solved[index] && <span aria-hidden="true"> ✓</span>}
              </button>
            ))}
            <span className="w-full text-xs text-muted sm:ml-auto sm:w-auto">
              {solvedCount} of {solved.length} rounds complete
            </span>
          </div>

          <RoundBoard
            key={`${roundIndex}-${attempt}`}
            round={current}
            roundIndex={roundIndex}
            totalRounds={activity.rounds.length}
            solved={solved[roundIndex] ?? false}
            focusOnMount={focusRound}
            onSolved={() => handleSolved(roundIndex)}
            onNext={() => {
              if (roundIndex < activity.rounds.length - 1) goToRound(roundIndex + 1)
            }}
            hasNext={roundIndex < activity.rounds.length - 1}
            announce={setMessage}
          />

          {allSolved && (
            <div className="mt-6 border border-brand bg-wash p-5">
              <p className="rdm-label text-brand">Activity complete</p>
              <p className="mt-2 text-sm leading-relaxed">
                You matched all {pairCount} pairs. This section is marked done.
              </p>
              <button type="button" onClick={restart} className="btn btn-outline mt-4">
                Start over
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {message}
      </p>
      <p className="hidden text-sm text-muted print:block">
        This matching activity is interactive. Open the module online to play it.
      </p>
    </section>
  )
}

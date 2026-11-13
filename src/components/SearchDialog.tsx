import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchCurriculum } from '../lib/search'
import type { SearchHit } from '../lib/search'
import { BrandIcon } from './BrandIcon'

export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const hits = searchCurriculum(query)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      setQuery('')
      setActive(0)
      dialog.showModal()
      requestAnimationFrame(() => inputRef.current?.focus())
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    document
      .querySelector(`[data-search-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function activate(hit: SearchHit | undefined) {
    if (!hit) return
    onClose()

    if (hit.kind === 'Resource' && hit.href.startsWith('http')) {
      window.open(hit.href, '_blank', 'noopener,noreferrer')
      return
    }
    navigate(hit.href)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((index) => Math.min(index + 1, Math.max(hits.length - 1, 0)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      activate(hits[active])
    }
  }

  const truncated = query.trim().length > 0 && query.trim().length < 2

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      aria-label="Search the course"
      className="search-dialog w-[min(42rem,calc(100vw-2rem))] border border-rule bg-paper p-0 text-ink"
    >
      <div className="flex items-center gap-3 border-b border-rule px-4 py-3">
        <BrandIcon name="icon-magnifier-chart" className="h-5 w-5 text-muted" />
        <input
          ref={inputRef}
          id="course-search"
          name="q"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search modules, sections and resources"
          aria-label="Search query"
          role="combobox"
          aria-expanded="true"
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={hits[active] ? `search-hit-${active}` : undefined}
          className="w-full bg-transparent py-1 text-base outline-none placeholder:text-muted"
        />
        <button
          type="button"
          onClick={onClose}
          className="rdm-label shrink-0 border border-rule px-2 py-1 text-muted hover:border-brand hover:text-brand"
        >
          Esc
        </button>
      </div>

      <div
        id="search-results"
        role="listbox"
        aria-label="Search results"
        className="max-h-[60vh] overflow-y-auto p-2"
      >
        {truncated ? (
          <p className="px-3 py-6 text-sm text-muted">
            Type at least two characters to search.
          </p>
        ) : hits.length === 0 ? (
          <p className="px-3 py-6 text-sm text-muted">
            {query.trim()
              ? `No results for “${query.trim()}”.`
              : 'Search the published modules and sections.'}
          </p>
        ) : (
          hits.map((hit, index) => (
            <button
              key={hit.id}
              id={`search-hit-${index}`}
              data-search-index={index}
              type="button"
              role="option"
              aria-selected={index === active}
              onMouseEnter={() => setActive(index)}
              onClick={() => activate(hit)}
              className={`flex w-full flex-col gap-1 border-l-2 border-b border-rule px-3 py-2.5 text-left transition last:border-b-0 ${
                index === active
                  ? 'border-l-brand bg-wash'
                  : 'border-l-transparent hover:bg-wash'
              }`}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-ink">{hit.title}</span>
                <span className="rdm-label shrink-0 text-muted">
                  {hit.kind === 'Resource' && hit.href.startsWith('http') ? 'Resource ↗' : hit.kind}
                </span>
              </span>
              <span className="text-xs text-muted">{hit.context}</span>
            </button>
          ))
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-rule px-4 py-2 text-[11px] text-muted">
        <span>↑↓ to navigate</span>
        <span>Enter to open</span>
        <span>Esc to close</span>
      </div>
    </dialog>
  )
}

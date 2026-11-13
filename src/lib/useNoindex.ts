import { useEffect } from 'react'

/**
 * Adds a page-level `noindex` while a view is mounted. Used for the staff
 * views, which are unlinked from the learner navigation and do not belong in
 * search results. A static site cannot enforce access control; this only keeps
 * well-behaved crawlers out.
 */
export function useNoindex(): void {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.append(meta)

    return () => meta.remove()
  }, [])
}

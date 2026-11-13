export type BrandIconName =
  | 'icon-document-bars'
  | 'icon-target-chart'
  | 'icon-laptop-idea-panel'
  | 'icon-clipboard-growth'
  | 'icon-binary-document'
  | 'icon-magnifier-chart'
  | 'icon-laptop-globe'
  | 'icon-funnel-chart'
  | 'icon-database-pie'

/**
 * Thin-line icons from the TU/e "This is RDM" brand kit. The sprite contains
 * only the symbols this site uses; `currentColor` lets them inherit the ink or
 * purple of their context.
 */
export function BrandIcon({
  name,
  className = 'h-6 w-6',
}: {
  name: BrandIconName
  className?: string
}) {
  return (
    <svg aria-hidden="true" className={className}>
      <use href={`${import.meta.env.BASE_URL}brand/icons.svg#${name}`} />
    </svg>
  )
}

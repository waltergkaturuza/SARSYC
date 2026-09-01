import { ReactNode } from 'react'

type PageHeroProps = {
  title: ReactNode
  subtitle?: ReactNode
  children?: ReactNode
  /** Use left-aligned content (e.g. detail pages with back links) */
  align?: 'center' | 'left'
  className?: string
}

/**
 * Shared page title banner — primary blue gradient, compact padding.
 */
export default function PageHero({
  title,
  subtitle,
  children,
  align = 'center',
  className = '',
}: PageHeroProps) {
  return (
    <section className={`page-hero ${className}`.trim()}>
      <div className="container-custom">
        <div
          className={`max-w-4xl ${align === 'center' ? 'mx-auto text-center' : 'text-left'}`}
        >
          <h1 className="page-hero-title">{title}</h1>
          {subtitle ? <p className="page-hero-subtitle">{subtitle}</p> : null}
          {children}
        </div>
      </div>
    </section>
  )
}

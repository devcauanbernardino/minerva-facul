import { Link } from 'react-router-dom'

const MARK_SRC = '/logo-minerva-mark.png'
const MARK_TRANSPARENT_SRC = '/logo-minerva-mark-transparent.png'

type MinervaLogoProps = {
  variant?: 'icon' | 'sm' | 'md' | 'lg'
  className?: string
  linkToHome?: boolean
  /** Em fundos escuros (hero, aside do login) */
  transparent?: boolean
  showWordmark?: boolean
}

const sizeClasses = {
  icon: 'h-9 w-9',
  sm: 'h-12 w-12',
  md: 'h-20 w-20',
  lg: 'h-28 w-28',
}

export function MinervaLogo({
  variant = 'md',
  className = '',
  linkToHome = false,
  transparent = false,
  showWordmark = false,
}: MinervaLogoProps) {
  const src = transparent ? MARK_TRANSPARENT_SRC : MARK_SRC

  const content = (
    <span className={`inline-flex items-center gap-4 ${className}`}>
      <img
        src={src}
        alt=""
        aria-hidden
        className={`shrink-0 object-contain ${sizeClasses[variant]}`}
        draggable={false}
      />
      {showWordmark ? (
        <span className="flex flex-col gap-1 leading-none">
          <span className="font-display text-lg font-bold tracking-wide text-primary">Minerva</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-minerva-dourado">
            Gestão Acadêmica
          </span>
        </span>
      ) : null}
    </span>
  )

  if (linkToHome) {
    return (
      <Link to="/" className="inline-flex shrink-0 no-underline hover:no-underline" aria-label="Minerva — Início">
        {content}
      </Link>
    )
  }

  return content
}

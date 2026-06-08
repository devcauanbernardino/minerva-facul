import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type BadgeSituacaoProps = {
  situacao: string
  className?: string
}

const estilos: Record<string, string> = {
  ATIVA: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  CURSANDO: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  DISPONIVEL: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
  CONCLUIDA: 'bg-sky-100 text-sky-800 hover:bg-sky-100',
  APROVADA: 'bg-sky-100 text-sky-800 hover:bg-sky-100',
  REPROVADA: 'bg-red-100 text-red-800 hover:bg-red-100',
  TRANCADA: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  CANCELADA: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-100',
}

const labels: Record<string, string> = {
  ATIVA: 'Ativa',
  CURSANDO: 'Cursando',
  DISPONIVEL: 'Disponível',
  CONCLUIDA: 'Concluída',
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
  TRANCADA: 'Trancada',
  CANCELADA: 'Cancelada',
}

export function BadgeSituacao({ situacao, className = '' }: BadgeSituacaoProps) {
  const chave = situacao.trim().toUpperCase()
  const estilo =
    estilos[chave] ?? 'bg-muted text-muted-foreground hover:bg-muted'
  const label = labels[chave] ?? situacao

  return (
    <Badge variant="secondary" className={cn('font-semibold', estilo, className)}>
      {label}
    </Badge>
  )
}

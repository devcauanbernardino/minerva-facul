import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type StatCardProps = {
  titulo: string
  valor: string | number
  descricao?: string
  destaque?: boolean
  icone?: React.ReactNode
}

export function StatCard({ titulo, valor, descricao, destaque, icone }: StatCardProps) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
        destaque
          ? 'border-primary/20 bg-gradient-to-br from-minerva-vinho via-primary to-primary/85 text-primary-foreground ring-primary/20 hover:shadow-primary/25'
          : 'hover:ring-minerva-dourado/40 hover:shadow-primary/10'
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-minerva-dourado to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          destaque && 'opacity-60'
        )}
        aria-hidden
      />
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-wider',
              destaque ? 'text-primary-foreground/80' : 'text-muted-foreground'
            )}
          >
            {titulo}
          </p>
          {icone ? (
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                destaque
                  ? 'bg-minerva-marmore/15 text-minerva-dourado-claro'
                  : 'bg-minerva-dourado/10 text-minerva-dourado'
              )}
            >
              {icone}
            </span>
          ) : null}
        </div>
        <p
          className={cn(
            'font-display text-2xl font-bold',
            !destaque && 'text-foreground'
          )}
        >
          {valor}
        </p>
        {descricao ? (
          <p
            className={cn(
              'text-xs',
              destaque ? 'text-primary-foreground/75' : 'text-muted-foreground'
            )}
          >
            {descricao}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

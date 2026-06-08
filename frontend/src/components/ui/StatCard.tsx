import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type StatCardProps = {
  titulo: string
  valor: string | number
  descricao?: string
  destaque?: boolean
}

export function StatCard({ titulo, valor, descricao, destaque }: StatCardProps) {
  return (
    <Card
      className={cn(
        destaque &&
          'border-primary/20 bg-gradient-to-br from-primary via-primary/95 to-primary/85 text-primary-foreground ring-primary/20'
      )}
    >
      <CardContent className="space-y-2">
        <p
          className={cn(
            'text-xs font-semibold uppercase tracking-wider',
            destaque ? 'text-primary-foreground/80' : 'text-muted-foreground'
          )}
        >
          {titulo}
        </p>
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

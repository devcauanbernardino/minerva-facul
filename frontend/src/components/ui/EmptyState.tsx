import { Card, CardContent } from '@/components/ui/card'

type EmptyStateProps = {
  titulo: string
  descricao: string
  icone?: React.ReactNode
}

export function EmptyState({ titulo, descricao, icone }: EmptyStateProps) {
  return (
    <Card className="border-dashed bg-card/60 px-8 py-14 shadow-none">
      <CardContent className="flex flex-col items-center justify-center px-0 text-center">
        {icone ? (
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-primary">
            {icone}
          </div>
        ) : null}
        <h3 className="font-display text-lg font-semibold">{titulo}</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{descricao}</p>
      </CardContent>
    </Card>
  )
}

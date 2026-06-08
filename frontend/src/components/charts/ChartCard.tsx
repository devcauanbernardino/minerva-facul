import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ChartCardProps = {
  titulo: string
  descricao?: string
  children: React.ReactNode
  className?: string
}

export function ChartCard({ titulo, descricao, children, className = '' }: ChartCardProps) {
  return (
    <Card className={cn('gap-0 p-0', className)}>
      <CardHeader className="gap-2 border-b px-6 pb-5 pt-6">
        <CardTitle className="font-display text-base">{titulo}</CardTitle>
        {descricao ? <CardDescription>{descricao}</CardDescription> : null}
      </CardHeader>
      <CardContent className="px-6 py-6">{children}</CardContent>
    </Card>
  )
}

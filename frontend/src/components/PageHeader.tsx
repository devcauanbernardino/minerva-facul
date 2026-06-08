import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type PageHeaderProps = {
  titulo: string
  subtitulo?: string
  acao?: React.ReactNode
}

export function PageHeader({ titulo, subtitulo, acao }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-minerva-dourado">
          Minerva
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {titulo}
        </h1>
        {subtitulo ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {subtitulo}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {acao}
        <Button variant="outline" size="sm" asChild>
          <Link to="/" className="no-underline hover:no-underline">
            ← Início
          </Link>
        </Button>
      </div>
      <Separator className="basis-full" />
    </div>
  )
}

export function AlertaErro({ mensagem }: { mensagem: string }) {
  return (
    <Alert
      variant="destructive"
      className="mb-6 border-destructive/30 bg-destructive/5"
      role="alert"
    >
      <AlertCircle />
      <AlertDescription className="text-destructive">{mensagem}</AlertDescription>
    </Alert>
  )
}

export function AlertaSucesso({ mensagem }: { mensagem: string }) {
  return (
    <Alert
      className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-900"
      role="status"
    >
      <CheckCircle2 className="text-emerald-600" />
      <AlertDescription className="text-emerald-900">{mensagem}</AlertDescription>
    </Alert>
  )
}

export function AlertaInfo({ mensagem }: { mensagem: string }) {
  return (
    <Alert
      className={cn(
        'mb-6 border-minerva-dourado/30 bg-minerva-dourado/10 text-foreground'
      )}
      role="status"
    >
      <Info className="text-minerva-dourado" />
      <AlertDescription>{mensagem}</AlertDescription>
    </Alert>
  )
}

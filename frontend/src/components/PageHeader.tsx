import { Link } from 'react-router-dom'

type PageHeaderProps = {
  titulo: string
  subtitulo?: string
}

export function PageHeader({ titulo, subtitulo }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-minerva-cinza-escuro">
          {titulo}
        </h1>
        {subtitulo ? (
          <p className="text-sm text-minerva-cinza-escuro/70">{subtitulo}</p>
        ) : null}
      </div>
      <Link
        to="/"
        className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        ← Início
      </Link>
    </div>
  )
}

export function AlertaErro({ mensagem }: { mensagem: string }) {
  return (
    <div
      className="mb-6 rounded-lg border border-primary/25 bg-primary/[0.06] px-4 py-3 text-sm text-minerva-cinza-escuro"
      role="alert"
    >
      {mensagem}
    </div>
  )
}

export function AlertaSucesso({ mensagem }: { mensagem: string }) {
  return (
    <div
      className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
      role="status"
    >
      {mensagem}
    </div>
  )
}

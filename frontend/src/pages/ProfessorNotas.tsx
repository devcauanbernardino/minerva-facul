import { PageHeader } from '../components/PageHeader'
import { getUsuario } from '../utils/auth'

export function ProfessorNotas() {
  const usuario = getUsuario()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageHeader
        titulo="Lançamento de notas"
        subtitulo="Notas e frequência das turmas (RF07 — integração em breve)."
      />
      <div className="rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore p-6 shadow-sm">
        <p className="text-sm text-minerva-cinza-escuro/80">
          Professor <strong>{usuario?.nome}</strong>, aqui você lançará nota e frequência via{' '}
          <code className="text-xs">PATCH /matriculas/&#123;id&#125;/notas</code> quando o backend
          estiver pronto.
        </p>
      </div>
    </div>
  )
}

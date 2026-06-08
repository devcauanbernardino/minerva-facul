import { useEffect, useMemo, useState } from 'react'
import { BookOpenIcon } from '@heroicons/react/24/outline'
import { AlertaErro, PageHeader } from '../components/PageHeader'
import { BadgeSituacao } from '../components/ui/BadgeSituacao'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { PageContainer } from '../components/ui/PageContainer'
import { StatCard } from '../components/ui/StatCard'
import { api } from '../services/api'
import type { Historico } from '../types/academico'
import { getUsuario } from '../utils/auth'
import {
  calcularMediaNotas,
  contarPorSituacao,
  formatarFrequencia,
  formatarNota,
  labelSituacaoHistorico,
} from '../utils/academico'
import { mensagemErroApi } from '../utils/apiError'
import { SituacaoPieChart } from '../components/charts/SituacaoPieChart'
import { NotasFrequenciaChart } from '../components/charts/NotasFrequenciaChart'
import { DistribuicaoNotasChart } from '../components/charts/DistribuicaoNotasChart'
import { FrequenciaBarChart } from '../components/charts/FrequenciaBarChart'
import { MediaBarChart } from '../components/charts/MediaBarChart'
import { agruparContagem, agruparNotasPorFaixa, encurtarNome } from '../utils/charts'

export function AlunoHistorico() {
  const usuario = getUsuario()
  const [historico, setHistorico] = useState<Historico | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!usuario?.email) {
      setCarregando(false)
      return
    }

    let ativo = true
    api
      .get<Historico>('/alunos/historico', { params: { email: usuario.email } })
      .then((res) => {
        if (!ativo) return
        setHistorico(res.data)
        setErro(null)
      })
      .catch((e) => {
        if (!ativo) return
        setErro(mensagemErroApi(e, 'Não foi possível carregar o histórico. Faça login novamente.'))
        setHistorico(null)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [usuario?.email])

  const stats = useMemo(() => {
    if (!historico) return null
    const media = calcularMediaNotas(historico.disciplinas)
    return {
      total: historico.disciplinas.length,
      aprovadas: contarPorSituacao(historico.disciplinas, ['CONCLUIDA']),
      reprovadas: contarPorSituacao(historico.disciplinas, ['REPROVADA']),
      media: media != null ? media.toFixed(1) : '—',
    }
  }, [historico])

  const chartData = useMemo(() => {
    if (!historico) return null
    return {
      situacoes: agruparContagem(historico.disciplinas.map((d) => d.situacao)),
      notas: historico.disciplinas.map((d) => ({
        nome: encurtarNome(d.materiaNome),
        nota: d.nota,
        frequencia: d.frequencia,
      })),
      faixasNota: agruparNotasPorFaixa(historico.disciplinas.map((d) => d.nota)),
      frequencias: historico.disciplinas
        .filter((d) => d.frequencia != null)
        .map((d) => ({ name: encurtarNome(d.materiaNome), value: d.frequencia! })),
      mediaPorDisciplina: historico.disciplinas
        .filter((d) => d.nota != null)
        .map((d) => ({ name: encurtarNome(d.materiaNome), value: d.nota! })),
    }
  }, [historico])

  if (carregando) {
    return (
      <PageContainer>
        <PageHeader titulo="Histórico escolar" subtitulo="Disciplinas já concluídas." />
        <LoadingState mensagem="Carregando histórico…" />
      </PageContainer>
    )
  }

  return (
    <PageContainer largura="xl">
      <PageHeader
        titulo="Histórico escolar"
        subtitulo="Registro de disciplinas concluídas, reprovadas ou trancadas ao longo do curso."
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}

      {historico ? (
        <div className="space-y-8">
          <div className="minerva-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-minerva-dourado">
                  Registro acadêmico
                </p>
                <h2 className="mt-1 font-display text-xl font-bold">{historico.nome}</h2>
                <p className="mt-2 text-sm text-minerva-cinza-escuro/75">
                  {historico.cursoNome}
                  {historico.bolsa ? ' · Bolsista' : ''}
                </p>
              </div>
              <div className="rounded-lg bg-minerva-cinza-claro px-4 py-2 text-center">
                <p className="text-xs text-minerva-cinza-escuro/60">Disciplinas no histórico</p>
                <p className="font-display text-2xl font-bold text-primary">{stats?.total ?? 0}</p>
              </div>
            </div>
          </div>

          {stats ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard titulo="Total" valor={stats.total} descricao="Disciplinas registradas" />
              <StatCard titulo="Aprovadas" valor={stats.aprovadas} descricao="Concluídas" destaque />
              <StatCard titulo="Reprovadas" valor={stats.reprovadas} descricao="Reprovações" />
              <StatCard titulo="Média" valor={stats.media} descricao="Notas no histórico" />
            </div>
          ) : null}

          {chartData && historico.disciplinas.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              <SituacaoPieChart
                titulo="Resultado das disciplinas"
                descricao="Aprovadas, reprovadas e trancadas."
                dados={chartData.situacoes}
              />
              <NotasFrequenciaChart
                titulo="Notas finais"
                descricao="Desempenho registrado no histórico."
                dados={chartData.notas}
              />
              <DistribuicaoNotasChart
                titulo="Distribuição das notas"
                descricao="Faixas de desempenho no histórico."
                dados={chartData.faixasNota}
              />
              <FrequenciaBarChart
                titulo="Frequência final"
                descricao="Presença registrada por disciplina (%)."
                dados={chartData.frequencias}
              />
              <MediaBarChart
                titulo="Notas por disciplina"
                descricao="Comparativo de notas finais (0–10)."
                dados={chartData.mediaPorDisciplina}
              />
            </div>
          ) : null}

          {historico.disciplinas.length === 0 ? (
            <EmptyState
              titulo="Histórico vazio"
              descricao="Quando você concluir, reprovar ou trancar disciplinas, elas aparecerão aqui automaticamente."
              icone={<BookOpenIcon className="h-7 w-7" />}
            />
          ) : (
            <div className="minerva-table-wrap overflow-x-auto">
              <table className="minerva-table">
                <thead>
                  <tr>
                    <th>Disciplina</th>
                    <th>Situação</th>
                    <th>Nota final</th>
                    <th>Frequência</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.disciplinas.map((d) => (
                    <tr key={d.materiaId}>
                      <td>
                        <p className="font-medium">{d.materiaNome}</p>
                        <p className="text-xs text-minerva-cinza-escuro/45">ID {d.materiaId}</p>
                      </td>
                      <td>
                        <BadgeSituacao
                          situacao={
                            d.situacao === 'CONCLUIDA' ? 'APROVADA' : d.situacao
                          }
                        />
                        <span className="sr-only">{labelSituacaoHistorico(d.situacao)}</span>
                      </td>
                      <td>
                        <span className="font-semibold">{formatarNota(d.nota)}</span>
                      </td>
                      <td>{formatarFrequencia(d.frequencia)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </PageContainer>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Award, BookOpen, ScrollText } from 'lucide-react'
import { AlertaErro, PageHeader } from '../components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
          <Card>
            <CardContent className="flex flex-wrap items-start justify-between gap-4 p-0">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ScrollText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-minerva-dourado">
                    Registro acadêmico
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold">{historico.nome}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <p className="text-sm text-muted-foreground">{historico.cursoNome}</p>
                    {historico.bolsa ? (
                      <Badge className="gap-1 bg-minerva-dourado/15 text-yellow-800">
                        <Award className="h-3 w-3" />
                        Bolsista
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-muted px-4 py-2 text-center">
                <p className="text-xs text-muted-foreground">Disciplinas no histórico</p>
                <p className="font-display text-2xl font-bold text-primary">{stats?.total ?? 0}</p>
              </div>
            </CardContent>
          </Card>

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
              icone={<BookOpen className="h-7 w-7" />}
            />
          ) : (
            <Card className="gap-0 overflow-hidden p-0">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="px-4">Disciplina</TableHead>
                      <TableHead className="px-4">Situação</TableHead>
                      <TableHead className="px-4">Nota final</TableHead>
                      <TableHead className="px-4">Frequência</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historico.disciplinas.map((d) => (
                      <TableRow key={d.materiaId}>
                        <TableCell className="px-4 py-3">
                          <p className="font-medium">{d.materiaNome}</p>
                          <p className="text-xs text-muted-foreground">ID {d.materiaId}</p>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <BadgeSituacao
                            situacao={d.situacao === 'CONCLUIDA' ? 'APROVADA' : d.situacao}
                          />
                          <span className="sr-only">{labelSituacaoHistorico(d.situacao)}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="font-semibold">{formatarNota(d.nota)}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {formatarFrequencia(d.frequencia)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </PageContainer>
  )
}

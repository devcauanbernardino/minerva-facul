import { useCallback, useEffect, useMemo, useState } from 'react'
import { Info, PencilLine, Search } from 'lucide-react'
import { AlertaErro, AlertaSucesso, PageHeader } from '../components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import type { Matricula, NotasRequest } from '../types/matricula'
import { getUsuario } from '../utils/auth'
import { mensagemErroApi } from '../utils/apiError'
import { NotasFrequenciaChart } from '../components/charts/NotasFrequenciaChart'
import { ContagemBarChart } from '../components/charts/ContagemBarChart'
import { SituacaoPieChart } from '../components/charts/SituacaoPieChart'
import { DistribuicaoNotasChart } from '../components/charts/DistribuicaoNotasChart'
import { MediaBarChart } from '../components/charts/MediaBarChart'
import { FrequenciaBarChart } from '../components/charts/FrequenciaBarChart'
import {
  agruparContagem,
  agruparNotasPorFaixa,
  contagemPorCampo,
  encurtarNome,
  mediaNotasPorCampo,
} from '../utils/charts'

type EdicaoNotas = {
  matriculaId: number
  alunoNome: string
  materiaNome: string
  nota: string
  frequencia: string
}

export function ProfessorNotas() {
  const usuario = getUsuario()
  const [turmas, setTurmas] = useState<Matricula[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvandoId, setSalvandoId] = useState<number | null>(null)
  const [edicao, setEdicao] = useState<EdicaoNotas | null>(null)
  const [filtro, setFiltro] = useState('')

  const carregarTurmas = useCallback(() => {
    if (!usuario?.email) {
      setTurmas([])
      setCarregando(false)
      return Promise.resolve()
    }

    return api
      .get<Matricula[]>('/professores/turmas', { params: { email: usuario.email } })
      .then((res) => {
        setTurmas(res.data)
        setErro(null)
      })
      .catch((e) => {
        setErro(mensagemErroApi(e, 'Não foi possível carregar suas turmas.'))
        setTurmas([])
      })
  }, [usuario?.email])

  useEffect(() => {
    carregarTurmas().finally(() => setCarregando(false))
  }, [carregarTurmas])

  const turmasFiltradas = useMemo(() => {
    if (!turmas) return []
    const termo = filtro.trim().toLowerCase()
    if (!termo) return turmas
    return turmas.filter(
      (t) =>
        t.alunoNome.toLowerCase().includes(termo) ||
        t.materiaNome.toLowerCase().includes(termo) ||
        t.cursoNome.toLowerCase().includes(termo),
    )
  }, [turmas, filtro])

  const stats = useMemo(() => {
    const lista = turmas ?? []
    const comNota = lista.filter((t) => t.nota != null).length
    const materias = new Set(lista.map((t) => t.materiaNome)).size
    return { alunos: lista.length, comNota, materias }
  }, [turmas])

  const chartData = useMemo(() => {
    const lista = turmas ?? []
    const comNota = lista.filter((t) => t.nota != null)
    const notas = comNota.map((t) => ({
      nome: encurtarNome(t.alunoNome, 14),
      nota: t.nota,
      frequencia: t.frequencia,
    }))
    const materias = contagemPorCampo(lista, (t) => t.materiaNome)
    const situacoes = agruparContagem(lista.map((t) => t.situacao))
    const faixasNota = agruparNotasPorFaixa(lista.map((t) => t.nota))
    const mediaPorMateria = mediaNotasPorCampo(lista, (t) => t.materiaNome, (t) => t.nota)
    const frequencias = lista
      .filter((t) => t.frequencia != null)
      .map((t) => ({ name: encurtarNome(t.alunoNome, 14), value: t.frequencia! }))
    return { notas, materias, situacoes, faixasNota, mediaPorMateria, frequencias }
  }, [turmas])

  function iniciarEdicao(m: Matricula) {
    setEdicao({
      matriculaId: m.id,
      alunoNome: m.alunoNome,
      materiaNome: m.materiaNome,
      nota: m.nota != null ? String(m.nota) : '',
      frequencia: m.frequencia != null ? String(m.frequencia) : '',
    })
    setSucesso(null)
    setErro(null)
  }

  function cancelarEdicao() {
    setEdicao(null)
  }

  function handleSalvarNotas(e: React.FormEvent) {
    e.preventDefault()
    if (!edicao) return

    const nota = Number(edicao.nota)
    const frequencia = Number(edicao.frequencia)

    if (Number.isNaN(nota) || nota < 0 || nota > 10) {
      setErro('A nota deve estar entre 0 e 10.')
      return
    }
    if (Number.isNaN(frequencia) || frequencia < 0 || frequencia > 100) {
      setErro('A frequência deve estar entre 0% e 100%.')
      return
    }

    setSalvandoId(edicao.matriculaId)
    setErro(null)
    setSucesso(null)

    const payload: NotasRequest = { nota, frequencia }

    api
      .patch<Matricula>(`/matriculas/${edicao.matriculaId}/notas`, payload)
      .then(() => {
        setSucesso('Notas lançadas com sucesso.')
        setEdicao(null)
        return carregarTurmas()
      })
      .catch((e) => setErro(mensagemErroApi(e, 'Erro ao lançar notas.')))
      .finally(() => setSalvandoId(null))
  }

  if (carregando) {
    return (
      <PageContainer>
        <PageHeader titulo="Lançamento de notas" subtitulo="Notas e frequência das turmas." />
        <LoadingState mensagem="Carregando turmas…" />
      </PageContainer>
    )
  }

  return (
    <PageContainer largura="xl">
      <PageHeader
        titulo="Lançamento de notas"
        subtitulo={`Professor ${usuario?.nome ?? ''} · registre nota (0–10) e frequência (%) dos alunos matriculados nas suas matérias.`}
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}
      {sucesso ? <AlertaSucesso mensagem={sucesso} /> : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard titulo="Alunos" valor={stats.alunos} descricao="Nas suas turmas" destaque />
        <StatCard titulo="Matérias" valor={stats.materias} descricao="Sob sua responsabilidade" />
        <StatCard titulo="Com nota" valor={stats.comNota} descricao="Lançamentos realizados" />
      </div>

      <Card className="mb-6 border-minerva-dourado/30 bg-minerva-dourado/5 p-5">
        <CardContent className="flex items-start gap-3 p-0 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-minerva-dourado" />
          <p>
            <strong className="text-foreground">Como funciona:</strong> clique em{' '}
            <em>Lançar notas</em> na linha do aluno, informe nota e frequência e salve. Apenas
            matrículas <BadgeSituacao situacao="ATIVA" className="mx-1 align-middle" /> permitem
            lançamento.
          </p>
        </CardContent>
      </Card>

      {(turmas?.length ?? 0) > 0 ? (
        <div className="mb-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          <ContagemBarChart
            titulo="Alunos por matéria"
            descricao="Quantidade de alunos em cada turma."
            dados={chartData.materias}
            cor="#d4af37"
          />
          <NotasFrequenciaChart
            titulo="Notas lançadas"
            descricao="Desempenho dos alunos com nota registrada."
            dados={chartData.notas}
            vazio="Nenhuma nota lançada ainda."
          />
          <SituacaoPieChart
            titulo="Situação das matrículas"
            descricao="Ativas, concluídas e outras."
            dados={chartData.situacoes}
          />
          <DistribuicaoNotasChart
            titulo="Distribuição de notas"
            descricao="Faixas de desempenho nas turmas."
            dados={chartData.faixasNota}
            vazio="Nenhuma nota lançada ainda."
          />
          <MediaBarChart
            titulo="Média por matéria"
            descricao="Nota média de cada turma (0–10)."
            dados={chartData.mediaPorMateria}
            vazio="Lance notas para calcular médias."
          />
          <FrequenciaBarChart
            titulo="Frequência dos alunos"
            descricao="Presença registrada por aluno (%)."
            dados={chartData.frequencias}
            vazio="Frequência ainda não registrada."
          />
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Suas turmas</h2>
          <p className="text-sm text-muted-foreground">
            {turmasFiltradas.length} aluno(s) listado(s)
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar aluno ou matéria…"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {turmasFiltradas.length === 0 ? (
        <EmptyState
          titulo="Nenhum aluno nas suas turmas"
          descricao="Peça à secretaria para vincular matérias ao seu cadastro de professor e matricular alunos."
          icone={<PencilLine className="h-7 w-7" />}
        />
      ) : (
        <Card className="gap-0 overflow-hidden p-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-4">Aluno</TableHead>
                  <TableHead className="px-4">Matéria</TableHead>
                  <TableHead className="px-4">Curso</TableHead>
                  <TableHead className="px-4">Situação</TableHead>
                  <TableHead className="px-4">Nota</TableHead>
                  <TableHead className="px-4">Frequência</TableHead>
                  <TableHead className="px-4 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turmasFiltradas.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="px-4 py-3">
                      <p className="font-medium">{t.alunoNome}</p>
                      <p className="text-xs text-muted-foreground">Matrícula #{t.id}</p>
                    </TableCell>
                    <TableCell className="px-4 py-3">{t.materiaNome}</TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground">{t.cursoNome}</TableCell>
                    <TableCell className="px-4 py-3">
                      <BadgeSituacao situacao={t.situacao} />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {t.nota != null ? (
                        <span className="font-semibold">{t.nota.toFixed(1)}</span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {t.frequencia != null ? (
                        <span>{t.frequencia.toFixed(0)}%</span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      {t.situacao === 'ATIVA' ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => iniciarEdicao(t)}
                        >
                          <PencilLine />
                          Lançar notas
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">Encerrada</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={edicao !== null} onOpenChange={(open) => !open && cancelarEdicao()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lançar notas</DialogTitle>
            <DialogDescription>
              {edicao
                ? `${edicao.alunoNome} · ${edicao.materiaNome} · matrícula #${edicao.matriculaId}`
                : null}
            </DialogDescription>
          </DialogHeader>
          {edicao ? (
            <form onSubmit={handleSalvarNotas} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="nota">Nota (0–10)</Label>
                  <Input
                    id="nota"
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    required
                    value={edicao.nota}
                    onChange={(e) => setEdicao({ ...edicao, nota: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="frequencia">Frequência (%)</Label>
                  <Input
                    id="frequencia"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    required
                    value={edicao.frequencia}
                    onChange={(e) => setEdicao({ ...edicao, frequencia: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={cancelarEdicao}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvandoId === edicao.matriculaId}>
                  {salvandoId === edicao.matriculaId ? 'Salvando…' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ClipboardList, ListChecks, Plus, Search, Trash2 } from 'lucide-react'
import { AlertaErro, AlertaSucesso, PageHeader } from '../components/PageHeader'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import type { Aluno } from '../types/aluno'
import type { Materia } from '../types/materia'
import type { Matricula, MatriculaRequest, SituacaoMatricula } from '../types/matricula'
import { mensagemErroApi } from '../utils/apiError'
import { SituacaoPieChart } from '../components/charts/SituacaoPieChart'
import { ContagemBarChart } from '../components/charts/ContagemBarChart'
import { DistribuicaoNotasChart } from '../components/charts/DistribuicaoNotasChart'
import { MediaBarChart } from '../components/charts/MediaBarChart'
import {
  agruparContagem,
  agruparNotasPorFaixa,
  contagemPorCampo,
  mediaNotasPorCampo,
} from '../utils/charts'

const opcoesSituacao: { valor: SituacaoMatricula; label: string }[] = [
  { valor: 'ATIVA', label: 'Ativa' },
  { valor: 'CONCLUIDA', label: 'Concluída' },
  { valor: 'CANCELADA', label: 'Cancelada' },
  { valor: 'REPROVADA', label: 'Reprovada' },
  { valor: 'TRANCADA', label: 'Trancada' },
]

export function Matriculas() {
  const [matriculas, setMatriculas] = useState<Matricula[] | null>(null)
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [alunoId, setAlunoId] = useState('')
  const [materiaId, setMateriaId] = useState('')
  const [situacao, setSituacao] = useState<SituacaoMatricula>('ATIVA')

  const carregarMatriculas = useCallback(() => {
    return api
      .get<Matricula[]>('/matriculas')
      .then((res) => {
        setMatriculas(res.data)
        setErro(null)
      })
      .catch((e) => {
        setErro(mensagemErroApi(e, 'Não foi possível carregar as matrículas.'))
        setMatriculas([])
      })
  }, [])

  useEffect(() => {
    Promise.all([
      api.get<Aluno[]>('/alunos'),
      api.get<Materia[]>('/materias'),
      carregarMatriculas(),
    ])
      .then(([alunosRes, materiasRes]) => {
        setAlunos(alunosRes.data)
        setMaterias(materiasRes.data)
        if (alunosRes.data.length > 0) {
          const primeiro = alunosRes.data[0]
          setAlunoId(String(primeiro.id))
          const materiasDoCurso = materiasRes.data.filter((m) => m.cursoId === primeiro.curso.id)
          setMateriaId(materiasDoCurso[0] ? String(materiasDoCurso[0].id) : '')
        }
      })
      .catch((e) =>
        setErro(mensagemErroApi(e, 'Não foi possível carregar dados para matrícula.')),
      )
      .finally(() => setCarregando(false))
  }, [carregarMatriculas])

  const matriculasFiltradas = useMemo(() => {
    if (!matriculas) return []
    const termo = filtro.trim().toLowerCase()
    if (!termo) return matriculas
    return matriculas.filter(
      (m) =>
        m.alunoNome.toLowerCase().includes(termo) ||
        m.materiaNome.toLowerCase().includes(termo) ||
        m.cursoNome.toLowerCase().includes(termo),
    )
  }, [matriculas, filtro])

  const stats = useMemo(() => {
    const lista = matriculas ?? []
    return {
      total: lista.length,
      ativas: lista.filter((m) => m.situacao === 'ATIVA').length,
      concluidas: lista.filter((m) => m.situacao === 'CONCLUIDA').length,
    }
  }, [matriculas])

  const chartData = useMemo(() => {
    const lista = matriculas ?? []
    const situacoes = agruparContagem(lista.map((m) => m.situacao))
    const cursos = contagemPorCampo(lista, (m) => m.cursoNome)
    const materias = contagemPorCampo(lista, (m) => m.materiaNome)
    const faixasNota = agruparNotasPorFaixa(lista.map((m) => m.nota))
    const mediaPorCurso = mediaNotasPorCampo(lista, (m) => m.cursoNome, (m) => m.nota)
    return { situacoes, cursos, materias, faixasNota, mediaPorCurso }
  }, [matriculas])

  const alunoSelecionado = useMemo(
    () => alunos.find((a) => String(a.id) === alunoId),
    [alunos, alunoId],
  )

  const materiasDoCurso = useMemo(() => {
    if (!alunoSelecionado) return []
    return materias.filter((m) => m.cursoId === alunoSelecionado.curso.id)
  }, [materias, alunoSelecionado])

  function handleAlunoChange(novoAlunoId: string) {
    setAlunoId(novoAlunoId)
    const aluno = alunos.find((a) => String(a.id) === novoAlunoId)
    if (!aluno) {
      setMateriaId('')
      return
    }
    const doCurso = materias.filter((m) => m.cursoId === aluno.curso.id)
    setMateriaId(doCurso[0] ? String(doCurso[0].id) : '')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!alunoId || !materiaId) {
      setErro('Selecione aluno e matéria.')
      return
    }

    setEnviando(true)
    setErro(null)
    setSucesso(null)

    const payload: MatriculaRequest = {
      alunoId: Number(alunoId),
      materiaId: Number(materiaId),
      situacao,
    }

    api
      .post<Matricula>('/matriculas', payload)
      .then(() => {
        setSucesso('Matrícula registrada com sucesso.')
        return carregarMatriculas()
      })
      .catch((e) => setErro(mensagemErroApi(e, 'Erro ao matricular aluno.')))
      .finally(() => setEnviando(false))
  }

  function handleAlterarSituacao(id: number, novaSituacao: SituacaoMatricula) {
    api
      .put<Matricula>(`/matriculas/${id}/situacao`, null, { params: { situacao: novaSituacao } })
      .then(() => {
        setSucesso(`Situação atualizada para ${novaSituacao}.`)
        return carregarMatriculas()
      })
      .catch((e) => setErro(mensagemErroApi(e, 'Erro ao atualizar situação.')))
  }

  function handleExcluir(id: number, alunoNome: string) {
    if (!confirm(`Excluir matrícula de ${alunoNome}?`)) return
    api
      .delete(`/matriculas/${id}`)
      .then(() => {
        setSucesso('Matrícula excluída.')
        return carregarMatriculas()
      })
      .catch((e) => setErro(mensagemErroApi(e, 'Erro ao excluir matrícula.')))
  }

  if (carregando) {
    return (
      <PageContainer>
        <PageHeader titulo="Matrículas" subtitulo="Vínculo entre aluno e matéria." />
        <LoadingState mensagem="Carregando matrículas…" />
      </PageContainer>
    )
  }

  return (
    <PageContainer largura="xl">
      <PageHeader
        titulo="Matrículas"
        subtitulo="Gerencie vínculos aluno ↔ matéria, situação acadêmica e acompanhe o total de registros."
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}
      {sucesso ? <AlertaSucesso mensagem={sucesso} /> : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard titulo="Total" valor={stats.total} descricao="Matrículas registradas" />
        <StatCard titulo="Ativas" valor={stats.ativas} descricao="Em andamento" destaque />
        <StatCard titulo="Concluídas" valor={stats.concluidas} descricao="Finalizadas" />
      </div>

      {(matriculas?.length ?? 0) > 0 ? (
        <div className="mb-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          <SituacaoPieChart
            titulo="Matrículas por situação"
            descricao="Ativas, concluídas, canceladas e outras."
            dados={chartData.situacoes}
          />
          <ContagemBarChart
            titulo="Matrículas por curso"
            descricao="Distribuição entre os cursos."
            dados={chartData.cursos}
          />
          <ContagemBarChart
            titulo="Matrículas por matéria"
            descricao="Disciplinas com mais matrículas."
            dados={chartData.materias}
            cor="#0284c7"
          />
          <DistribuicaoNotasChart
            titulo="Distribuição de notas"
            descricao="Faixas de desempenho geral."
            dados={chartData.faixasNota}
            vazio="Nenhuma nota lançada ainda."
          />
          <MediaBarChart
            titulo="Média por curso"
            descricao="Nota média por curso (0–10)."
            dados={chartData.mediaPorCurso}
            cor="#059669"
            vazio="Lance notas para calcular médias."
          />
        </div>
      ) : null}

      <section className="mb-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Nova matrícula
            </CardTitle>
            <CardDescription>
              Selecione o aluno e matricule-o em uma matéria do curso dele.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Aluno</Label>
                <Select value={alunoId} onValueChange={handleAlunoChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {alunos.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.nome} · {a.curso.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Matéria</Label>
                {alunoSelecionado ? (
                  <p className="text-xs text-muted-foreground">
                    Curso: <strong>{alunoSelecionado.curso.nome}</strong>
                  </p>
                ) : null}
                <Select
                  value={materiaId}
                  onValueChange={setMateriaId}
                  disabled={!alunoSelecionado || materiasDoCurso.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !alunoSelecionado
                          ? 'Selecione um aluno primeiro'
                          : materiasDoCurso.length === 0
                            ? 'Nenhuma matéria neste curso'
                            : 'Selecione'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {materiasDoCurso.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Situação</Label>
                <Select
                  value={situacao}
                  onValueChange={(v) => setSituacao(v as SituacaoMatricula)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {opcoesSituacao.map((o) => (
                      <SelectItem key={o.valor} value={o.valor}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" size="lg" disabled={enviando} className="w-full">
                {enviando ? 'Salvando…' : 'Matricular aluno'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-minerva-dourado" />
              Antes de matricular
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>
                  Cadastre{' '}
                  <Link to="/alunos" className="font-semibold text-primary hover:underline">
                    alunos
                  </Link>{' '}
                  vinculados a um curso
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>
                  Cadastre{' '}
                  <Link to="/materias" className="font-semibold text-primary hover:underline">
                    matérias
                  </Link>{' '}
                  do mesmo curso
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>Um aluno não pode ser matriculado duas vezes na mesma matéria</span>
              </li>
            </ul>
            <div className="mt-6 rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
              <strong>{alunos.length}</strong> alunos ·{' '}
              {alunoSelecionado ? (
                <>
                  <strong>{materiasDoCurso.length}</strong> matérias em{' '}
                  {alunoSelecionado.curso.nome}
                </>
              ) : (
                <>selecione um aluno para ver as matérias do curso</>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Matrículas registradas</h2>
            <p className="text-sm text-muted-foreground">
              {matriculasFiltradas.length} registro(s) exibido(s)
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar aluno, matéria ou curso…"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {matriculasFiltradas.length === 0 ? (
          <EmptyState
            titulo="Nenhuma matrícula encontrada"
            descricao="Cadastre a primeira matrícula usando o formulário acima ou ajuste o filtro de busca."
            icone={<ClipboardList className="h-7 w-7" />}
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
                    <TableHead className="px-4">Data</TableHead>
                    <TableHead className="px-4">Situação</TableHead>
                    <TableHead className="px-4">Nota</TableHead>
                    <TableHead className="px-4 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matriculasFiltradas.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="px-4 py-3">
                        <p className="font-medium">{m.alunoNome}</p>
                        <p className="text-xs text-muted-foreground">ID {m.alunoId}</p>
                      </TableCell>
                      <TableCell className="px-4 py-3">{m.materiaNome}</TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">
                        {m.cursoNome}
                      </TableCell>
                      <TableCell className="px-4 py-3">{m.dataCriacao}</TableCell>
                      <TableCell className="px-4 py-3">
                        <BadgeSituacao situacao={m.situacao} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {m.nota != null ? (
                          <span className="font-semibold">{m.nota.toFixed(1)}</span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          {m.situacao === 'ATIVA' ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAlterarSituacao(m.id, 'CONCLUIDA')}
                            >
                              <CheckCircle2 />
                              Concluir
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleExcluir(m.id, m.alunoNome)}
                          >
                            <Trash2 />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>
    </PageContainer>
  )
}

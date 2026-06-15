import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ClipboardList, ListChecks, Plus, Search, Trash2 } from 'lucide-react'
import { AlertaErro, PageHeader } from '../components/PageHeader'
import { useToast } from '../components/ui/Toast'
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
import { Badge } from '@/components/ui/badge'
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
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [alunoId, setAlunoId] = useState('')
  const [materiaId, setMateriaId] = useState('')
  const [situacao, setSituacao] = useState<SituacaoMatricula>('ATIVA')
  const { mostrarSucesso, mostrarErro } = useToast()

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

    const payload: MatriculaRequest = {
      alunoId: Number(alunoId),
      materiaId: Number(materiaId),
      situacao,
    }

    api
      .post<Matricula>('/matriculas', payload)
      .then(() => {
        mostrarSucesso('Matrícula registrada com sucesso.')
        return carregarMatriculas()
      })
      .catch((e) => mostrarErro(mensagemErroApi(e, 'Erro ao matricular aluno.')))
      .finally(() => setEnviando(false))
  }

  function handleAlterarSituacao(id: number, novaSituacao: SituacaoMatricula) {
    api
      .put<Matricula>(`/matriculas/${id}/situacao`, null, { params: { situacao: novaSituacao } })
      .then(() => {
        mostrarSucesso(`Situação atualizada para ${novaSituacao}.`)
        return carregarMatriculas()
      })
      .catch((e) => mostrarErro(mensagemErroApi(e, 'Erro ao atualizar situação.')))
  }

  function handleExcluir(id: number, alunoNome: string) {
    if (!confirm(`Excluir matrícula de ${alunoNome}?`)) return
    api
      .delete(`/matriculas/${id}`)
      .then(() => {
        mostrarSucesso('Matrícula excluída.')
        return carregarMatriculas()
      })
      .catch((e) => mostrarErro(mensagemErroApi(e, 'Erro ao excluir matrícula.')))
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

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard titulo="Total" valor={stats.total} descricao="Matrículas registradas" />
        <StatCard titulo="Ativas" valor={stats.ativas} descricao="Em andamento" destaque />
        <StatCard titulo="Concluídas" valor={stats.concluidas} descricao="Finalizadas" />
      </div>

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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matriculasFiltradas.map((m) => (
              <Card key={m.id} className="gap-0 overflow-hidden p-0">
                <CardContent className="flex-1 space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base font-semibold leading-tight">
                        {m.alunoNome}
                      </p>
                      <p className="text-xs text-muted-foreground">ID {m.alunoId}</p>
                    </div>
                    <BadgeSituacao situacao={m.situacao} />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="font-medium">{m.materiaNome}</Badge>
                    <Badge variant="secondary" className="font-medium">{m.cursoNome}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{m.dataCriacao}</span>
                    {m.nota != null ? (
                      <span className="font-semibold text-foreground">Nota: {m.nota.toFixed(1)}</span>
                    ) : (
                      <span className="text-muted-foreground/50">Sem nota</span>
                    )}
                  </div>
                </CardContent>

                <div className="flex border-t divide-x divide-border">
                  {m.situacao === 'ATIVA' ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 rounded-none gap-1.5 text-xs font-medium"
                      onClick={() => handleAlterarSituacao(m.id, 'CONCLUIDA')}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Concluir
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 rounded-none gap-1.5 text-xs font-medium text-destructive hover:text-destructive"
                    onClick={() => handleExcluir(m.id, m.alunoNome)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  )
}

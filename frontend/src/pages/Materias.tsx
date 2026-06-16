import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Info, ListTree, UserRound } from 'lucide-react'
import { PlusIcon, TrashIcon } from '../components/ui/AnimatedIcons'
import { AlertaErro, PageHeader } from '../components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { PageContainer } from '../components/ui/PageContainer'
import { StatCard } from '../components/ui/StatCard'
import { api } from '../services/api'
import type { Curso } from '../types/curso'
import type { Materia, MateriaRequest } from '../types/materia'
import type { Professor } from '../types/professor'
import { mensagemErroApi } from '../utils/apiError'
import { useToast } from '../components/ui/Toast'

export function Materias() {
  const { mostrarSucesso, mostrarErro } = useToast()
  const [materias, setMaterias] = useState<Materia[] | null>(null)
  const [cursos, setCursos] = useState<Curso[]>([])
  const [professores, setProfessores] = useState<Professor[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [cursoId, setCursoId] = useState('')
  const [prerequisitoIds, setPrerequisitoIds] = useState<number[]>([])
  const [enviando, setEnviando] = useState(false)

  // Dialog pré-requisitos
  const [editando, setEditando] = useState<Materia | null>(null)
  const [prerequisitosEdicao, setPrerequisitosEdicao] = useState<number[]>([])
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)

  // Dialog professores
  const [editandoProf, setEditandoProf] = useState<Materia | null>(null)
  const [professoresEdicao, setProfessoresEdicao] = useState<number[]>([])
  const [salvandoProf, setSalvandoProf] = useState(false)

  function carregar() {
    setErro(null)
    Promise.all([
      api.get<Materia[]>('/materias'),
      api.get<Curso[]>('/cursos'),
      api.get<Professor[]>('/professores'),
    ])
      .then(([materiasRes, cursosRes, professoresRes]) => {
        setMaterias(materiasRes.data)
        setCursos(cursosRes.data)
        setProfessores(professoresRes.data)
        if (cursosRes.data.length > 0 && !cursoId) {
          setCursoId(String(cursosRes.data[0].id))
        }
      })
      .catch((e) => {
        setErro(mensagemErroApi(e, 'Não foi possível carregar matérias.'))
        setMaterias([])
      })
  }

  useEffect(() => {
    carregar()
  }, [])

  const stats = useMemo(() => {
    const lista = materias ?? []
    return {
      total: lista.length,
      cursosComMateria: new Set(lista.map((m) => m.cursoId)).size,
    }
  }, [materias])

  const candidatasPrerequisito = useMemo(() => {
    if (!cursoId) return []
    return (materias ?? []).filter((m) => m.cursoId === Number(cursoId))
  }, [materias, cursoId])

  function nomesPrerequisitos(ids: number[]) {
    const lista = materias ?? []
    return ids
      .map((id) => lista.find((m) => m.id === id)?.nome)
      .filter((nome): nome is string => Boolean(nome))
  }

  function nomesProfessores(ids: number[]) {
    return ids
      .map((id) => professores.find((p) => p.id === id)?.nome)
      .filter((n): n is string => Boolean(n))
  }

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!cursoId) { setErro('Selecione um curso.'); return }
    setEnviando(true)
    setErro(null)
    const payload: MateriaRequest = { nome, cursoId: Number(cursoId), prerequisitoIds }
    api
      .post<Materia>('/materias', payload)
      .then((res) => {
        setMaterias((prev) => (prev ? [...prev, res.data] : [res.data]))
        setNome('')
        setPrerequisitoIds([])
        mostrarSucesso('Matéria cadastrada com sucesso.')
      })
      .catch((err) => mostrarErro(mensagemErroApi(err, 'Erro ao cadastrar matéria.')))
      .finally(() => setEnviando(false))
  }

  function handleExcluir(id: number) {
    if (!confirm('Excluir esta matéria?')) return
    api
      .delete(`/materias/${id}`)
      .then(() => {
        setMaterias((prev) => prev?.filter((m) => m.id !== id) ?? [])
        mostrarSucesso('Matéria excluída.')
      })
      .catch((err) => mostrarErro(mensagemErroApi(err, 'Erro ao excluir matéria.')))
  }

  function toggleItem(lista: number[], id: number, atualizar: (next: number[]) => void) {
    atualizar(lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id])
  }

  // --- Pré-requisitos ---
  function abrirEdicaoPrerequisitos(materia: Materia) {
    setEditando(materia)
    setPrerequisitosEdicao(materia.prerequisitoIds)
  }

  function handleSalvarPrerequisitos() {
    if (!editando) return
    setSalvandoEdicao(true)
    const payload: MateriaRequest = {
      nome: editando.nome,
      cursoId: editando.cursoId,
      prerequisitoIds: prerequisitosEdicao,
    }
    api
      .put<Materia>(`/materias/${editando.id}`, payload)
      .then((res) => {
        setMaterias((prev) => prev?.map((m) => (m.id === res.data.id ? res.data : m)) ?? [])
        mostrarSucesso('Pré-requisitos atualizados.')
        setEditando(null)
      })
      .catch((err) => mostrarErro(mensagemErroApi(err, 'Erro ao atualizar pré-requisitos.')))
      .finally(() => setSalvandoEdicao(false))
  }

  // --- Professores ---
  function abrirEdicaoProfessores(materia: Materia) {
    setEditandoProf(materia)
    setProfessoresEdicao(materia.professorIds)
  }

  function handleSalvarProfessores() {
    if (!editandoProf) return
    setSalvandoProf(true)
    api
      .put<Materia>(`/materias/${editandoProf.id}/professores`, professoresEdicao)
      .then((res) => {
        setMaterias((prev) => prev?.map((m) => (m.id === res.data.id ? res.data : m)) ?? [])
        mostrarSucesso('Professores atualizados.')
        setEditandoProf(null)
      })
      .catch((err) => mostrarErro(mensagemErroApi(err, 'Erro ao atualizar professores.')))
      .finally(() => setSalvandoProf(false))
  }

  return (
    <PageContainer>
      <PageHeader titulo="Matérias" subtitulo="Disciplinas vinculadas aos cursos." />

      {erro ? <AlertaErro mensagem={erro} /> : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <StatCard titulo="Matérias" valor={stats.total} descricao="Disciplinas cadastradas" destaque />
        <StatCard titulo="Cursos atendidos" valor={stats.cursosComMateria} descricao="Com disciplinas vinculadas" />
      </div>

      <section className="mb-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4 text-primary" />
              Nova matéria
            </CardTitle>
            <CardDescription>Cada matéria pertence a um curso.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="materia-nome">Nome</Label>
                <Input
                  id="materia-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="Ex.: Cálculo I"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Curso</Label>
                <Select value={cursoId} onValueChange={(v) => { setCursoId(v); setPrerequisitoIds([]) }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {cursos.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {candidatasPrerequisito.length > 0 ? (
                <div className="space-y-1.5">
                  <Label>Pré-requisitos (opcional)</Label>
                  <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-input p-3">
                    {candidatasPrerequisito.map((m) => (
                      <label key={m.id} className="flex items-center gap-2 text-sm font-normal text-foreground">
                        <Checkbox
                          checked={prerequisitoIds.includes(m.id)}
                          onCheckedChange={() => toggleItem(prerequisitoIds, m.id, setPrerequisitoIds)}
                        />
                        {m.nome}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
              <Button type="submit" size="lg" disabled={enviando} className="w-full">
                {enviando ? 'Salvando…' : 'Cadastrar matéria'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit border-minerva-dourado/30 bg-minerva-dourado/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-4 w-4 text-minerva-dourado" />
              Sobre
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Gerencie os professores de cada matéria clicando em{' '}
              <span className="font-semibold text-foreground">Professores</span> no cartão da disciplina.
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        {materias === null ? (
          <LoadingState mensagem="Carregando matérias…" />
        ) : materias.length === 0 ? (
          <EmptyState
            titulo="Nenhuma matéria cadastrada"
            descricao="Cadastre a primeira disciplina usando o formulário acima."
            icone={<BookOpen className="h-7 w-7" />}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materias.map((m) => (
              <Card key={m.id} className="gap-0 overflow-hidden p-0">
                <CardContent className="flex-1 space-y-3 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base font-semibold leading-tight">{m.nome}</p>
                      <p className="text-xs text-muted-foreground">{m.cursoNome}</p>
                    </div>
                  </div>

                  {/* Professores */}
                  <div className="flex flex-wrap gap-1.5">
                    {m.professorIds.length === 0 ? (
                      <Badge variant="secondary" className="font-medium text-muted-foreground">
                        Sem professor
                      </Badge>
                    ) : (
                      nomesProfessores(m.professorIds).map((n) => (
                        <Badge key={n} variant="outline" className="font-medium text-primary border-primary/30">
                          <UserRound className="h-3 w-3 mr-1" />
                          {n}
                        </Badge>
                      ))
                    )}
                  </div>

                  {/* Pré-requisitos */}
                  {m.prerequisitoIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {nomesPrerequisitos(m.prerequisitoIds).map((n) => (
                        <Badge key={n} variant="secondary" className="font-medium">{n}</Badge>
                      ))}
                    </div>
                  ) : null}
                </CardContent>

                <div className="flex flex-col border-t">
                  <div className="flex divide-x divide-border">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 rounded-none gap-1.5 text-xs font-medium"
                      onClick={() => abrirEdicaoProfessores(m)}
                    >
                      <UserRound className="h-3.5 w-3.5" />
                      Professores
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 rounded-none gap-1.5 text-xs font-medium"
                      onClick={() => abrirEdicaoPrerequisitos(m)}
                    >
                      <ListTree className="h-3.5 w-3.5" />
                      Pré-requisitos
                    </Button>
                  </div>
                  <div className="border-t">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full rounded-none gap-1.5 text-xs font-medium text-destructive hover:text-destructive"
                      onClick={() => handleExcluir(m.id)}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Dialog — Professores */}
      <Dialog open={editandoProf != null} onOpenChange={(open) => !open && setEditandoProf(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Professores de {editandoProf?.nome}</DialogTitle>
            <DialogDescription>
              Selecione quais professores ministram esta disciplina.
            </DialogDescription>
          </DialogHeader>
          {professores.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum professor cadastrado.{' '}
              <Link to="/professores" className="font-semibold text-primary hover:underline">
                Cadastrar professor
              </Link>
            </p>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-input p-3">
              {professores.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm font-normal text-foreground">
                  <Checkbox
                    checked={professoresEdicao.includes(p.id)}
                    onCheckedChange={() => toggleItem(professoresEdicao, p.id, setProfessoresEdicao)}
                  />
                  <span>
                    <span className="font-medium">{p.nome}</span>
                    {p.especialidade ? (
                      <span className="ml-1.5 text-xs text-muted-foreground">· {p.especialidade}</span>
                    ) : null}
                  </span>
                </label>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditandoProf(null)}>Cancelar</Button>
            <Button type="button" disabled={salvandoProf} onClick={handleSalvarProfessores}>
              {salvandoProf ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog — Pré-requisitos */}
      <Dialog open={editando != null} onOpenChange={(open) => !open && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pré-requisitos de {editando?.nome}</DialogTitle>
            <DialogDescription>
              Selecione as matérias do mesmo curso que o aluno precisa ter concluído antes de se
              matricular nesta disciplina.
            </DialogDescription>
          </DialogHeader>
          {editando ? (
            <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-input p-3">
              {(materias ?? [])
                .filter((m) => m.cursoId === editando.cursoId && m.id !== editando.id)
                .map((m) => (
                  <label key={m.id} className="flex items-center gap-2 text-sm font-normal text-foreground">
                    <Checkbox
                      checked={prerequisitosEdicao.includes(m.id)}
                      onCheckedChange={() => toggleItem(prerequisitosEdicao, m.id, setPrerequisitosEdicao)}
                    />
                    {m.nome}
                  </label>
                ))}
              {(materias ?? []).filter((m) => m.cursoId === editando.cursoId && m.id !== editando.id).length === 0 ? (
                <p className="text-sm text-muted-foreground">Não há outras matérias neste curso.</p>
              ) : null}
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button type="button" disabled={salvandoEdicao} onClick={handleSalvarPrerequisitos}>
              {salvandoEdicao ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpenCheck, UserRound } from 'lucide-react'
import { PencilIcon, TrashIcon } from '../components/ui/AnimatedIcons'
import { AlertaErro, PageHeader } from '../components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { PageContainer } from '../components/ui/PageContainer'
import { StatCard } from '../components/ui/StatCard'
import { api } from '../services/api'
import type { Professor } from '../types/professor'
import type { Materia } from '../types/materia'
import { mensagemErroApi } from '../utils/apiError'
import { useToast } from '../components/ui/Toast'

export function Professores() {
  const { mostrarSucesso, mostrarErro } = useToast()
  const [professores, setProfessores] = useState<Professor[] | null>(null)
  const [materias, setMaterias] = useState<Materia[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [vinculandoId, setVinculandoId] = useState<number | null>(null)
  const [materiaIdsSelecionadas, setMateriaIdsSelecionadas] = useState<number[]>([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [vinculando, setVinculando] = useState(false)

  function carregar() {
    api
      .get<Professor[]>('/professores')
      .then((res) => {
        setProfessores(res.data)
        setErro(null)
      })
      .catch((e) => {
        setErro(mensagemErroApi(e, 'Não foi possível carregar professores.'))
        setProfessores([])
      })
  }

  useEffect(() => {
    carregar()
    api
      .get<Materia[]>('/materias')
      .then((res) => setMaterias(res.data))
      .catch(() => setMaterias([]))
  }, [])

  const stats = useMemo(() => {
    const lista = professores ?? []
    return {
      total: lista.length,
      comMaterias: lista.filter((p) => (p.materiaIds?.length ?? 0) > 0).length,
      especialidades: new Set(
        lista.map((p) => p.especialidade).filter((e): e is string => Boolean(e)),
      ).size,
    }
  }, [professores])

  const iniciais = (nome: string) =>
    nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join('')

  const professorEditando = useMemo(
    () => professores?.find((p) => p.id === editandoId) ?? null,
    [professores, editandoId],
  )

  const professorVinculando = useMemo(
    () => professores?.find((p) => p.id === vinculandoId) ?? null,
    [professores, vinculandoId],
  )

  function iniciarEdicao(professor: Professor) {
    setEditandoId(professor.id)
    setNome(professor.nome)
    setEmail(professor.email)
    setSenha('')
    setEspecialidade(professor.especialidade ?? '')
    setErro(null)
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setNome('')
    setEmail('')
    setSenha('')
    setEspecialidade('')
  }

  function iniciarVinculo(professor: Professor) {
    setVinculandoId(professor.id)
    setMateriaIdsSelecionadas(professor.materiaIds ?? [])
    setEditandoId(null)
    setErro(null)
  }

  function cancelarVinculo() {
    setVinculandoId(null)
    setMateriaIdsSelecionadas([])
  }

  function toggleMateria(materiaId: number) {
    setMateriaIdsSelecionadas((prev) =>
      prev.includes(materiaId) ? prev.filter((id) => id !== materiaId) : [...prev, materiaId],
    )
  }

  function handleVincularMaterias(e: React.FormEvent) {
    e.preventDefault()
    if (vinculandoId === null) return
    setVinculando(true)
    setErro(null)
    api
      .put<Professor>(`/professores/${vinculandoId}/materias`, {
        materiaIds: materiaIdsSelecionadas,
      })
      .then((res) => {
        setProfessores((prev) => prev?.map((p) => (p.id === vinculandoId ? res.data : p)) ?? [])
        cancelarVinculo()
        mostrarSucesso('Matérias vinculadas ao professor.')
      })
      .catch((err) => mostrarErro(mensagemErroApi(err, 'Erro ao vincular matérias.')))
      .finally(() => setVinculando(false))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editandoId === null) return
    setEnviando(true)
    setErro(null)
    if (!senha) {
      setErro('Informe a senha para salvar (backend exige o campo na edição).')
      setEnviando(false)
      return
    }
    api
      .put<Professor>(`/professores/${editandoId}`, {
        nome,
        email,
        senha,
        especialidade,
      })
      .then((res) => {
        setProfessores(
          (prev) =>
            prev?.map((p) => (p.id === editandoId ? res.data : p)) ?? [],
        )
        cancelarEdicao()
        mostrarSucesso('Professor atualizado.')
      })
      .catch((err) =>
        mostrarErro(mensagemErroApi(err, 'Erro ao atualizar professor.')),
      )
      .finally(() => setEnviando(false))
  }

  function handleExcluir(id: number) {
    if (!confirm('Excluir este professor?')) return
    api
      .delete(`/professores/${id}`)
      .then(() => {
        setProfessores((prev) => prev?.filter((p) => p.id !== id) ?? [])
        if (editandoId === id) cancelarEdicao()
        mostrarSucesso('Professor excluído.')
      })
      .catch((err) =>
        mostrarErro(mensagemErroApi(err, 'Erro ao excluir professor.')),
      )
  }

  return (
    <PageContainer>
      <PageHeader
        titulo="Professores"
        subtitulo="Listagem e edição. Novos professores entram pelo cadastro público."
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard titulo="Professores" valor={stats.total} descricao="Cadastrados no sistema" destaque />
        <StatCard titulo="Com turmas" valor={stats.comMaterias} descricao="Matérias vinculadas" />
        <StatCard titulo="Especialidades" valor={stats.especialidades} descricao="Áreas distintas" />
      </div>

      <section>
        {professores === null ? (
          <LoadingState mensagem="Carregando professores…" />
        ) : professores.length === 0 ? (
          <EmptyState
            titulo="Nenhum professor cadastrado"
            descricao='Novos professores entram pela tela de cadastro público marcando "Sou professor".'
            icone={<UserRound className="h-7 w-7" />}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {professores.map((p) => (
              <Card
                key={p.id}
                className="gap-0 overflow-hidden p-0 transition-shadow hover:shadow-md"
              >
                <CardContent className="flex-1 space-y-4 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                      {iniciais(p.nome)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base font-semibold leading-tight">
                        {p.nome}
                      </p>
                      <p className="text-xs text-muted-foreground">{p.matricula ?? `ID ${p.id}`}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {p.especialidade ? (
                      <Badge variant="outline" className="font-medium">
                        {p.especialidade}
                      </Badge>
                    ) : null}
                    <Badge variant="secondary" className="font-medium">
                      {p.materiaIds?.length ?? 0} matéria
                      {(p.materiaIds?.length ?? 0) !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardContent>

                <div className="flex border-t divide-x divide-border">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 rounded-none gap-1.5 text-xs font-medium"
                    onClick={() => iniciarVinculo(p)}
                  >
                    <BookOpenCheck className="h-3.5 w-3.5" />
                    Matérias
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 rounded-none gap-1.5 text-xs font-medium"
                    onClick={() => iniciarEdicao(p)}
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 rounded-none gap-1.5 text-xs font-medium text-destructive hover:text-destructive"
                    onClick={() => handleExcluir(p.id)}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Excluir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog open={editandoId !== null} onOpenChange={(open) => !open && cancelarEdicao()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar professor</DialogTitle>
            <DialogDescription>
              {professorEditando ? professorEditando.nome : `Professor #${editandoId}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="prof-nome">Nome</Label>
                <Input
                  id="prof-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prof-email">E-mail</Label>
                <Input
                  id="prof-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prof-senha">Senha</Label>
                <Input
                  id="prof-senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  placeholder="Informe a senha"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prof-especialidade">Especialidade</Label>
                <Input
                  id="prof-especialidade"
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  placeholder="Ex.: Banco de Dados"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={cancelarEdicao}>
                Cancelar
              </Button>
              <Button type="submit" disabled={enviando}>
                {enviando ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={vinculandoId !== null} onOpenChange={(open) => !open && cancelarVinculo()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Matérias do professor</DialogTitle>
            <DialogDescription>
              {professorVinculando ? professorVinculando.nome : `Professor #${vinculandoId}`} ·
              selecione as disciplinas lecionadas. Os alunos matriculados nelas aparecerão em{' '}
              <strong>Lançamento de notas</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVincularMaterias} className="space-y-4">
            {materias.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma matéria cadastrada. Cadastre matérias em{' '}
                <Link to="/materias" className="font-semibold text-primary hover:underline">
                  Matérias
                </Link>{' '}
                antes de vincular.
              </p>
            ) : (
              <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {materias.map((m) => (
                  <Label
                    key={m.id}
                    className="flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 font-normal transition-colors hover:bg-muted has-data-[state=checked]:border-primary/40 has-data-[state=checked]:bg-primary/5"
                  >
                    <Checkbox
                      checked={materiaIdsSelecionadas.includes(m.id)}
                      onCheckedChange={() => toggleMateria(m.id)}
                      className="mt-0.5"
                    />
                    <span className="text-sm leading-snug">
                      {m.nome}
                      <span className="block text-xs text-muted-foreground">{m.cursoNome}</span>
                    </span>
                  </Label>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={cancelarVinculo}>
                Cancelar
              </Button>
              <Button type="submit" disabled={vinculando || materias.length === 0}>
                {vinculando ? 'Salvando…' : 'Salvar vínculos'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

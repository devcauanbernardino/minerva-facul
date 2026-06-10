import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Info, Plus, Trash2 } from 'lucide-react'
import { AlertaErro, AlertaSucesso, PageHeader } from '../components/PageHeader'
import { Badge } from '@/components/ui/badge'
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
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { PageContainer } from '../components/ui/PageContainer'
import { StatCard } from '../components/ui/StatCard'
import { api } from '../services/api'
import type { Curso } from '../types/curso'
import type { Materia } from '../types/materia'
import { mensagemErroApi } from '../utils/apiError'

export function Materias() {
  const [materias, setMaterias] = useState<Materia[] | null>(null)
  const [cursos, setCursos] = useState<Curso[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [cursoId, setCursoId] = useState('')
  const [enviando, setEnviando] = useState(false)

  function carregar() {
    setErro(null)
    Promise.all([
      api.get<Materia[]>('/materias'),
      api.get<Curso[]>('/cursos'),
    ])
      .then(([materiasRes, cursosRes]) => {
        setMaterias(materiasRes.data)
        setCursos(cursosRes.data)
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cursoId) {
      setErro('Selecione um curso.')
      return
    }
    setEnviando(true)
    setErro(null)
    setSucesso(null)
    api
      .post<Materia>('/materias', { nome, cursoId: Number(cursoId) })
      .then((res) => {
        setMaterias((prev) => (prev ? [...prev, res.data] : [res.data]))
        setNome('')
        setSucesso('Matéria cadastrada com sucesso.')
      })
      .catch((err) => setErro(mensagemErroApi(err, 'Erro ao cadastrar matéria.')))
      .finally(() => setEnviando(false))
  }

  function handleExcluir(id: number) {
    if (!confirm('Excluir esta matéria?')) return
    api
      .delete(`/materias/${id}`)
      .then(() => {
        setMaterias((prev) => prev?.filter((m) => m.id !== id) ?? [])
        setSucesso('Matéria excluída.')
      })
      .catch((err) => setErro(mensagemErroApi(err, 'Erro ao excluir matéria.')))
  }

  return (
    <PageContainer>
      <PageHeader
        titulo="Matérias"
        subtitulo="Disciplinas vinculadas aos cursos."
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}
      {sucesso ? <AlertaSucesso mensagem={sucesso} /> : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <StatCard titulo="Matérias" valor={stats.total} descricao="Disciplinas cadastradas" destaque />
        <StatCard
          titulo="Cursos atendidos"
          valor={stats.cursosComMateria}
          descricao="Com disciplinas vinculadas"
        />
      </div>

      <section className="mb-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
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
                <Select value={cursoId} onValueChange={setCursoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {cursos.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              As matérias são a base para matrículas e lançamento de notas. Vincule professores na
              tela de{' '}
              <Link to="/professores" className="font-semibold text-primary hover:underline">
                Professores
              </Link>
              .
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
          <Card className="gap-0 overflow-hidden p-0">
            <CardHeader className="border-b p-6 [.border-b]:pb-4">
              <CardTitle>Matérias cadastradas</CardTitle>
              <CardDescription>
                {materias.length} disciplina{materias.length !== 1 ? 's' : ''} no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="px-4">Matéria</TableHead>
                    <TableHead className="px-4">Curso</TableHead>
                    <TableHead className="px-4 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materias.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="px-4 py-3">
                        <p className="font-medium">{m.nome}</p>
                        <p className="text-xs text-muted-foreground">ID {m.id}</p>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant="outline" className="font-medium">
                          {m.cursoNome}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleExcluir(m.id)}
                        >
                          <Trash2 />
                          Excluir
                        </Button>
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

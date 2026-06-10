import { useEffect, useMemo, useState } from 'react'
import { Clock3, GraduationCap, Layers, Plus, Trash2 } from 'lucide-react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { PageContainer } from '../components/ui/PageContainer'
import { StatCard } from '../components/ui/StatCard'
import { api } from '../services/api'
import type { Curso } from '../types/curso'
import { mensagemErroApi } from '../utils/apiError'

export function Cursos() {
  const [cursos, setCursos] = useState<Curso[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [cargaHoraria, setCargaHoraria] = useState('')
  const [duracaoSemestres, setDuracaoSemestres] = useState('')
  const [enviando, setEnviando] = useState(false)

  function carregar() {
    api
      .get<Curso[]>('/cursos')
      .then((res) => {
        setCursos(res.data)
        setErro(null)
      })
      .catch((e) => {
        setErro(mensagemErroApi(e, 'Não foi possível obter os cursos.'))
        setCursos(null)
      })
  }

  useEffect(() => {
    carregar()
  }, [])

  const stats = useMemo(() => {
    const lista = cursos ?? []
    const mediaCarga =
      lista.length > 0
        ? Math.round(lista.reduce((soma, c) => soma + c.cargaHoraria, 0) / lista.length)
        : 0
    return { total: lista.length, mediaCarga }
  }, [cursos])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setErro(null)
    setSucesso(null)
    api
      .post<Curso>('/cursos', {
        nome,
        cargaHoraria: Number(cargaHoraria),
        duracaoSemestres: Number(duracaoSemestres),
      })
      .then((res) => {
        setCursos((prev) => (prev ? [...prev, res.data] : [res.data]))
        setNome('')
        setCargaHoraria('')
        setDuracaoSemestres('')
        setSucesso('Curso cadastrado com sucesso.')
      })
      .catch((err) => setErro(mensagemErroApi(err, 'Erro ao cadastrar curso.')))
      .finally(() => setEnviando(false))
  }

  function handleExcluir(id: number) {
    if (!confirm('Excluir este curso?')) return
    api
      .delete(`/cursos/${id}`)
      .then(() => {
        setCursos((prev) => prev?.filter((c) => c.id !== id) ?? [])
        setSucesso('Curso excluído.')
      })
      .catch((err) => setErro(mensagemErroApi(err, 'Erro ao excluir curso.')))
  }

  return (
    <PageContainer>
      <PageHeader
        titulo="Cursos"
        subtitulo="Cadastro e listagem de cursos da instituição."
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}
      {sucesso ? <AlertaSucesso mensagem={sucesso} /> : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <StatCard
          titulo="Cursos"
          valor={stats.total}
          descricao="Cadastrados na instituição"
          destaque
        />
        <StatCard
          titulo="Carga horária média"
          valor={stats.total > 0 ? `${stats.mediaCarga}h` : '—'}
          descricao="Média entre os cursos"
        />
      </div>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Novo curso
          </CardTitle>
          <CardDescription>
            Informe nome, carga horária total e duração em semestres.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="curso-nome">Nome</Label>
              <Input
                id="curso-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Ex.: Engenharia de Software"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="curso-carga">Carga horária</Label>
              <Input
                id="curso-carga"
                type="number"
                min={1}
                value={cargaHoraria}
                onChange={(e) => setCargaHoraria(e.target.value)}
                required
                placeholder="3200"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="curso-semestres">Semestres</Label>
              <Input
                id="curso-semestres"
                type="number"
                min={1}
                value={duracaoSemestres}
                onChange={(e) => setDuracaoSemestres(e.target.value)}
                required
                placeholder="8"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Button type="submit" size="lg" disabled={enviando} className="px-6">
                <Plus />
                {enviando ? 'Salvando…' : 'Cadastrar curso'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {cursos === null && !erro ? <LoadingState mensagem="Carregando cursos…" /> : null}

      {cursos && cursos.length === 0 ? (
        <EmptyState
          titulo="Nenhum curso cadastrado"
          descricao="Use o formulário acima para cadastrar o primeiro curso da instituição."
          icone={<GraduationCap className="h-7 w-7" />}
        />
      ) : null}

      {cursos && cursos.length > 0 ? (
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b p-6 [.border-b]:pb-4">
            <CardTitle>Cursos cadastrados</CardTitle>
            <CardDescription>
              {cursos.length} curso{cursos.length !== 1 ? 's' : ''} registrado
              {cursos.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-4">Curso</TableHead>
                  <TableHead className="px-4">Carga horária</TableHead>
                  <TableHead className="px-4">Duração</TableHead>
                  <TableHead className="px-4 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cursos.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="px-4 py-3">
                      <p className="font-medium">{c.nome}</p>
                      <p className="text-xs text-muted-foreground">ID {c.id}</p>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge variant="secondary" className="gap-1 font-medium">
                        <Clock3 className="h-3 w-3" />
                        {c.cargaHoraria}h
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge variant="outline" className="gap-1 font-medium">
                        <Layers className="h-3 w-3" />
                        {c.duracaoSemestres} semestres
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleExcluir(c.id)}
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
      ) : null}
    </PageContainer>
  )
}

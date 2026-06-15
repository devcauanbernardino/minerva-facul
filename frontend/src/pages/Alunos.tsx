import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, Lightbulb, Plus, Users } from 'lucide-react'
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
import type { Aluno } from '../types/aluno'
import type { Curso } from '../types/curso'
import { useToast } from '../components/ui/Toast'

export function Alunos() {
  const { mostrarSucesso, mostrarErro } = useToast()
  const [alunos, setAlunos] = useState<Aluno[] | null>(null)
  const [cursos, setCursos] = useState<Curso[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [cursoId, setCursoId] = useState<string>('')
  const [bolsa, setBolsa] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    api
      .get<Curso[]>('/cursos')
      .then((res) => {
        setCursos(res.data)
        if (res.data.length > 0) {
          setCursoId(String(res.data[0].id))
        }
      })
      .catch(() => {
        setErro('Não foi possível carregar os cursos. Verifique se o backend está ativo.')
      })

    api
      .get<Aluno[]>('/alunos')
      .then((res) => {
        setAlunos(res.data)
        setErro(null)
      })
      .catch(() => {
        setErro('Não foi possível carregar os alunos. Verifique se o backend está ativo.')
        setAlunos([])
      })
  }, [])

  const iniciais = (nome: string) =>
    nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join('')

  const stats = useMemo(() => {
    const lista = alunos ?? []
    return {
      total: lista.length,
      bolsistas: lista.filter((a) => a.bolsa).length,
      cursos: new Set(lista.map((a) => a.curso.id)).size,
    }
  }, [alunos])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!cursoId) {
      setErro('Selecione um curso antes de cadastrar o aluno.')
      return
    }

    setEnviando(true)
    api
      .post<Aluno>('/alunos', {
        nome,
        email,
        senha,
        cursoId: Number(cursoId),
        bolsa,
      })
      .then((res) => {
        setAlunos((prev) => (prev ? [...prev, res.data] : [res.data]))
        setNome('')
        setEmail('')
        setSenha('')
        setBolsa(false)
        mostrarSucesso('Aluno cadastrado com sucesso.')
      })
      .catch(() => {
        mostrarErro('Erro ao cadastrar aluno. Confira os dados e tente novamente.')
      })
      .finally(() => setEnviando(false))
  }

  return (
    <PageContainer>
      <PageHeader
        titulo="Alunos"
        subtitulo="Cadastro e listagem via API acadêmica."
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard titulo="Alunos" valor={stats.total} descricao="Cadastrados no sistema" destaque />
        <StatCard titulo="Bolsistas" valor={stats.bolsistas} descricao="Com bolsa ativa" />
        <StatCard titulo="Cursos" valor={stats.cursos} descricao="Com alunos vinculados" />
      </div>

      <section className="mb-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Cadastrar novo aluno
            </CardTitle>
            <CardDescription>
              O aluno é vinculado a um curso e já pode fazer login com o e-mail e a senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="aluno-nome">Nome</Label>
                <Input
                  id="aluno-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="Nome completo"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="aluno-email">E-mail</Label>
                <Input
                  id="aluno-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="aluno@minerva.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="aluno-senha">Senha</Label>
                <Input
                  id="aluno-senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Curso</Label>
                <Select value={cursoId} onValueChange={setCursoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {cursos.map((curso) => (
                      <SelectItem key={curso.id} value={String(curso.id)}>
                        {curso.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="aluno-bolsa"
                  checked={bolsa}
                  onCheckedChange={(checked) => setBolsa(checked === true)}
                />
                <Label htmlFor="aluno-bolsa" className="cursor-pointer font-normal">
                  Aluno bolsista
                </Label>
              </div>

              <Button type="submit" size="lg" disabled={enviando} className="w-full">
                {enviando ? 'Salvando…' : 'Cadastrar aluno'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit border-minerva-dourado/30 bg-minerva-dourado/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-minerva-dourado" />
              Dicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>O curso deve existir no backend antes de cadastrar o aluno.</p>
            <p>
              Se não houver curso, cadastre um primeiro em{' '}
              <Link to="/cursos" className="font-semibold text-primary hover:underline">
                Cursos
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        {alunos === null ? (
          <LoadingState mensagem="Carregando alunos…" />
        ) : alunos.length === 0 ? (
          <EmptyState
            titulo="Nenhum aluno cadastrado"
            descricao="Cadastre o primeiro aluno usando o formulário acima."
            icone={<Users className="h-7 w-7" />}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {alunos.map((aluno) => (
              <Card key={aluno.id} className="gap-0 overflow-hidden p-0">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                      {iniciais(aluno.nome)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base font-semibold leading-tight">
                        {aluno.nome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {aluno.matricula ?? `ID ${aluno.id}`}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{aluno.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="font-medium">
                      {aluno.curso.nome}
                    </Badge>
                    {aluno.bolsa ? (
                      <Badge className="gap-1 bg-minerva-dourado/15 text-yellow-800">
                        <Award className="h-3 w-3" />
                        Bolsista
                      </Badge>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  )
}

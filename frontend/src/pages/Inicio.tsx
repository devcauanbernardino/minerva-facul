import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  GraduationCap,
  History,
  PencilLine,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatCard } from '../components/ui/StatCard'
import { PageContainer } from '../components/ui/PageContainer'
import { MinervaLogo } from '../components/MinervaLogo'
import { DashboardCharts } from '../components/dashboard/DashboardCharts'
import type { UsuarioSessao } from '../types/auth'
import { getUsuario, labelPerfil } from '../utils/auth'

type Modulo = {
  titulo: string
  descricao: string
  rota: string
  icone: React.ReactNode
  detalhe: string
}

const modulosSecretaria: Modulo[] = [
  {
    titulo: 'Cursos',
    descricao: 'Cadastrar e gerenciar cursos da instituição.',
    rota: '/cursos',
    icone: <GraduationCap className="h-5 w-5" />,
    detalhe: 'Carga horária e duração em semestres',
  },
  {
    titulo: 'Alunos',
    descricao: 'Cadastro, bolsa e vínculo com curso.',
    rota: '/alunos',
    icone: <Users className="h-5 w-5" />,
    detalhe: 'Matrícula acadêmica automática',
  },
  {
    titulo: 'Professores',
    descricao: 'Listar, editar e vincular matérias.',
    rota: '/professores',
    icone: <UserRound className="h-5 w-5" />,
    detalhe: 'Especialidade e turmas',
  },
  {
    titulo: 'Matérias',
    descricao: 'Disciplinas organizadas por curso.',
    rota: '/materias',
    icone: <BookOpen className="h-5 w-5" />,
    detalhe: 'Base para matrículas e notas',
  },
  {
    titulo: 'Matrículas',
    descricao: 'Vínculo aluno ↔ matéria e situação.',
    rota: '/matriculas',
    icone: <ClipboardList className="h-5 w-5" />,
    detalhe: 'Ativa, concluída, trancada…',
  },
]

const modulosProfessor: Modulo[] = [
  {
    titulo: 'Lançar notas',
    descricao: 'Notas e frequência das suas turmas.',
    rota: '/professor/notas',
    icone: <PencilLine className="h-5 w-5" />,
    detalhe: 'Escala 0–10 · frequência em %',
  },
]

const modulosAluno: Modulo[] = [
  {
    titulo: 'Boletim',
    descricao: 'Disciplinas e notas do semestre atual.',
    rota: '/aluno/boletim',
    icone: <BookOpen className="h-5 w-5" />,
    detalhe: 'Situação e frequência por matéria',
  },
  {
    titulo: 'Histórico',
    descricao: 'Disciplinas já concluídas ou trancadas.',
    rota: '/aluno/historico',
    icone: <History className="h-5 w-5" />,
    detalhe: 'Registro acadêmico completo',
  },
]

function modulosDoUsuario(usuario: UsuarioSessao | null) {
  if (!usuario) return []
  switch (usuario.tipo) {
    case 'SECRETARIA':
      return modulosSecretaria
    case 'PROFESSOR':
      return modulosProfessor
    case 'ALUNO':
      return modulosAluno
    default:
      return []
  }
}

function saudacao(): string {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function Inicio() {
  const [usuario, setUsuarioState] = useState<UsuarioSessao | null>(null)

  useEffect(() => {
    setUsuarioState(getUsuario())
  }, [])

  const modulos = modulosDoUsuario(usuario)
  const tituloPainel =
    usuario?.tipo === 'SECRETARIA'
      ? 'Painel da Secretaria'
      : usuario?.tipo === 'PROFESSOR'
        ? 'Painel do Professor'
        : usuario?.tipo === 'ALUNO'
          ? 'Painel do Aluno'
          : 'Painel acadêmico'

  return (
    <PageContainer largura="xl">
      {usuario ? (
        <div className="minerva-hero mb-10 minerva-animate-in">
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Badge className="mb-3 border-minerva-marmore/20 bg-minerva-marmore/15 text-minerva-marmore backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                {tituloPainel}
              </Badge>
              <p className="text-sm font-medium text-minerva-marmore/80">{saudacao()},</p>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {usuario.nome.split(' ')[0]}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-minerva-marmore/85">
                Acesse os módulos abaixo conforme suas permissões no sistema Minerva.
              </p>
            </div>
            <div className="rounded-xl bg-minerva-marmore/10 px-5 py-4 text-right backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wider text-minerva-marmore/70">
                {labelPerfil(usuario.tipo)}
              </p>
              <p className="mt-1 font-mono text-sm font-semibold text-minerva-marmore">
                {usuario.matricula}
              </p>
            </div>
          </div>
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-minerva-dourado/25 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 right-1/4 h-40 w-40 rounded-full bg-minerva-marmore/10 blur-2xl"
            aria-hidden
          />
        </div>
      ) : (
        <div className="mb-10 space-y-6 minerva-animate-in">
          <MinervaLogo variant="md" showWordmark className="mx-auto" />
          <div className="space-y-3 text-center">
            <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-minerva-dourado">
              <span className="h-px w-5 bg-minerva-dourado/60" />
              Minerva
              <span className="h-px w-5 bg-minerva-dourado/60" />
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-minerva-cinza-escuro">
              {tituloPainel}
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-minerva-cinza-escuro/85">
              Faça login para acessar o sistema acadêmico.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button size="lg" asChild>
                <Link to="/login" className="no-underline hover:no-underline">
                  Entrar
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/cadastro" className="no-underline hover:no-underline">
                  Criar conta
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {usuario ? (
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 minerva-animate-in-delay-1">
          <StatCard titulo="Perfil" valor={labelPerfil(usuario.tipo)} icone={<UserRound className="h-4 w-4" />} />
          <StatCard
            titulo="Matrícula"
            valor={usuario.matricula}
            descricao="Identificação no sistema"
            icone={<ClipboardList className="h-4 w-4" />}
          />
          <StatCard
            titulo="Módulos"
            valor={modulos.length}
            descricao="Disponíveis para você"
            icone={<Sparkles className="h-4 w-4" />}
            destaque
          />
          <StatCard
            titulo="E-mail"
            valor={usuario.email.split('@')[0]}
            descricao={usuario.email}
            icone={<BookOpen className="h-4 w-4" />}
          />
        </div>
      ) : null}

      {usuario ? (
        <div className="minerva-animate-in-delay-2">
          <div className="minerva-divider">
            <span aria-hidden />
          </div>
          <h2 className="mb-4 font-display text-lg font-semibold text-minerva-cinza-escuro">
            Visão geral
          </h2>
          <DashboardCharts usuario={usuario} />
        </div>
      ) : null}

      {usuario ? (
        <div className="minerva-animate-in-delay-3">
          <div className="minerva-divider">
            <span aria-hidden />
          </div>
          <h2 className="mb-4 font-display text-lg font-semibold text-minerva-cinza-escuro">
            Módulos disponíveis
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modulos.map((m) => (
              <Link key={m.rota} to={m.rota} className="group no-underline hover:no-underline">
                <Card className="minerva-card-hover h-full gap-0 p-6">
                  <CardContent className="flex h-full flex-col p-0">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        {m.icone}
                      </div>
                      <ArrowRight className="h-4 w-4 -translate-x-1 text-muted-foreground/40 opacity-0 transition-all group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-minerva-cinza-escuro transition-colors group-hover:text-primary">
                      {m.titulo}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {m.descricao}
                    </p>
                    <p className="mt-4 text-xs font-medium text-minerva-dourado">{m.detalhe}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {usuario?.tipo === 'SECRETARIA' ? (
        <p className="mt-10 text-sm text-muted-foreground">
          Documentação da API:{' '}
          <a
            className="font-semibold text-primary underline-offset-4 hover:underline"
            href="http://localhost:8080/swagger-ui.html"
            target="_blank"
            rel="noreferrer"
          >
            Swagger UI
          </a>
        </p>
      ) : null}
    </PageContainer>
  )
}

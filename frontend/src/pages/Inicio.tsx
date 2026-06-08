import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
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
    icone: <AcademicCapIcon className="h-6 w-6" />,
    detalhe: 'Carga horária e duração em semestres',
  },
  {
    titulo: 'Alunos',
    descricao: 'Cadastro, bolsa e vínculo com curso.',
    rota: '/alunos',
    icone: <UsersIcon className="h-6 w-6" />,
    detalhe: 'Matrícula acadêmica automática',
  },
  {
    titulo: 'Professores',
    descricao: 'Listar, editar e vincular matérias.',
    rota: '/professores',
    icone: <UserGroupIcon className="h-6 w-6" />,
    detalhe: 'Especialidade e turmas',
  },
  {
    titulo: 'Matérias',
    descricao: 'Disciplinas organizadas por curso.',
    rota: '/materias',
    icone: <BookOpenIcon className="h-6 w-6" />,
    detalhe: 'Base para matrículas e notas',
  },
  {
    titulo: 'Matrículas',
    descricao: 'Vínculo aluno ↔ matéria e situação.',
    rota: '/matriculas',
    icone: <ClipboardDocumentListIcon className="h-6 w-6" />,
    detalhe: 'Ativa, concluída, trancada…',
  },
]

const modulosProfessor: Modulo[] = [
  {
    titulo: 'Lançar notas',
    descricao: 'Notas e frequência das suas turmas.',
    rota: '/professor/notas',
    icone: <ClipboardDocumentListIcon className="h-6 w-6" />,
    detalhe: 'Escala 0–10 · frequência em %',
  },
]

const modulosAluno: Modulo[] = [
  {
    titulo: 'Boletim',
    descricao: 'Disciplinas e notas do semestre atual.',
    rota: '/aluno/boletim',
    icone: <BookOpenIcon className="h-6 w-6" />,
    detalhe: 'Situação e frequência por matéria',
  },
  {
    titulo: 'Histórico',
    descricao: 'Disciplinas já concluídas ou trancadas.',
    rota: '/aluno/historico',
    icone: <AcademicCapIcon className="h-6 w-6" />,
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
        <div className="minerva-hero mb-10">
          <div className="relative z-10">
            <p className="text-sm font-medium text-minerva-marmore/80">{saudacao()},</p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {usuario.nome.split(' ')[0]}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-minerva-marmore/85">
              {tituloPainel} · Acesse os módulos abaixo conforme suas permissões no sistema Minerva.
            </p>
          </div>
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-minerva-dourado/20 blur-2xl"
            aria-hidden
          />
        </div>
      ) : (
        <div className="mb-10 space-y-6">
          <MinervaLogo variant="md" showWordmark className="mx-auto" />
          <div className="space-y-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-minerva-dourado">Minerva</p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-minerva-cinza-escuro">
              {tituloPainel}
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-minerva-cinza-escuro/85">
              Faça login para acessar o sistema acadêmico.
            </p>
          </div>
        </div>
      )}

      {usuario ? (
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard titulo="Perfil" valor={labelPerfil(usuario.tipo)} />
          <StatCard titulo="Matrícula" valor={usuario.matricula} descricao="Identificação no sistema" />
          <StatCard
            titulo="Módulos"
            valor={modulos.length}
            descricao="Disponíveis para você"
            destaque
          />
          <StatCard titulo="E-mail" valor={usuario.email.split('@')[0]} descricao={usuario.email} />
        </div>
      ) : (
        <div className="mb-8 rounded-xl border border-minerva-dourado/25 bg-minerva-dourado/10 px-5 py-4 text-sm">
          Você não está logado.{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>{' '}
          ou{' '}
          <Link to="/cadastro" className="font-semibold text-primary hover:underline">
            criar conta
          </Link>
          .
        </div>
      )}

      {usuario ? (
        <>
          <h2 className="mb-4 font-display text-lg font-semibold text-minerva-cinza-escuro">
            Visão geral
          </h2>
          <DashboardCharts usuario={usuario} />
        </>
      ) : null}

      {usuario ? (
        <>
          <h2 className="mb-4 font-display text-lg font-semibold text-minerva-cinza-escuro">
            Módulos disponíveis
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modulos.map((m) => (
              <Link
                key={m.rota}
                to={m.rota}
                className="group minerva-card-hover flex flex-col p-6 no-underline hover:no-underline"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-minerva-marmore">
                  {m.icone}
                </div>
                <h3 className="font-display text-lg font-semibold text-minerva-cinza-escuro group-hover:text-primary">
                  {m.titulo}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-minerva-cinza-escuro/75">
                  {m.descricao}
                </p>
                <p className="mt-4 text-xs font-medium text-minerva-dourado">{m.detalhe}</p>
              </Link>
            ))}
          </div>
        </>
      ) : null}

      {usuario?.tipo === 'SECRETARIA' ? (
        <p className="mt-10 text-sm text-minerva-cinza-escuro/60">
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

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { UsuarioSessao } from '../types/auth'
import { getUsuario, labelPerfil, logout } from '../utils/auth'

const modulosSecretaria = [
  { titulo: 'Cursos', descricao: 'Cadastrar e listar cursos.', rota: '/cursos' },
  { titulo: 'Alunos', descricao: 'Gestão de alunos.', rota: '/alunos' },
  { titulo: 'Professores', descricao: 'Listar e editar professores.', rota: '/professores' },
  { titulo: 'Matérias', descricao: 'Disciplinas por curso.', rota: '/materias' },
  { titulo: 'Matrículas', descricao: 'Vínculo aluno ↔ matéria.', rota: '/matriculas' },
]

const modulosProfessor = [
  { titulo: 'Lançar notas', descricao: 'Notas e frequência das turmas.', rota: '/professor/notas' },
]

const modulosAluno = [
  { titulo: 'Boletim', descricao: 'Notas do semestre atual.', rota: '/aluno/boletim' },
  { titulo: 'Histórico', descricao: 'Disciplinas já cursadas.', rota: '/aluno/historico' },
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

export function Inicio() {
  const navigate = useNavigate()
  const [usuario, setUsuarioState] = useState<UsuarioSessao | null>(null)

  useEffect(() => {
    setUsuarioState(getUsuario())
  }, [])

  function sair() {
    logout()
    navigate('/login')
  }

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
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          Minerva
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-minerva-cinza-escuro">
          {tituloPainel}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-minerva-cinza-escuro/85">
          Acesso conforme seu perfil no sistema.
        </p>
      </div>

      {usuario ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore px-5 py-4 shadow-sm">
          <div>
            <p className="text-sm text-minerva-cinza-escuro/70">
              {labelPerfil(usuario.tipo)}
            </p>
            <p className="font-semibold text-minerva-cinza-escuro">{usuario.nome}</p>
            <p className="font-mono text-xs text-primary">{usuario.matricula}</p>
          </div>
          <button
            type="button"
            onClick={sair}
            className="rounded-lg border border-minerva-cinza-escuro/15 px-4 py-2 text-sm font-semibold text-primary hover:bg-minerva-cinza-claro"
          >
            Sair
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-accent/25 bg-accent/10 px-5 py-4 text-sm text-minerva-cinza-escuro">
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
        <div className="grid gap-4 sm:grid-cols-2">
          {modulos.map((m) => (
            <Link
              key={m.rota}
              to={m.rota}
              className="group rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <h2 className="font-display text-lg font-semibold text-minerva-cinza-escuro group-hover:text-primary">
                {m.titulo}
              </h2>
              <p className="mt-2 text-sm text-minerva-cinza-escuro/75">{m.descricao}</p>
            </Link>
          ))}
        </div>
      ) : null}

      {usuario?.tipo === 'SECRETARIA' ? (
        <p className="text-sm">
          <a
            className="font-semibold text-primary underline-offset-4 hover:underline"
            href="http://localhost:8080/swagger-ui.html"
            target="_blank"
            rel="noreferrer"
          >
            Abrir Swagger
          </a>
        </p>
      ) : null}

      {!usuario ? (
        <p className="text-xs text-minerva-cinza-escuro/60">
          Secretaria (dev): matrícula <span className="font-mono">SECRETARIA.0001</span> · senha{' '}
          <span className="font-mono">secretaria123</span>
        </p>
      ) : null}
    </div>
  )
}

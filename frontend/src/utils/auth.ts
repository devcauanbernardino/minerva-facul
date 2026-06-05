import type { TipoUsuario, UsuarioSessao } from '../types/auth'

const STORAGE_KEY = 'minerva_usuario'

function resolverTipo(dados: Partial<UsuarioSessao>): TipoUsuario {
  const tipo = dados.tipo?.trim().toUpperCase()
  if (tipo === 'SECRETARIA' || tipo === 'PROFESSOR' || tipo === 'ALUNO') {
    return tipo
  }
  if (dados.matricula?.startsWith('SECRETARIA')) return 'SECRETARIA'
  return 'ALUNO'
}

export function getUsuario(): UsuarioSessao | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<UsuarioSessao>
    if (!parsed.id || !parsed.nome || !parsed.email || !parsed.matricula) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    return {
      id: parsed.id,
      nome: parsed.nome,
      email: parsed.email,
      matricula: parsed.matricula,
      tipo: resolverTipo(parsed),
    }
  } catch {
    sessionStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function setUsuario(usuario: UsuarioSessao) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(usuario))
}

export function logout() {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function labelPerfil(tipo: TipoUsuario): string {
  switch (tipo) {
    case 'SECRETARIA':
      return 'Secretaria Acadêmica'
    case 'PROFESSOR':
      return 'Professor'
    case 'ALUNO':
      return 'Aluno'
  }
}

type RotaConfig = {
  to: string
  label: string
  perfis: TipoUsuario[]
}

export const rotasPorPerfil: RotaConfig[] = [
  { to: '/cursos', label: 'Cursos', perfis: ['SECRETARIA'] },
  { to: '/alunos', label: 'Alunos', perfis: ['SECRETARIA'] },
  { to: '/professores', label: 'Professores', perfis: ['SECRETARIA'] },
  { to: '/materias', label: 'Matérias', perfis: ['SECRETARIA'] },
  { to: '/matriculas', label: 'Matrículas', perfis: ['SECRETARIA'] },
  { to: '/professor/notas', label: 'Notas', perfis: ['PROFESSOR'] },
  { to: '/aluno/boletim', label: 'Boletim', perfis: ['ALUNO'] },
  { to: '/aluno/historico', label: 'Histórico', perfis: ['ALUNO'] },
]

export function navDoUsuario(usuario: UsuarioSessao | null) {
  if (!usuario) return []
  return rotasPorPerfil.filter((r) => r.perfis.includes(usuario.tipo))
}

export function podeAcessar(pathname: string, usuario: UsuarioSessao | null): boolean {
  const publicas = ['/login', '/cadastro']
  if (publicas.includes(pathname)) return true
  if (!usuario) return false
  if (pathname === '/') return true

  const rota = rotasPorPerfil.find((r) => pathname === r.to || pathname.startsWith(`${r.to}/`))
  if (!rota) return usuario.tipo === 'SECRETARIA'
  return rota.perfis.includes(usuario.tipo)
}

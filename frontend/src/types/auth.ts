export type TipoUsuario = 'ALUNO' | 'PROFESSOR' | 'SECRETARIA'

export type UsuarioSessao = {
  id: number
  nome: string
  email: string
  matricula: string
  tipo: TipoUsuario
}

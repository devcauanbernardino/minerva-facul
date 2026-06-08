export type SituacaoMatricula =
  | 'ATIVA'
  | 'CONCLUIDA'
  | 'CANCELADA'
  | 'REPROVADA'
  | 'TRANCADA'

export type Matricula = {
  id: number
  alunoId: number
  alunoNome: string
  materiaId: number
  materiaNome: string
  cursoNome: string
  dataCriacao: string
  situacao: SituacaoMatricula
  nota: number | null
  frequencia: number | null
}

export type MatriculaRequest = {
  alunoId: number
  materiaId: number
  situacao: SituacaoMatricula
}

export type NotasRequest = {
  nota: number
  frequencia: number
}

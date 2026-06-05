export type Matricula = {
  id: number
  alunoNome: string
  materiaNome: string
  dataCriacao: string
  situacao: 'ATIVA' | 'CONCLUIDA' | 'CANCELADA'
}

export type DisciplinaAcademica = {
  materiaId: number
  materiaNome: string
  situacao: string
  nota: number | null
  frequencia: number | null
}

export type Boletim = {
  nome: string
  email: string
  cursoNome: string
  bolsa: boolean
  disciplinas: DisciplinaAcademica[]
}

export type Historico = Boletim

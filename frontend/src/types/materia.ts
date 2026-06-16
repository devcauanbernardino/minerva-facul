export type Materia = {
  id: number
  nome: string
  cursoId: number
  cursoNome: string
  prerequisitoIds: number[]
  professorIds: number[]
}

export type MateriaRequest = {
  nome: string
  cursoId: number
  prerequisitoIds: number[]
}
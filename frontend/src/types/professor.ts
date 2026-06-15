export type Professor = {
  id: number
  nome: string
  email: string
  matricula?: string
  especialidade?: string
  materiaIds?: number[]
}
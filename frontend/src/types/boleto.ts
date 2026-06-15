import type { TipoUsuario } from './auth'

export type Boleto = {
  id: number
  alunoId: number
  alunoNome: string
  valor: number
  vencimento: string
  status: string
  referencia: string
  dataPagamento: string | null
}

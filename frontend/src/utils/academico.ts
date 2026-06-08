import type { DisciplinaAcademica } from '../types/academico'

export function labelSituacaoBoletim(situacao: string): string {
  switch (situacao) {
    case 'ATIVA':
      return 'Cursando'
    case 'DISPONIVEL':
      return 'Não matriculado'
    case 'CONCLUIDA':
      return 'Concluída'
    case 'REPROVADA':
      return 'Reprovada'
    case 'TRANCADA':
      return 'Trancada'
    default:
      return situacao
  }
}

export function labelSituacaoHistorico(situacao: string): string {
  switch (situacao) {
    case 'CONCLUIDA':
      return 'Aprovada'
    case 'REPROVADA':
      return 'Reprovada'
    case 'TRANCADA':
      return 'Trancada'
    default:
      return situacao
  }
}

export function formatarNota(valor: number | null | undefined): string {
  return valor == null ? '—' : valor.toFixed(1)
}

export function formatarFrequencia(valor: number | null | undefined): string {
  return valor == null ? '—' : `${valor.toFixed(0)}%`
}

export function calcularMediaNotas(disciplinas: DisciplinaAcademica[]): number | null {
  const comNota = disciplinas.filter((d) => d.nota != null)
  if (comNota.length === 0) return null
  const soma = comNota.reduce((acc, d) => acc + (d.nota ?? 0), 0)
  return soma / comNota.length
}

export function contarPorSituacao(
  disciplinas: DisciplinaAcademica[],
  situacoes: string[],
): number {
  const normalizadas = situacoes.map((s) => s.toUpperCase())
  return disciplinas.filter((d) => normalizadas.includes(d.situacao.toUpperCase())).length
}

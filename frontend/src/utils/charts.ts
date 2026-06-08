export const CHART_COLORS = {
  primary: '#8b1e1e',
  accent: '#d4af37',
  emerald: '#059669',
  sky: '#0284c7',
  amber: '#d97706',
  red: '#dc2626',
  slate: '#64748b',
  muted: '#94a3b8',
} as const

export const SITUACAO_CHART_COLORS: Record<string, string> = {
  ATIVA: CHART_COLORS.emerald,
  CURSANDO: CHART_COLORS.emerald,
  CONCLUIDA: CHART_COLORS.sky,
  APROVADA: CHART_COLORS.sky,
  REPROVADA: CHART_COLORS.red,
  TRANCADA: CHART_COLORS.amber,
  CANCELADA: CHART_COLORS.slate,
  DISPONIVEL: CHART_COLORS.muted,
  BOLSISTA: CHART_COLORS.accent,
  REGULAR: CHART_COLORS.sky,
}

export const SITUACAO_LABELS: Record<string, string> = {
  ATIVA: 'Ativa',
  CONCLUIDA: 'Concluída',
  REPROVADA: 'Reprovada',
  TRANCADA: 'Trancada',
  CANCELADA: 'Cancelada',
  DISPONIVEL: 'Disponível',
}

export function encurtarNome(nome: string, max = 18): string {
  if (nome.length <= max) return nome
  return `${nome.slice(0, max - 1)}…`
}

export function agruparContagem(
  itens: string[],
  labels: Record<string, string> = SITUACAO_LABELS,
): { name: string; value: number; key: string }[] {
  const map = new Map<string, number>()
  for (const item of itens) {
    const key = item.trim().toUpperCase()
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([key, value]) => ({
    key,
    name: labels[key] ?? key,
    value,
  }))
}

const FAIXAS_NOTA = [
  { name: 'Insuficiente (0–5)', min: 0, max: 5, cor: CHART_COLORS.red },
  { name: 'Regular (5–7)', min: 5, max: 7, cor: CHART_COLORS.amber },
  { name: 'Bom (7–9)', min: 7, max: 9, cor: CHART_COLORS.sky },
  { name: 'Excelente (9–10)', min: 9, max: 10.01, cor: CHART_COLORS.emerald },
] as const

export function agruparNotasPorFaixa(
  notas: (number | null | undefined)[],
): { name: string; value: number; cor: string }[] {
  const validas = notas.filter((n): n is number => n != null && !Number.isNaN(n))
  return FAIXAS_NOTA.map((faixa) => ({
    name: faixa.name,
    cor: faixa.cor,
    value: validas.filter((n) => n >= faixa.min && n < faixa.max).length,
  }))
}

export function contagemPorCampo<T>(
  itens: T[],
  getCampo: (item: T) => string,
  max = 8,
): { name: string; value: number }[] {
  const map = new Map<string, number>()
  for (const item of itens) {
    const chave = getCampo(item)
    map.set(chave, (map.get(chave) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name: encurtarNome(name, 16), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, max)
}

export function mediaNotasPorCampo<T>(
  itens: T[],
  getCampo: (item: T) => string,
  getNota: (item: T) => number | null | undefined,
  max = 8,
): { name: string; value: number }[] {
  const map = new Map<string, { total: number; count: number }>()
  for (const item of itens) {
    const nota = getNota(item)
    if (nota == null || Number.isNaN(nota)) continue
    const chave = getCampo(item)
    const atual = map.get(chave) ?? { total: 0, count: 0 }
    map.set(chave, { total: atual.total + nota, count: atual.count + 1 })
  }
  return Array.from(map.entries())
    .map(([name, { total, count }]) => ({
      name: encurtarNome(name, 16),
      value: Math.round((total / count) * 10) / 10,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, max)
}

export function agruparBolsa(alunos: { bolsa: boolean }[]): { name: string; value: number; key: string }[] {
  const bolsistas = alunos.filter((a) => a.bolsa).length
  const regulares = alunos.length - bolsistas
  return [
    { key: 'BOLSISTA', name: 'Bolsistas', value: bolsistas },
    { key: 'REGULAR', name: 'Sem bolsa', value: regulares },
  ].filter((item) => item.value > 0)
}

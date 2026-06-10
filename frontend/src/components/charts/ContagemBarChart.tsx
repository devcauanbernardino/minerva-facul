import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from './ChartCard'
import { CHART_COLORS } from '../../utils/charts'

type ContagemBarChartProps = {
  titulo: string
  descricao?: string
  dados: { name: string; value: number }[]
  cor?: string
  vazio?: string
}

export function ContagemBarChart({
  titulo,
  descricao,
  dados,
  cor = CHART_COLORS.primary,
  vazio,
}: ContagemBarChartProps) {
  const total = dados.reduce((acc, item) => acc + item.value, 0)

  return (
    <ChartCard titulo={titulo} descricao={descricao}>
      {total === 0 ? (
        <p className="py-16 text-center text-sm text-minerva-cinza-escuro/55">
          {vazio ?? 'Sem dados para exibir.'}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dados} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,46,46,0.08)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} width={32} />
            <Tooltip
              formatter={(value) => [value ?? 0, 'Total']}
              contentStyle={{
                borderRadius: '0.75rem',
                border: '1px solid rgba(46,46,46,0.1)',
                fontSize: '0.875rem',
              }}
            />
            <Bar dataKey="value" fill={cor} radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

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

type MediaBarChartProps = {
  titulo: string
  descricao?: string
  dados: { name: string; value: number }[]
  cor?: string
  vazio?: string
}

export function MediaBarChart({
  titulo,
  descricao,
  dados,
  cor = CHART_COLORS.primary,
  vazio,
}: MediaBarChartProps) {
  const total = dados.length

  return (
    <ChartCard titulo={titulo} descricao={descricao}>
      {total === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {vazio ?? 'Sem médias para exibir.'}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dados} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,46,46,0.08)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#64748b' }}
              interval={0}
              angle={dados.length > 4 ? -18 : 0}
              textAnchor={dados.length > 4 ? 'end' : 'middle'}
              height={dados.length > 4 ? 56 : 32}
            />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#64748b' }} width={32} />
            <Tooltip
              formatter={(value) => [value ?? 0, 'Média']}
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

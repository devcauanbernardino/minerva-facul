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

type FrequenciaBarChartProps = {
  titulo: string
  descricao?: string
  dados: { name: string; value: number }[]
  vazio?: string
}

export function FrequenciaBarChart({
  titulo,
  descricao,
  dados,
  vazio,
}: FrequenciaBarChartProps) {
  const total = dados.length

  return (
    <ChartCard titulo={titulo} descricao={descricao}>
      {total === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {vazio ?? 'Nenhuma frequência registrada.'}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
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
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} width={36} />
            <Tooltip
              formatter={(value) => [`${value ?? 0}%`, 'Frequência']}
              contentStyle={{
                borderRadius: '0.75rem',
                border: '1px solid rgba(46,46,46,0.1)',
                fontSize: '0.875rem',
              }}
            />
            <Bar
              dataKey="value"
              fill={CHART_COLORS.accent}
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

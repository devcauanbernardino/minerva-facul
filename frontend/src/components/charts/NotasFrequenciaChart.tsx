import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from './ChartCard'
import { CHART_COLORS } from '../../utils/charts'

export type NotaFrequenciaDado = {
  nome: string
  nota: number | null
  frequencia: number | null
}

type NotasFrequenciaChartProps = {
  titulo: string
  descricao?: string
  dados: NotaFrequenciaDado[]
  vazio?: string
}

export function NotasFrequenciaChart({
  titulo,
  descricao,
  dados,
  vazio,
}: NotasFrequenciaChartProps) {
  const chartData = dados
    .filter((d) => d.nota != null || d.frequencia != null)
    .map((d) => ({
      nome: d.nome,
      Nota: d.nota ?? 0,
      'Freq. (%)': d.frequencia ?? 0,
    }))

  return (
    <ChartCard titulo={titulo} descricao={descricao}>
      {chartData.length === 0 ? (
        <p className="py-16 text-center text-sm text-minerva-cinza-escuro/55">
          {vazio ?? 'Nenhuma nota ou frequência lançada ainda.'}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,46,46,0.08)" vertical={false} />
            <XAxis
              dataKey="nome"
              tick={{ fontSize: 11, fill: '#64748b' }}
              interval={0}
              angle={chartData.length > 4 ? -18 : 0}
              textAnchor={chartData.length > 4 ? 'end' : 'middle'}
              height={chartData.length > 4 ? 56 : 32}
            />
            <YAxis
              yAxisId="nota"
              domain={[0, 10]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              width={32}
            />
            <YAxis
              yAxisId="freq"
              orientation="right"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              width={36}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '0.75rem',
                border: '1px solid rgba(46,46,46,0.1)',
                fontSize: '0.875rem',
              }}
            />
            <Legend verticalAlign="top" height={28} iconType="circle" />
            <Bar
              yAxisId="nota"
              dataKey="Nota"
              fill={CHART_COLORS.primary}
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              yAxisId="freq"
              dataKey="Freq. (%)"
              fill={CHART_COLORS.accent}
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

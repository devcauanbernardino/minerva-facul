import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { ChartCard } from './ChartCard'
import { CHART_COLORS, SITUACAO_CHART_COLORS } from '../../utils/charts'

type SituacaoPieChartProps = {
  titulo: string
  descricao?: string
  dados: { name: string; value: number; key?: string }[]
  vazio?: string
}

export function SituacaoPieChart({ titulo, descricao, dados, vazio }: SituacaoPieChartProps) {
  const total = dados.reduce((acc, item) => acc + item.value, 0)

  return (
    <ChartCard titulo={titulo} descricao={descricao}>
      {total === 0 ? (
        <p className="py-16 text-center text-sm text-minerva-cinza-escuro/55">
          {vazio ?? 'Sem dados para exibir.'}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={dados}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={92}
              paddingAngle={3}
            >
              {dados.map((item) => (
                <Cell
                  key={item.name}
                  fill={SITUACAO_CHART_COLORS[item.key ?? item.name.toUpperCase()] ?? CHART_COLORS.primary}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [value ?? 0, 'Quantidade']}
              contentStyle={{
                borderRadius: '0.75rem',
                border: '1px solid rgba(46,46,46,0.1)',
                fontSize: '0.875rem',
              }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

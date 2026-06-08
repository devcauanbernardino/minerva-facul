import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from './ChartCard'

type DistribuicaoNotasChartProps = {
  titulo: string
  descricao?: string
  dados: { name: string; value: number; cor: string }[]
  vazio?: string
}

export function DistribuicaoNotasChart({
  titulo,
  descricao,
  dados,
  vazio,
}: DistribuicaoNotasChartProps) {
  const total = dados.reduce((acc, item) => acc + item.value, 0)

  return (
    <ChartCard titulo={titulo} descricao={descricao}>
      {total === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {vazio ?? 'Nenhuma nota lançada para exibir.'}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={dados} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,46,46,0.08)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#64748b' }}
              interval={0}
              angle={-12}
              textAnchor="end"
              height={48}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} width={32} />
            <Tooltip
              formatter={(value) => [value ?? 0, 'Quantidade']}
              contentStyle={{
                borderRadius: '0.75rem',
                border: '1px solid rgba(46,46,46,0.1)',
                fontSize: '0.875rem',
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
              {dados.map((item) => (
                <Cell key={item.name} fill={item.cor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

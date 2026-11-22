import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

export function CompletionChart({ completed, remaining, rate }: { completed: number; remaining: number; rate: number }) {
  const data = [{ name: 'Completed', value: Math.max(0, completed) }, { name: 'Remaining', value: Math.max(0, remaining) }]
  const total = completed + remaining
  return <div className="chart-wrap" role="img" aria-label={`${completed} story points completed, ${remaining} remaining`}>
    {total > 0 ? <ResponsiveContainer width="100%" height="100%">
      <PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={66} outerRadius={86} paddingAngle={3} stroke="none">
        <Cell fill="#1868db" /><Cell fill="#dfe1e6" />
      </Pie><Tooltip formatter={value => [`${value ?? 0} points`]} /></PieChart>
    </ResponsiveContainer> : <div className="chart-empty">No story point data</div>}
    <div className="chart-center"><strong>{Math.round(rate)}%</strong><span>complete</span></div>
  </div>
}

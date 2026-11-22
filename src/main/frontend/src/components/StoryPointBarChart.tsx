import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function StoryPointBarChart({ completed, remaining }: { completed: number; remaining: number }) {
  if (completed + remaining <= 0) return <div className="chart-empty">No story point data</div>
  return <div className="story-bar-chart" role="img" aria-label={`${completed} story points completed, ${remaining} remaining`}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={[{ sprint: 'Sprint scope', completed, remaining }]} layout="vertical" margin={{ top: 12, right: 16, bottom: 2, left: 8 }} barSize={26}>
        <CartesianGrid stroke="#f0f1f3" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#8993a5', fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="sprint" hide />
        <Tooltip formatter={value => [`${value ?? 0} points`]} />
        <Legend verticalAlign="bottom" height={25} iconType="circle" iconSize={7} formatter={value => <span className="bar-legend-label">{value === 'completed' ? 'Completed' : 'Remaining'}</span>} />
        <Bar dataKey="completed" stackId="points" fill="#1868db" radius={[5, 0, 0, 5]} />
        <Bar dataKey="remaining" stackId="points" fill="#dfe1e6" radius={[0, 5, 5, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
}

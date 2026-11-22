import type { LucideIcon } from 'lucide-react'

export function MetricCard({ label, value, note, icon: Icon, tone = 'blue' }: {
  label: string; value: string | number; note: string; icon: LucideIcon; tone?: string
}) {
  return <article className="metric-card">
    <div className={`metric-icon tone-${tone}`}><Icon size={18} aria-hidden="true" /></div>
    <div className="metric-label">{label}</div>
    <div className="metric-value">{value}</div>
    <div className="metric-note">{note}</div>
  </article>
}

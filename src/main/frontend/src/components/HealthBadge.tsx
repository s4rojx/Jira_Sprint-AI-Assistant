import { Check, CircleAlert, TriangleAlert } from 'lucide-react'

export function HealthBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase()
  const Icon = normalized === 'HEALTHY' ? Check : normalized === 'WATCH' ? TriangleAlert : CircleAlert
  const label = normalized === 'AT_RISK' ? 'At risk' : normalized === 'WATCH' ? 'Needs attention' : normalized === 'HEALTHY' ? 'Healthy' : status
  return <span className={`health-badge health-${normalized.toLowerCase()}`}><Icon size={14} aria-hidden="true" />{label}</span>
}

import { ChevronDown } from 'lucide-react'
import type { SprintSummary } from '../types/sprint'

export function SprintSelector({ sprints, value, onChange }: {
  sprints: SprintSummary[]; value: string; onChange: (id: string) => void
}) {
  return <label className="sprint-select-wrap">
    <span className="sr-only">Select sprint</span>
    <select className="sprint-select" value={value} onChange={event => onChange(event.target.value)} aria-label="Select sprint">
      {sprints.map(sprint => <option key={sprint.id} value={sprint.id}>{sprint.name}{sprint.state.toLowerCase() === 'active' ? ' · Active' : ''}</option>)}
    </select>
    <ChevronDown size={15} aria-hidden="true" />
  </label>
}

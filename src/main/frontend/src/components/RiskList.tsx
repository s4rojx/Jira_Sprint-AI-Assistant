import { useState } from 'react'
import { ChevronDown, ChevronRight, ShieldAlert } from 'lucide-react'
import type { RiskItem } from '../types/sprint'

export function RiskList({ risks }: { risks: RiskItem[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  if (!risks.length) return <div className="empty-inline"><ShieldAlert size={18} />No at-risk issues were identified.</div>
  return <div className="risk-list">{risks.map(risk => {
    const open = expanded === risk.issueKey
    return <article className="risk-item" key={risk.issueKey}>
      <button className="risk-toggle" onClick={() => setExpanded(open ? null : risk.issueKey)} aria-expanded={open}>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span className="issue-key">{risk.issueKey}</span><span className="risk-summary">{risk.summary}</span>
        <span className={`risk-level risk-${risk.riskLevel.toLowerCase()}`}>{risk.riskLevel}</span>
        <span className="risk-score">{Math.round(risk.riskScore * 100)}%</span>
      </button>
      {open && <div className="risk-details">
        <div><h4>Risk factors</h4><ul>{risk.factors.map((factor, i) => <li key={`${i}-${factor}`}>{factor}</li>)}</ul></div>
        <div><h4>Suggested mitigations</h4><ul>{risk.mitigations.map((mitigation, i) => <li key={`${i}-${mitigation}`}>{mitigation}</li>)}</ul></div>
      </div>}
    </article>
  })}</div>
}

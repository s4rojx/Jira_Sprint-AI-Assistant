import { ArrowUpRight, UserRound } from 'lucide-react'
import type { AssignmentRecommendation } from '../types/sprint'

export function RecommendationList({ recommendations }: { recommendations: AssignmentRecommendation[] }) {
  if (!recommendations.length) return <div className="empty-inline"><UserRound size={18} />No assignment recommendations right now.</div>
  return <div className="recommendation-list">{recommendations.map(item => <article className="recommendation-row" key={item.issueKey}>
    <div className="recommendation-avatar">{item.recommendedAssignee.slice(0, 1).toUpperCase()}</div>
    <div className="recommendation-main"><div><span className="issue-key">{item.issueKey}</span><span className="recommendation-title">{item.issueSummary}</span></div>
      <p>Assign to <strong>{item.recommendedAssignee}</strong> · {item.reason}</p></div>
    <div className="confidence"><strong>{Math.round(item.confidence * 100)}%</strong><span>match</span></div>
    <ArrowUpRight className="recommendation-arrow" size={16} aria-hidden="true" />
  </article>)}</div>
}

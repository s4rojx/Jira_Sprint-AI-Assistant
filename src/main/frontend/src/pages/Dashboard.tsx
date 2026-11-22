import { ArrowRight, CalendarDays, CheckCircle2, CircleDashed, Clock3, ExternalLink, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CompletionChart } from '../components/CompletionChart'
import { HealthBadge } from '../components/HealthBadge'
import { MetricCard } from '../components/MetricCard'
import { RecommendationList } from '../components/RecommendationList'
import type { SprintWorkspace } from '../types/sprint'

const date = (value: string | null) => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Not set'

export function Dashboard({ workspace }: { workspace: SprintWorkspace }) {
  const { sprint, analysis, health, recommendations } = workspace
  const remainingPoints = Math.max(0, Number(analysis.totalStoryPoints) - Number(analysis.completedStoryPoints))
  return <div className="page-content">
    <section className="sprint-hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" />ACTIVE SPRINT</div>
        <div className="hero-title-row"><h2>{sprint.name}</h2><HealthBadge status={health.status} /></div>
        <p className="hero-goal">{sprint.goal || 'Keep the team focused and make steady progress toward the sprint goal.'}</p>
        <div className="hero-meta"><span><CalendarDays size={15} />{date(sprint.startDate)} – {date(sprint.endDate)}</span><span><CircleDashed size={15} />{sprint.state}</span></div>
        <div className="hero-progress-label"><span>Story point completion</span><strong>{Math.round(Number(analysis.completionRate))}%</strong></div>
        <div className="progress-track" aria-label={`${Math.round(Number(analysis.completionRate))}% story points completed`}><span style={{ width: `${Math.max(0, Math.min(100, Number(analysis.completionRate)))}%` }} /></div>
        <p className="health-reason">{health.statusReason}</p>
      </div>
      <div className="hero-chart"><CompletionChart completed={Number(analysis.completedStoryPoints)} remaining={remainingPoints} rate={Number(analysis.completionRate)} />
        <div className="chart-legend"><span><i className="legend-completed" />Completed <strong>{analysis.completedStoryPoints}</strong></span><span><i className="legend-remaining" />Remaining <strong>{remainingPoints}</strong></span></div>
      </div>
    </section>

    <div className="metric-grid">
      <MetricCard label="Total issues" value={analysis.totalIssues} note="In this sprint" icon={CircleDashed} tone="blue" />
      <MetricCard label="Completed" value={analysis.completedIssues} note={`${analysis.totalIssues ? Math.round(analysis.completedIssues / analysis.totalIssues * 100) : 0}% of all issues`} icon={CheckCircle2} tone="green" />
      <MetricCard label="In progress" value={analysis.inProgressIssues} note="Currently being worked on" icon={Clock3} tone="purple" />
      <MetricCard label="Blocked" value={analysis.blockedIssues} note={analysis.blockedIssues ? 'Needs team attention' : 'No blocked issues'} icon={ExternalLink} tone={analysis.blockedIssues ? 'red' : 'slate'} />
    </div>

    <section className="panel recommendations-panel">
      <div className="panel-heading"><div><div className="section-kicker"><Sparkles size={14} />TEAM FOCUS</div><h3>Recommended next steps</h3><p>Actions based on the current sprint health.</p></div>
        <Link to="/insights" className="text-link">View AI insights <ArrowRight size={15} /></Link></div>
      <div className="health-recommendations">{health.recommendations.length ? health.recommendations.map((item, i) => <div className="health-recommendation" key={`${i}-${item}`}><span className="step-index">{String(i + 1).padStart(2, '0')}</span><span>{item}</span></div>) : <div className="calm-state"><CheckCircle2 size={18} />Sprint is in good shape. No immediate actions needed.</div>}</div>
      {recommendations.length > 0 && <div className="assignment-preview"><div className="subsection-title">Assignment suggestions <Link to="/insights">See all</Link></div><RecommendationList recommendations={recommendations.slice(0, 3)} /></div>}
    </section>
  </div>
}

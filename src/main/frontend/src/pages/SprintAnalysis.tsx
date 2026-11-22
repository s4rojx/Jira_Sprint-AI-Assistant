import { Activity, CircleAlert, CircleDashed, Clock3, Users } from 'lucide-react'
import { HealthBadge } from '../components/HealthBadge'
import { IssueTable } from '../components/IssueTable'
import { MetricCard } from '../components/MetricCard'
import { StoryPointBarChart } from '../components/StoryPointBarChart'
import type { SprintWorkspace } from '../types/sprint'

export function SprintAnalysis({ workspace }: { workspace: SprintWorkspace }) {
  const { sprint, analysis, health } = workspace
  const workload = Object.entries(analysis.workloadByAssignee).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  const remainingPoints = Math.max(0, Number(analysis.totalStoryPoints) - Number(analysis.completedStoryPoints))
  return <div className="page-content">
    <div className="analysis-overview">
      <div className="analysis-title"><div className="section-kicker">SPRINT REVIEW</div><h2>{sprint.name}</h2><p>{sprint.goal || 'Review delivery progress, team workload, and issues included in this sprint.'}</p></div>
      <HealthBadge status={health.status} />
    </div>
    <div className="metric-grid">
      <MetricCard label="Total issues" value={analysis.totalIssues} note="Sprint scope" icon={CircleDashed} />
      <MetricCard label="Completed" value={analysis.completedIssues} note={`${analysis.completionRate}% story points`} icon={Activity} tone="green" />
      <MetricCard label="In progress" value={analysis.inProgressIssues} note="Active work" icon={Clock3} tone="purple" />
      <MetricCard label="Blocked" value={analysis.blockedIssues} note={`${analysis.unassignedActiveIssues} unassigned`} icon={CircleAlert} tone="red" />
    </div>
    <div className="analysis-grid">
      <section className="panel chart-panel"><div className="panel-heading"><div><h3>Story point progress</h3><p>Completed work against the sprint commitment.</p></div></div>
        <div className="analysis-chart-row"><StoryPointBarChart completed={Number(analysis.completedStoryPoints)} remaining={remainingPoints} /><div className="chart-stats"><div><span>Committed</span><strong>{analysis.totalStoryPoints}<small> pts</small></strong></div><div><span>Completed</span><strong>{analysis.completedStoryPoints}<small> pts</small></strong></div><div><span>Remaining</span><strong>{remainingPoints}<small> pts</small></strong></div></div></div>
      </section>
      <section className="panel workload-panel"><div className="panel-heading"><div><h3>Workload</h3><p>Open issues by assignee.</p></div><Users size={18} className="muted-icon" /></div>
        {workload.length ? <div className="workload-list">{workload.map(([name, count]) => <div className="workload-row" key={name}><div className="person-avatar">{name.slice(0, 1).toUpperCase()}</div><span className="workload-name">{name}</span><div className="workload-track"><span style={{ width: `${Math.max(8, count / workload[0][1] * 100)}%` }} /></div><strong>{count}</strong><span className="sr-only">tasks</span></div>)}</div> : <div className="empty-inline">No assigned active issues yet.</div>}
      </section>
    </div>
    <section className="panel issue-panel"><div className="panel-heading"><div><h3>Issues in this sprint</h3><p>{sprint.issues.length} issues · ordered as returned by Jira.</p></div><span className="table-count">{sprint.issues.length} total</span></div><IssueTable issues={sprint.issues} /></section>
  </div>
}

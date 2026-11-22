import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, CircleHelp } from 'lucide-react'
import type { Issue } from '../types/sprint'

function priorityTone(priority: string | null) {
  const value = priority?.toLowerCase()
  if (value === 'highest' || value === 'high') return 'priority-high'
  if (value === 'low' || value === 'lowest') return 'priority-low'
  return 'priority-medium'
}

export function IssueTable({ issues }: { issues: Issue[] }) {
  const [page, setPage] = useState(0)
  const pageSize = 10
  const pageCount = Math.ceil(issues.length / pageSize)
  const visibleIssues = issues.slice(page * pageSize, (page + 1) * pageSize)
  useEffect(() => { setPage(0) }, [issues])
  if (!issues.length) return <div className="empty-inline"><CircleHelp size={18} />No issues are included in this sprint.</div>
  return <div className="table-scroll"><table className="data-table">
    <thead><tr><th>Issue</th><th>Summary</th><th>Status</th><th>Priority</th><th>Assignee</th><th className="numeric">Points</th></tr></thead>
    <tbody>{visibleIssues.map(issue => <tr key={issue.key}>
      <td><span className="issue-key">{issue.key}</span></td>
      <td className="issue-summary">{issue.summary || 'Untitled issue'}</td>
      <td><span className={`status-pill status-${issue.statusCategory?.toLowerCase().replace(/ /g, '-') || 'unknown'}`}>{issue.status || 'Unknown'}</span></td>
      <td><span className={`priority ${priorityTone(issue.priority)}`}>{issue.priority || '—'}</span></td>
      <td>{issue.assignee || <span className="muted">Unassigned</span>}</td>
      <td className="numeric">{issue.storyPoints ?? '—'}</td>
    </tr>)}</tbody>
  </table>{pageCount > 1 && <div className="table-pagination"><span>Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, issues.length)} of {issues.length} issues</span><div><button onClick={() => setPage(current => Math.max(0, current - 1))} disabled={page === 0} aria-label="Previous issues"><ChevronLeft size={15} /></button><span>{page + 1} / {pageCount}</span><button onClick={() => setPage(current => Math.min(pageCount - 1, current + 1))} disabled={page === pageCount - 1} aria-label="Next issues"><ChevronRight size={15} /></button></div></div>}</div>
}

import { ArrowDownRight, ArrowUpRight, Minus, Sparkles, Timer, TrendingUp } from 'lucide-react'
import type { CSSProperties } from 'react'
import { RecommendationList } from '../components/RecommendationList'
import { RiskList } from '../components/RiskList'
import type { SprintWorkspace } from '../types/sprint'

function trendIcon(trend: string) {
  if (trend === 'AHEAD') return <ArrowUpRight size={15} />
  if (trend === 'BEHIND') return <ArrowDownRight size={15} />
  return <Minus size={15} />
}

export function AIInsights({ workspace }: { workspace: SprintWorkspace }) {
  const { prediction, risks, recommendations } = workspace
  const probability = Math.round(prediction.completionProbability * 100)
  return <div className="page-content">
    <section className="prediction-hero">
      <div className="prediction-copy"><div className="section-kicker"><Sparkles size={14} />SPRINT FORECAST</div><h2>How is the sprint tracking?</h2><p>A delivery forecast based on sprint progress, blockers, and ownership.</p>
        <div className="prediction-tags"><span className={`trend-tag trend-${prediction.trend.toLowerCase()}`}>{trendIcon(prediction.trend)}{prediction.trend.replace('_', ' ')}</span><span className="days-tag"><Timer size={14} />{prediction.daysRemaining} days remaining</span></div>
      </div>
      <div className="probability"><div className="probability-ring" style={{ '--progress': `${probability}%` } as CSSProperties}><div><strong>{probability}<small>%</small></strong><span>completion<br />confidence</span></div></div><span className="forecast-note">Estimated by sprint heuristics</span></div>
    </section>
    <div className="insight-grid">
      <section className="panel"><div className="panel-heading"><div><h3>What we’re seeing</h3><p>Signals behind the sprint forecast.</p></div><TrendingUp size={18} className="muted-icon" /></div>
        <div className="insight-list">{prediction.insights.length ? prediction.insights.map((item, i) => <div className="insight-line" key={`${i}-${item}`}><span className="insight-bullet">{i + 1}</span>{item}</div>) : <div className="empty-inline">No additional signals available.</div>}</div>
        {!!prediction.bottlenecks.length && <div className="bottleneck-box"><strong>Potential bottlenecks</strong>{prediction.bottlenecks.map((item, i) => <p key={`${i}-${item}`}>{item}</p>)}</div>}
      </section>
      <section className="panel"><div className="panel-heading"><div><h3>Suggested actions</h3><p>Practical next moves for the team.</p></div></div>
        {prediction.suggestedActions.length ? <ul className="action-list">{prediction.suggestedActions.map((item, i) => <li key={`${i}-${item}`}><span>{String(i + 1).padStart(2, '0')}</span>{item}</li>)}</ul> : <div className="calm-state"><Sparkles size={18} />No urgent actions suggested.</div>}
      </section>
    </div>
    <section className="panel risk-panel"><div className="panel-heading"><div><h3>At-risk issues</h3><p>Expand an issue to see contributing factors and mitigations.</p></div><span className="table-count">{risks.length} flagged</span></div><RiskList risks={risks} /></section>
    <section className="panel"><div className="panel-heading"><div><h3>Assignment recommendations</h3><p>Suggested owners based on current open issue load.</p></div><span className="table-count">{recommendations.length} suggested</span></div><RecommendationList recommendations={recommendations} /></section>
    <p className="insights-footnote"><Sparkles size={13} /> These forecasts use transparent sprint heuristics and should support team judgment.</p>
  </div>
}

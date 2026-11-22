import { useCallback, useEffect, useState } from 'react'
import { Activity, AlertCircle, ArrowUpRight, BarChart3, Check, ChevronRight, LayoutDashboard, LoaderCircle, Menu, RefreshCw, Sparkles, X } from 'lucide-react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { getApiError, sprintApi } from './api/client'
import { SprintSelector } from './components/SprintSelector'
import { useSprintWorkspace } from './hooks/useSprintWorkspace'
import { AIInsights } from './pages/AIInsights'
import { Dashboard } from './pages/Dashboard'
import { SprintAnalysis } from './pages/SprintAnalysis'
import type { SprintSummary } from './types/sprint'
import { getSavedTheme, ThemeToggle } from './components/ThemeToggle'
import type { Theme } from './components/ThemeToggle'

const pageInfo = {
  '/': { title: 'Sprint overview', subtitle: 'A clear view of progress, health, and what to do next.' },
  '/analysis': { title: 'Sprint analysis', subtitle: 'Understand scope, story points, workload, and every issue.' },
  '/insights': { title: 'AI insights', subtitle: 'A transparent forecast with risks and recommended actions.' },
}

export default function App() {
  const [sprints, setSprints] = useState<SprintSummary[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>(getSavedTheme)
  const location = useLocation()
  const currentPath = location.pathname in pageInfo ? location.pathname as keyof typeof pageInfo : '/'
  const currentPage = pageInfo[currentPath]
  const { workspace, loading, error } = useSprintWorkspace(selectedId || null, refreshKey)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('sprintmate-theme', theme)
    } catch {
      // The theme still works for this session when browser storage is unavailable.
    }
  }, [theme])

  const loadSprints = useCallback(async (initial = false) => {
    if (initial) setListLoading(true)
    try {
      const results = await sprintApi.listSprints()
      setSprints(results)
      setListError(null)
      if (!selectedId || !results.some(sprint => sprint.id === selectedId)) {
        try {
          const active = await sprintApi.getActiveSprint()
          setSelectedId(active.id)
        } catch {
          setSelectedId(results.find(sprint => sprint.state.toLowerCase() === 'active')?.id || results[0]?.id || '')
        }
      }
    } catch (reason) {
      setListError(getApiError(reason))
      setSprints([])
    } finally {
      if (initial) setListLoading(false)
    }
  }, [selectedId])

  useEffect(() => { void loadSprints(true) }, []) // Load once on app entry.

  const refresh = async () => {
    setRefreshing(true)
    try {
      await sprintApi.refresh()
      await loadSprints()
      setRefreshKey(key => key + 1)
      setRefreshedAt(new Date())
    } catch (reason) {
      setListError(getApiError(reason))
    } finally {
      setRefreshing(false)
    }
  }

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/analysis', label: 'Sprint analysis', icon: BarChart3 },
    { to: '/insights', label: 'AI insights', icon: Sparkles },
  ]

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Activity size={19} strokeWidth={2.8} /></div><div><strong>Sprint<span>mate</span></strong><small>JIRA SPRINT ASSISTANT</small></div><button className="mobile-close" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <div className="workspace-switch"><div className="workspace-logo">S</div><div><strong>Sprint workspace</strong><span>Jira team board</span></div><ChevronRight size={15} /></div>
      <div className="nav-label">WORKSPACE</div>
      <nav className="main-nav" aria-label="Main navigation">{navItems.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMobileNavOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'nav-active' : ''}`}><Icon size={18} /><span>{label}</span>{label === 'AI insights' && <span className="nav-new">NEW</span>}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-tip"><div className="tip-icon"><Sparkles size={16} /></div><strong>Stay ahead of blockers</strong><p>Review your sprint signals before the daily stand-up.</p><NavLink to="/insights">Explore insights <ArrowUpRight size={14} /></NavLink></div><div className="profile"><div className="profile-avatar">SA</div><div><strong>Sprint Assistant</strong><span>Project workspace</span></div><span className="profile-menu">···</span></div></div>
    </aside>
    {mobileNavOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}

    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{currentPage.title}</strong></div></div>
        <div className="topbar-actions"><ThemeToggle theme={theme} onToggle={() => setTheme(value => value === 'dark' ? 'light' : 'dark')} /><span className="data-indicator"><i className={listError ? 'indicator-off' : ''} />{listError ? 'Connection issue' : 'Jira data'}</span>{sprints.length > 0 && <SprintSelector sprints={sprints} value={selectedId} onChange={setSelectedId} />}<button className="refresh-button" onClick={refresh} disabled={refreshing || listLoading} aria-label="Refresh Jira data"><RefreshCw size={15} className={refreshing ? 'spin' : ''} /><span>{refreshing ? 'Refreshing' : 'Refresh'}</span></button></div>
      </header>
      <div className="page-header"><div><h1>{currentPage.title}</h1><p>{currentPage.subtitle}</p></div>{refreshedAt && <div className="last-updated"><Check size={13} />Updated {refreshedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>}</div>
      {(listError || error) && <div className="alert-banner" role="alert"><AlertCircle size={17} /><span>{error || listError}</span><button onClick={refresh} disabled={refreshing}>Try again</button></div>}
      {(listLoading || loading) && <div className="loading-state"><LoaderCircle size={24} className="spin" /><strong>Loading sprint data</strong><span>Connecting to your Jira board…</span></div>}
      {!listLoading && !loading && workspace && <Routes>
        <Route path="/" element={<Dashboard workspace={workspace} />} />
        <Route path="/analysis" element={<SprintAnalysis workspace={workspace} />} />
        <Route path="/insights" element={<AIInsights workspace={workspace} />} />
        <Route path="*" element={<Dashboard workspace={workspace} />} />
      </Routes>}
      {!listLoading && !loading && !workspace && !error && <div className="empty-board"><div className="empty-board-icon"><Activity size={25} /></div><div className="section-kicker">READY WHEN YOU ARE</div><h2>{listError ? 'Could not connect to Jira' : sprints.length ? 'Select a sprint to get started' : 'No sprints found yet'}</h2><p>{listError || (sprints.length ? 'Choose a sprint from the selector above to see delivery health and analysis.' : 'Check the Jira board ID and project settings, then refresh to load sprint data.')}</p><button className="primary-button" onClick={refresh} disabled={refreshing}><RefreshCw size={15} className={refreshing ? 'spin' : ''} />Refresh Jira data</button></div>}
      <footer className="app-footer"><span><span className="footer-mark">S</span> Sprintmate</span><span>Jira sprint health, at a glance.</span></footer>
    </main>
  </div>
}

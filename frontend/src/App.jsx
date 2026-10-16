import { useState, useEffect } from 'react'
import { checkBackendHealth } from './services/api'
import SchemaManager from './pages/SchemaManager'
import QueryAnalyzer from './pages/QueryAnalyzer'
import HistoryPage from './pages/History'
import LearnPage from './pages/Learn'
import GatePrepPage from './pages/GatePrep'
import HelpPage from './pages/Help'
import DevelopedByPage from './pages/DevelopedBy'

function App() {
  const [healthStatus, setHealthStatus] = useState('checking...')
  const [dbStatus, setDbStatus] = useState('checking...')
  const [currentView, setCurrentView] = useState('simulator')
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
      document.body.setAttribute('data-theme', savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.body.setAttribute('data-theme', newTheme)
  }

  useEffect(() => {
    const verifyHealth = async () => {
      const result = await checkBackendHealth()
      if (result.status === 'ok') {
        setHealthStatus('connected')
        setDbStatus(result.database || 'unknown')
      } else {
        setHealthStatus('error')
        setDbStatus('error')
      }
    }
    verifyHealth()
  }, [])

  const navItems = [
    { id: 'simulator', label: 'Simulator', icon: '⬡' },
    { id: 'schema', label: 'Schema', icon: '🗄' },
    { id: 'analyzer', label: 'SQL Analyzer', icon: '🔍' },
    { id: 'learn', label: 'Learn', icon: '📖' },
    { id: 'gate_prep', label: 'GATE Prep', icon: '🎓' },
    { id: 'history', label: 'History', icon: '📋' },
    { id: 'help', label: 'Help', icon: '❓' },
    { id: 'developed_by', label: 'Developed By', icon: '👤' },
  ]

  const getStatusClass = (s) => {
    if (s === 'connected') return 'status-connected'
    if (s === 'error') return 'status-error'
    return 'status-checking'
  }

  const pipelineSteps = [
    { label: 'SQL', accent: true },
    { label: 'Parse' },
    { label: 'Detect' },
    { label: 'Candidates' },
    { label: 'Score', accent: true },
    { label: 'Recommend', accent: true },
    { label: 'EXPLAIN' },
  ]

  const featureCards = [
    {
      icon: '🔍',
      title: 'SQL Analyzer',
      desc: 'Parse queries into ASTs. Detect WHERE, JOIN, ORDER BY clauses and indexable operations.',
      tag: 'Analysis',
      view: 'analyzer',
    },
    {
      icon: '⚡',
      title: 'Recommendation Engine',
      desc: 'Deterministic heuristic scoring: Equality +30, JOIN +25, Range +20, ORDER BY +20.',
      tag: 'Scoring',
      view: 'analyzer',
    },
    {
      icon: '🌳',
      title: 'Visual Simulation',
      desc: '10 interactive pipeline steps from AST parsing to MySQL EXPLAIN plan analysis.',
      tag: 'Simulation',
      view: 'analyzer',
    },
    {
      icon: '🎓',
      title: 'GATE Prep',
      desc: 'Authentic GATE CSE DBMS previous-year questions with step-by-step mathematical solutions and key formulas.',
      tag: 'GATE CSE',
      view: 'gate_prep',
    },
  ]

  return (
    <>
      <header>
        <h1>Index Recommendation Engine</h1>
        <nav>
          <ul>
            {navItems.map(item => (
              <li key={item.id}>
                <a
                  href="#"
                  className={currentView === item.id ? 'active-nav' : ''}
                  onClick={(e) => { e.preventDefault(); setCurrentView(item.id) }}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <button
                onClick={toggleTheme}
                className="theme-toggle-btn"
                aria-label="Toggle Light/Dark Mode"
              >
                {theme === 'light' ? '☾ Dark' : '☀ Light'}
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <main className="container">
        {currentView === 'simulator' && (
          <div className="simulator-home">
            {/* Hero Section */}
            <div className="sim-hero-card">
              <div className="sim-hero-content">
                <div className="sim-hero-badge">Educational DBMS Tool</div>
                <h2 className="sim-hero-title">Index Recommendation Engine</h2>
                <p className="sim-hero-subtitle">
                  Analyze SQL queries. Discover candidate indexes. Understand exactly
                  <em> why</em> an index is recommended — step by step.
                </p>
                <button
                  className="btn btn-primary btn-lg sim-cta"
                  onClick={() => setCurrentView('analyzer')}
                >
                  <span>▶ Start Simulation</span>
                  <span className="cta-arrow">→</span>
                </button>
              </div>

              {/* Pipeline flow */}
              <div className="sim-pipeline-flow" aria-label="Processing pipeline">
                {pipelineSteps.map((step, i) => (
                  <div key={i} className="pipeline-flow-item">
                    <div className={`pipeline-flow-node ${step.accent ? 'pipeline-flow-accent' : ''}`}>
                      {step.label}
                    </div>
                    {i < pipelineSteps.length - 1 && (
                      <div className="pipeline-flow-connector" aria-hidden="true">→</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Status + Feature Cards */}
            <div className="sim-body-grid">
              {/* System Status */}
              <div className="sim-status-card">
                <div className="sim-status-header">
                  <span className="sim-status-title">System Status</span>
                  <div className={`sim-status-indicator ${healthStatus === 'connected' ? 'online' : 'offline'}`} aria-label="System online status"></div>
                </div>

                <div className="sim-status-row">
                  <div className="sim-status-row-label">
                    <span className="sim-status-icon">⬡</span>
                    <span>Backend API</span>
                  </div>
                  <span className={`status-badge ${getStatusClass(healthStatus)}`}>
                    {healthStatus}
                  </span>
                </div>

                <div className="sim-status-row">
                  <div className="sim-status-row-label">
                    <span className="sim-status-icon">🗄</span>
                    <span>MySQL Database</span>
                  </div>
                  <span className={`status-badge ${getStatusClass(dbStatus === 'connected' ? 'connected' : dbStatus)}`}>
                    {dbStatus}
                  </span>
                </div>

                <div className="sim-status-footer">
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => setCurrentView('analyzer')}
                  >
                    ▶ Open SQL Analyzer
                  </button>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="feature-grid">
                {featureCards.map((card, i) => (
                  <div
                    key={i}
                    className="feature-card"
                    onClick={() => setCurrentView(card.view)}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setCurrentView(card.view)}
                    aria-label={`Open ${card.title}`}
                  >
                    <div className="feature-card-top">
                      <span className="feature-card-icon">{card.icon}</span>
                      <span className="feature-card-tag">{card.tag}</span>
                    </div>
                    <h4>{card.title}</h4>
                    <p>{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'analyzer' && (
          <div className="card">
            <QueryAnalyzer />
          </div>
        )}

        {currentView === 'schema' && (
          <div className="card">
            <SchemaManager />
          </div>
        )}

        {currentView === 'history' && (
          <div className="card">
            <HistoryPage />
          </div>
        )}

        {currentView === 'learn' && (
          <div className="card">
            <LearnPage />
          </div>
        )}

        {currentView === 'gate_prep' && (
          <div className="card">
            <GatePrepPage />
          </div>
        )}

        {currentView === 'help' && (
          <div className="card">
            <HelpPage />
          </div>
        )}

        {currentView === 'developed_by' && (
          <div className="card">
            <DevelopedByPage />
          </div>
        )}
      </main>
    </>
  )
}

export default App

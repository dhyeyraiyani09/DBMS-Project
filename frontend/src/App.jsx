import { useState, useEffect } from 'react'
import { checkBackendHealth } from './services/api'
import SchemaManager from './pages/SchemaManager'
import QueryAnalyzer from './pages/QueryAnalyzer'
import HistoryPage from './pages/History'
import LearnPage from './pages/Learn'
import HelpPage from './pages/Help'
import DevelopedByPage from './pages/DevelopedBy'

function App() {
  const [healthStatus, setHealthStatus] = useState('checking...')
  const [dbStatus, setDbStatus] = useState('checking...')
  const [currentView, setCurrentView] = useState('simulator')
  const [theme, setTheme] = useState('light')

  // Load theme from localStorage on initial render
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
    { id: 'simulator', label: 'Simulator' },
    { id: 'schema', label: 'Schema' },
    { id: 'analyzer', label: 'SQL Analyzer' },
    { id: 'learn', label: 'Learn' },
    { id: 'history', label: 'History' },
    { id: 'help', label: 'Help' },
    { id: 'developed_by', label: 'Developed By' },
  ]

  const getStatusClass = (s) => {
    if (s === 'connected') return 'status-connected'
    if (s === 'error') return 'status-error'
    return 'status-checking'
  }

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
            <div className="card">
              <div className="simulator-hero">
                <h2>Index Recommendation Engine</h2>
                <p>
                  An interactive educational platform that analyzes SQL queries, applies deterministic
                  heuristics to recommend database indexes, and visualizes the complete decision pipeline —
                  step by step.
                </p>
              </div>

              <div className="workflow-container">
                <span className="workflow-node highlight">SQL Query</span>
                <span className="workflow-arrow">→</span>
                <span className="workflow-node">Parse AST</span>
                <span className="workflow-arrow">→</span>
                <span className="workflow-node">Candidates</span>
                <span className="workflow-arrow">→</span>
                <span className="workflow-node highlight">Score</span>
                <span className="workflow-arrow">→</span>
                <span className="workflow-node highlight">Recommend</span>
                <span className="workflow-arrow">→</span>
                <span className="workflow-node">EXPLAIN</span>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
                <div className="status-panel">
                  <div className="status-panel-title">
                    System Status <div className="pulse"></div>
                  </div>
                  <div className="status-row">
                    <strong>Backend API</strong>
                    <span className={`status-badge ${getStatusClass(healthStatus)}`}>
                      {healthStatus}
                    </span>
                  </div>
                  <div className="status-row">
                    <strong>MySQL Database</strong>
                    <span className={`status-badge ${getStatusClass(dbStatus === 'connected' ? 'connected' : dbStatus)}`}>
                      {dbStatus}
                    </span>
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      onClick={() => setCurrentView('analyzer')}
                    >
                      <span style={{ fontWeight: 600 }}>▶ Start Simulation</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="feature-grid">
                    <div className="feature-card" onClick={() => setCurrentView('analyzer')} style={{ cursor: 'pointer' }}>
                      <span className="icon">🔍</span>
                      <h4>SQL Analyzer</h4>
                      <p>Parse and analyze SQL queries. Detect clauses, tables, and indexable operations.</p>
                    </div>
                    <div className="feature-card" onClick={() => setCurrentView('analyzer')} style={{ cursor: 'pointer' }}>
                      <span className="icon">⚡</span>
                      <h4>Recommendation Engine</h4>
                      <p>Deterministic heuristic scoring: Equality +30, JOIN +25, Range +20, ORDER BY +20.</p>
                    </div>
                    <div className="feature-card" onClick={() => setCurrentView('analyzer')} style={{ cursor: 'pointer' }}>
                      <span className="icon">🌳</span>
                      <h4>Visual Simulation</h4>
                      <p>Walk through 10 interactive steps: AST → Candidates → Scoring → EXPLAIN.</p>
                    </div>
                    <div className="feature-card" onClick={() => setCurrentView('learn')} style={{ cursor: 'pointer' }}>
                      <span className="icon">🎓</span>
                      <h4>AI Tutor</h4>
                      <p>Educational explanations of recommendations with built-in learning insights.</p>
                    </div>
                  </div>
                </div>
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

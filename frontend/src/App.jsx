import { useState, useEffect } from 'react'
import { checkBackendHealth } from './services/api'
import SchemaManager from './pages/SchemaManager'
import QueryAnalyzer from './pages/QueryAnalyzer'
import HistoryPage from './pages/History'
import LearnPage from './pages/Learn'
import HelpPage from './pages/Help'
import DevelopedByPage from './pages/DevelopedBy'

function App() {
  const [healthStatus, setHealthStatus] = useState('checking...');
  const [dbStatus, setDbStatus] = useState('checking...');
  const [currentView, setCurrentView] = useState('simulator');
  const [theme, setTheme] = useState('light');

  // Load theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    const verifyHealth = async () => {
      const result = await checkBackendHealth();
      if (result.status === 'ok') {
        setHealthStatus('connected');
        setDbStatus(result.database || 'unknown');
      } else {
        setHealthStatus('error');
        setDbStatus('error');
      }
    };
    verifyHealth();
  }, []);

  return (
    <>
      <header>
        <h1>Index Recommendation Engine</h1>
        <nav>
          <ul style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('simulator'); }}>Simulator</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('schema'); }}>Schema Management</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('analyzer'); }}>SQL Analyzer</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('learn'); }}>Learn</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('history'); }}>History / Download</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('help'); }}>Help</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('developed_by'); }}>Developed By</a></li>
            <li>
              <button 
                onClick={toggleTheme} 
                style={{
                  background: 'transparent',
                  border: '1px solid var(--header-text)',
                  color: 'var(--header-text)',
                  padding: '0.2rem 0.5rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  marginLeft: '0.5rem'
                }}
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
          <div className="card">
            <h2>Welcome to the Simulator</h2>
            <p>
              An interactive educational system that analyzes SQL queries and demonstrates how database indexes can improve query execution.
            </p>
            <div style={{ marginTop: '2rem' }}>
              <h3>System Status</h3>
              <p>Backend API: <span className={`status-badge status-${healthStatus}`}>{healthStatus.toUpperCase()}</span></p>
              <p>MySQL Database: <span className={`status-badge status-${dbStatus === 'connected' ? 'connected' : 'error'}`}>{dbStatus.toUpperCase()}</span></p>
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

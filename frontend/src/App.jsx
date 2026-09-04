import { useState, useEffect } from 'react'
import { checkBackendHealth } from './services/api'
import SchemaManager from './pages/SchemaManager'
import QueryAnalyzer from './pages/QueryAnalyzer'
import HistoryPage from './pages/History'

function App() {
  const [healthStatus, setHealthStatus] = useState('checking...');
  const [dbStatus, setDbStatus] = useState('checking...');
  const [currentView, setCurrentView] = useState('simulator');

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
          <ul>
            <li><a href="#" onClick={() => setCurrentView('simulator')}>Simulator</a></li>
            <li><a href="#" onClick={() => setCurrentView('schema')}>Schema Management</a></li>
            <li><a href="#" onClick={() => setCurrentView('analyzer')}>SQL Analyzer</a></li>
            <li><a href="#">Learn</a></li>
            <li><a href="#" onClick={() => setCurrentView('history')}>History</a></li>
            <li><a href="#">Help</a></li>
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
      </main>
    </>
  )
}

export default App

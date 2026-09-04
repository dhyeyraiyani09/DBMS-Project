import { useState, useEffect } from 'react'
import { checkBackendHealth } from './services/api'

function App() {
  const [healthStatus, setHealthStatus] = useState('checking...');
  const [dbStatus, setDbStatus] = useState('checking...');

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
            <li><a href="#">Simulator</a></li>
            <li><a href="#">Learn</a></li>
            <li><a href="#">History</a></li>
            <li><a href="#">Help</a></li>
            <li><a href="#">Developed By</a></li>
            <li><a href="#">Download</a></li>
          </ul>
        </nav>
      </header>

      <main className="container">
        <div className="card">
          <h2>Welcome to the Simulator</h2>
          <p>
            An interactive educational system that analyzes SQL queries and demonstrates how database indexes can improve query execution.
          </p>
          
          <div style={{ marginTop: '2rem' }}>
            <h3>System Status</h3>
            <p>
              Backend API: {' '}
              <span className={`status-badge status-${healthStatus}`}>
                {healthStatus.toUpperCase()}
              </span>
            </p>
            <p>
              MySQL Database: {' '}
              <span className={`status-badge status-${dbStatus === 'connected' ? 'connected' : 'error'}`}>
                {dbStatus.toUpperCase()}
              </span>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

export default App

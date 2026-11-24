import React, { useState } from 'react';
import Navbar from './components/Navbar';
import EmailScanner from './components/EmailScanner';
import ModelAnalytics from './components/ModelAnalytics';
import ScanHistory from './components/ScanHistory';
import ArchitectureView from './components/ArchitectureView';

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1 }}>
        {activeTab === 'scanner' && <EmailScanner />}
        {activeTab === 'analytics' && <ModelAnalytics />}
        {activeTab === 'history' && <ScanHistory />}
        {activeTab === 'architecture' && <ArchitectureView />}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px 20px',
        textAlign: 'center',
        fontSize: '12px',
        color: 'var(--text-dim)',
        background: 'rgba(10, 14, 23, 0.95)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            Built with <strong>React 18</strong>, <strong>Django REST Framework</strong>, and <strong>DistilBERT + Calibrated Ensemble</strong>
          </div>
          <div>
            Full-Stack SDE-1 Portfolio Project • Production AI Pipeline
          </div>
        </div>
      </footer>
    </div>
  );
}

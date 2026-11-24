import React, { useEffect, useState } from 'react';
import { fetchHealth } from '../api/client';

export default function Navbar({ activeTab, setActiveTab }) {
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      await fetchHealth();
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  };

  const navItems = [
    { id: 'scanner', label: 'Live Scanner', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { id: 'analytics', label: 'Model Benchmarks', icon: 'M18 20V10M12 20V4M6 20v-6' },
    { id: 'history', label: 'Scan History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'architecture', label: 'AI Architecture', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'rgba(10, 14, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px var(--primary-glow)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em', color: '#fff' }}>
              PhishShield <span style={{ color: 'var(--primary)' }}>AI</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              DistilBERT + Calibrated Ensemble Defense
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '6px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: isActive ? 'var(--bg-elevated)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Backend Status & Django Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            background: 'var(--bg-card)',
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid var(--border)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: backendOnline ? 'var(--success)' : 'var(--danger)',
              boxShadow: backendOnline ? '0 0 8px var(--success)' : '0 0 8px var(--danger)'
            }} />
            <span style={{ color: backendOnline ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: 500 }}>
              {backendOnline ? 'Django AI API Active' : 'API Offline (Check :8000)'}
            </span>
          </div>

          <a
            href="/api/docs/"
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>API Docs</span>
          </a>

          <a
            href="/ViewYourProfile/"
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>← User Profile</span>
          </a>
        </div>
      </div>
    </header>
  );
}

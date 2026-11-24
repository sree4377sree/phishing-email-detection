import React, { useEffect, useState } from 'react';
import { fetchHistory } from '../api/client';

export default function ScanHistory() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadScans();
  }, [search]);

  const loadScans = async () => {
    setLoading(true);
    try {
      const data = await fetchHistory(search, 50);
      setScans(data.scans || []);
    } catch {
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (scans.length === 0) return;
    const headers = ['ID', 'Date', 'Sender', 'Receiver', 'Subject', 'Prediction', 'Body'];
    const rows = scans.map((s) => [
      s.id,
      `"${s.edate || ''}"`,
      `"${(s.sender || '').replace(/"/g, '""')}"`,
      `"${(s.receiver || '').replace(/"/g, '""')}"`,
      `"${(s.subject || '').replace(/"/g, '""')}"`,
      `"${s.Prediction || ''}"`,
      `"${(s.body || '').replace(/"/g, '""').slice(0, 100)}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'phishing_scan_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Historical Scan Registry
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Real-time audit log of all emails processed through the AI pipeline.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={exportCSV} className="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export to CSV
          </button>
          <button type="button" onClick={loadScans} className="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search scans by sender, subject, or result status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{
                background: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border)',
                textAlign: 'left',
                color: 'var(--text-muted)',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <th style={{ padding: '12px 16px' }}>ID</th>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px' }}>Verdict</th>
                <th style={{ padding: '12px 16px' }}>Sender</th>
                <th style={{ padding: '12px 16px' }}>Subject</th>
                <th style={{ padding: '12px 16px' }}>Snippet</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Loading scan registry...
                  </td>
                </tr>
              ) : scans.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No scans found matching your search.
                  </td>
                </tr>
              ) : (
                scans.map((scan) => {
                  const isPhish = scan.Prediction === 'Phishing';
                  return (
                    <tr
                      key={scan.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        transition: 'background 0.15s'
                      }}
                    >
                      <td style={{ padding: '12px 16px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        #{scan.id}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {scan.edate || 'Recent'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${isPhish ? 'badge-danger' : 'badge-success'}`}>
                          {scan.Prediction}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-main)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {scan.sender || 'Unknown'}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-main)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                        {scan.subject || 'No Subject'}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-dim)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>
                        {scan.body ? scan.body.slice(0, 75) + '...' : ''}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

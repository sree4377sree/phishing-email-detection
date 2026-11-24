import React, { useState } from 'react';
import { scanEmail } from '../api/client';

const SAMPLES = [
  {
    label: '🚨 PayPal Phishing (Suspension)',
    sender: 'security-service@paypa1-update.xyz',
    receiver: 'target@corp.com',
    subject: 'Urgent: Account Suspended within 24 Hours',
    body: 'Your PayPal account has been suspended due to unauthorized login attempts. Click http://192.168.1.100/login to verify your password immediately or legal penalty will follow.'
  },
  {
    label: '🚨 Fake CEO Wire Transfer',
    sender: 'ceo-office@gmail.com',
    receiver: 'finance@startup.io',
    subject: 'CONFIDENTIAL: Urgent Wire Transfer Required',
    body: 'I am in a confidential board meeting. Please process an immediate wire transfer of $45,000 to the attached bank account today. Do not call my phone.'
  },
  {
    label: '✅ Benign Team Sync',
    sender: 'sarah.miller@techcorp.com',
    receiver: 'engineering@techcorp.com',
    subject: 'Sprint Retrospective & Lunch Tomorrow',
    body: 'Hey team, please review the sprint burndown chart before our 2 PM retrospective tomorrow. Also let me know if anyone has dietary preferences for team lunch!'
  },
  {
    label: '✅ Open Source Commit Review',
    sender: 'developer@apache.org',
    receiver: 'dev-list@spamassassin.apache.org',
    subject: 'Re: [Bug 5780] URI processing regex patch',
    body: 'Attached is the patch for the URI parsing logic in SpamAssassin. Tests pass on Python 3 and GCC 11. Please review and merge if looks good.'
  }
];

export default function EmailScanner() {
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const loadSample = (sample) => {
    setSender(sample.sender);
    setReceiver(sample.receiver);
    setSubject(sample.subject);
    setBody(sample.body);
    setResult(null);
    setError(null);
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!body.trim()) {
      setError('Please enter the email body text.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await scanEmail({
        sender,
        receiver,
        subject,
        body
      });
      setResult(response.data);
    } catch (err) {
      setError(err.message || 'Error communicating with AI engine.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to highlight suspicious tokens in email body
  const renderHighlightedBody = () => {
    if (!result || !result.highlighted_tokens || result.highlighted_tokens.length === 0) {
      return <span>{body}</span>;
    }

    const tokenMap = {};
    result.highlighted_tokens.forEach((t) => {
      tokenMap[t.token.toLowerCase()] = t;
    });

    // Tokenize text into words and delimiters
    const parts = body.split(/(\b[\w'-]+\b)/);

    return (
      <div style={{
        lineHeight: 1.8,
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        background: 'var(--bg-elevated)',
        padding: '16px',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        whiteSpace: 'pre-wrap',
        maxHeight: '260px',
        overflowY: 'auto'
      }}>
        {parts.map((part, idx) => {
          const match = tokenMap[part.toLowerCase()];
          if (match) {
            return (
              <mark
                key={idx}
                title={`${match.category} (Risk: ${Math.round(match.weight * 100)}%)`}
                style={{
                  background: match.weight > 0.8 ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)',
                  color: match.weight > 0.8 ? '#fca5a5' : '#fde047',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  borderBottom: `2px solid ${match.weight > 0.8 ? '#ef4444' : '#f59e0b'}`,
                  cursor: 'help'
                }}
              >
                {part}
              </mark>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      {/* Sample Quick-Loader */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>
          ⚡ Test with Preset Attack &amp; Benign Samples:
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {SAMPLES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadSample(sample)}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Input Form Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Inspect Email Envelope &amp; Body</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Analyzes headers, lexical patterns, embedded URLs and semantic intent.</p>
            </div>
          </div>

          <form onSubmit={handleScan}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>
                  Sender
                </label>
                <input
                  type="text"
                  placeholder="e.g. security@paypal-verify.com"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-main)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>
                  Receiver
                </label>
                <input
                  type="text"
                  placeholder="e.g. user@target.com"
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-main)',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Urgent: Account Verification Required"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-main)',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>
                Email Content / Body <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                rows={6}
                placeholder="Paste the full email body text here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid var(--danger)',
                color: '#f87171',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            >
              {loading ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                  Running Neural Classification...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Scan with AI Models
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Card */}
        <div className="card" style={{ minHeight: '450px' }}>
          {!result ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '400px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: 'var(--primary)'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '16px', color: 'var(--text-main)', marginBottom: '6px' }}>Ready to Analyze</h3>
              <p style={{ fontSize: '13px', maxWidth: '320px' }}>
                Select a sample above or paste an email to trigger multi-model inference with Explainable AI attribution.
              </p>
            </div>
          ) : (
            <div>
              {/* Verdict Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '12px',
                background: result.is_phishing ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                border: `1px solid ${result.is_phishing ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: result.is_phishing ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: result.is_phishing ? 'var(--danger)' : 'var(--success)'
                  }}>
                    {result.is_phishing ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      AI Detection Result
                    </div>
                    <div style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: result.is_phishing ? '#f87171' : '#34d399'
                    }}>
                      {result.prediction}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${
                    result.risk_level === 'CRITICAL' ? 'badge-danger' :
                    result.risk_level === 'HIGH' ? 'badge-danger' :
                    result.risk_level === 'MEDIUM' ? 'badge-warning' : 'badge-success'
                  }`}>
                    {result.risk_level} RISK
                  </span>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Inference in {result.latency_ms} ms
                  </div>
                </div>
              </div>

              {/* Threat Gauge & Key Metrics */}
              <div className="grid-3" style={{ marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-elevated)', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>RISK SCORE</div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: result.risk_score > 60 ? '#f87171' : result.risk_score > 30 ? '#fbbf24' : '#34d399',
                    margin: '4px 0'
                  }}>
                    {result.risk_score}<span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>/100</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: 'var(--bg-card)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${result.risk_score}%`,
                      height: '100%',
                      background: result.risk_score > 60 ? 'var(--danger)' : result.risk_score > 30 ? 'var(--warning)' : 'var(--success)'
                    }} />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>CONFIDENCE</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
                    {result.confidence}%
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Soft-Voting Ensemble</div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>DETECTED URLS</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
                    {result.detected_urls ? result.detected_urls.length : 0}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    {result.url_analysis && result.url_analysis.has_ip_url ? '⚠️ IP Address Link' : 'Heuristic Inspected'}
                  </div>
                </div>
              </div>

              {/* Explainable AI Risk Factors */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                  🔍 Explainable AI (XAI) Attribution Factors:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.risk_factors && result.risk_factors.map((factor, idx) => (
                    <div key={idx} style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'var(--bg-elevated)',
                      borderLeft: `4px solid ${
                        factor.severity === 'CRITICAL' ? 'var(--danger)' :
                        factor.severity === 'HIGH' ? '#fb923c' :
                        factor.severity === 'MEDIUM' ? 'var(--warning)' : 'var(--success)'
                      }`,
                      fontSize: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{factor.type}</span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(255,255,255,0.06)'
                        }}>
                          {factor.severity}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>{factor.message}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Token Attribution Highlighting */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                  🎯 Suspicious Token Highlighting:
                </div>
                {renderHighlightedBody()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

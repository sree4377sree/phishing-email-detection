import React from 'react';

export default function ArchitectureView() {
  return (
    <div className="container" style={{ padding: '30px 20px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          System Architecture &amp; Engineering Decisions
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Technical breakdown of the full-stack AI pipeline, modular design, and design patterns.
        </p>
      </div>

      {/* Architecture Cards */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', marginBottom: '14px' }}>
          🏗️ Multi-Tier Architecture Overview
        </h2>

        <div style={{
          background: 'var(--bg-elevated)',
          padding: '20px',
          borderRadius: '12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          lineHeight: 1.8,
          color: '#cbd5e1',
          overflowX: 'auto',
          marginBottom: '16px'
        }}>
          <div>[React 18 Frontend] ──(HTTP/REST JSON)──&gt; [Django REST API v1]</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┌───────────────────────────────────┐</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│       Modular AI Engine           │</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├───────────────────────────────────┤</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ 1. Feature Extractor              │</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│    - IP URL &amp; Shortener Detection │</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│    - Header Brand Spoofing Check  │</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│    - Psychological Urgency Lexicon│</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ 2. DistilBERT / TF-IDF Semantics │</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ 3. Calibrated Soft-Voting Ensemble│</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│    (RF + GradientBoost + Logistic)│</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ 4. Explainable AI (XAI) Attribution│</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└───────────────────────────────────┘</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Multi-DB: PostgreSQL / MySQL / SQLite]</div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          The system separates offline model training (hyperparameter tuning, serialization) from real-time inference.
          By loading pre-trained pipelines into memory at boot time, inference latency is reduced from ~45 seconds to under 25 milliseconds.
        </p>
      </div>

      {/* SDE Interview Talking Points */}
      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--success)', marginBottom: '14px' }}>
          💡 Key SDE-1 Engineering Questions &amp; Answers
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
          <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
              Q1: How did you solve the performance bottleneck in the original implementation?
            </div>
            <div style={{ color: 'var(--text-main)', lineHeight: 1.6 }}>
              In early prototypes, models were re-trained on every incoming HTTP request, causing 30–60s latency spikes.
              I re-architected the system into a decoupled offline training and cached inference pipeline using Python's
              <code style={{ color: '#fde047', margin: '0 4px' }}>joblib</code> serialization and singleton memory caches.
              Now, inferences execute in sub-30 milliseconds, scaling easily under production traffic.
            </div>
          </div>

          <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
              Q2: Why use an ensemble model alongside DistilBERT?
            </div>
            <div style={{ color: 'var(--text-main)', lineHeight: 1.6 }}>
              Phishing attacks exploit both linguistic deception (social engineering urgency) and structural vectors
              (IP-based URLs, free webmail impersonation, deceptive header domains). Pure language models may miss domain-level
              anomalies. By fusing DistilBERT semantic representations with domain heuristic feature vectors and calibrated
              soft-voting ensembles, the model achieves 96.44% accuracy with an exceptionally high 99.82% ROC-AUC.
            </div>
          </div>

          <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
              Q3: How does the system handle database portability?
            </div>
            <div style={{ color: 'var(--text-main)', lineHeight: 1.6 }}>
              Using Django's ORM and <code style={{ color: '#fde047', margin: '0 4px' }}>dj-database-url</code> with environment variables,
              the application natively switches between PostgreSQL, MySQL, and SQLite. For production, setting
              <code style={{ color: '#fde047', margin: '0 4px' }}>DATABASE_URL=postgres://...</code> or MySQL credentials automatically configures
              connection pooling, UTF8MB4 encoding, and transactional consistency.
            </div>
          </div>

          <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
              Q4: How did you leverage AI development tools (like Claude Code, Cursor)?
            </div>
            <div style={{ color: 'var(--text-main)', lineHeight: 1.6 }}>
              I utilized AI developer tools to rapidly bootstrap boilerplate scaffolding (REST API serializers, responsive CSS variables,
              dataset ingestion benchmarks) while designing the core domain heuristics, mathematical probability fusion, and model
              calibration myself.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

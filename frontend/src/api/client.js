/**
 * API Client for Phishing Detection Backend.
 * Talks to Django REST Framework endpoints.
 */

const API_BASE = '/api/v1';

export async function scanEmail(payload) {
  const res = await fetch(`${API_BASE}/predict/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Server error: ${res.status}`);
  }
  return res.json();
}

export async function fetchMetrics() {
  const res = await fetch(`${API_BASE}/metrics/`);
  if (!res.ok) throw new Error('Failed to fetch model metrics');
  return res.json();
}

export async function fetchHistory(query = '', limit = 30) {
  const url = new URL(`${window.location.origin}${API_BASE}/history/`);
  if (query) url.searchParams.set('q', query);
  if (limit) url.searchParams.set('limit', limit);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats/`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health/`);
  if (!res.ok) throw new Error('Failed to reach backend');
  return res.json();
}

/**
 * API helper – centralized fetch wrapper for all backend calls.
 */

const API_BASE = 'http://localhost:5000';  // Direct CORS usage, bypassing Vite proxy

export async function transcribeFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/transcribe`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let errMsg = 'Transcription failed';
    try {
      const err = await res.json();
      errMsg = err.detail || errMsg;
    } catch (e) {
      errMsg = `Server Error: ${res.status} ${res.statusText}`;
    }
    throw new Error(errMsg);
  }

  return res.json();
}

export async function analyzeTranscript(transcript) {
  const res = await fetch(`${API_BASE}/api/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  });

  if (!res.ok) {
    let errMsg = 'Analysis failed';
    try {
      const err = await res.json();
      errMsg = err.detail || errMsg;
    } catch (e) {
      errMsg = `Server Error: ${res.status} ${res.statusText}`;
    }
    throw new Error(errMsg);
  }

  return res.json();
}

export async function fetchHistory(limit = 15) {
  const res = await fetch(`${API_BASE}/api/history?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

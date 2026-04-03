const API_BASE = 'http://localhost:5002';

const getAuthHeader = () => {
  const token = localStorage.getItem('armor_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

export async function verifyOtp(tempToken, otp) {
  const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tempToken, otp }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'OTP Verification failed');
  return data;
}

export async function register(name, email, password) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

export async function transcribeFile(file, language) {
  const formData = new FormData();
  formData.append('file', file);
  // Map browser speech-recognition lang codes to Whisper codes
  const langMap = { 'en-IN': 'en', 'en-US': 'en', 'hi-IN': 'hi' };
  formData.append('language', langMap[language] || 'auto');

  const res = await fetch(`${API_BASE}/api/transcribe`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
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
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
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
  const res = await fetch(`${API_BASE}/api/history?limit=${limit}`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('armor_token');
      localStorage.removeItem('armor_user');
      window.location.reload();
    }
    throw new Error('Failed to fetch history');
  }
  return res.json();
}

import { useState, useEffect, useCallback } from 'react';
import ToastProvider, { useToast } from './components/Toast';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RecordCard from './components/RecordCard';
import TranscriptCard from './components/TranscriptCard';
import Loader from './components/Loader';
import ResultsCard from './components/ResultsCard';
import HistoryCard from './components/HistoryCard';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import FinancialCharts from './components/FinancialCharts';
import RiskScoreMeter from './components/RiskScoreMeter';
import InsightCards from './components/InsightCards';
import DecisionTimeline from './components/DecisionTimeline';
import { transcribeFile, analyzeTranscript, fetchHistory } from './api';

function AppContent() {
  const toast = useToast();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('armor_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  
  const [status, setStatus] = useState({ text: 'Ready', color: null });
  const [transcript, setTranscript] = useState('');
  const [langBadge, setLangBadge] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaderText, setLoaderText] = useState('Processing…');
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [activeTab, setActiveTab] = useState('record'); // 'record', 'dashboard', 'history'

  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchHistory(15);
      setHistory(data.conversations || []);
    } catch (err) {
      console.error('History load error:', err);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('armor_token');
    localStorage.removeItem('armor_user');
    setUser(null);
    setHistory([]);
    setShowTranscript(false);
    setShowResults(false);
    toast('Logged out successfully', 'info');
  };

  // Called by RecordCard when speech recognition produces text
  const handleTranscript = (text) => {
    setTranscript(text);
    setShowTranscript(true);
    setShowResults(false);
  };

  // Called by RecordCard for file upload
  const handleFileUpload = async (file) => {
    setShowTranscript(false);
    setShowResults(false);
    setLoading(true);
    setLoaderText('Transcribing audio with Groq Whisper…');
    setStatus({ text: 'Transcribing…', color: 'var(--accent)' });

    try {
      const data = await transcribeFile(file, selectedLang);
      setTranscript(data.transcript);
      if (data.language_detected) {
        setLangBadge(`🌐 ${data.language_detected.toUpperCase()}`);
      }
      setLoading(false);
      setShowTranscript(true);
      setStatus({ text: 'Ready', color: null });
      toast('Transcription complete!', 'success');
    } catch (err) {
      setLoading(false);
      setStatus({ text: 'Ready', color: null });
      toast(`Error: ${err.message}`, 'error');
    }
  };

  // Called by TranscriptCard analyze button
  const handleAnalyze = async () => {
    const text = transcript.trim();
    if (!text) {
      toast('No transcript to analyze.', 'error');
      return;
    }

    setShowResults(false);
    setLoading(true);
    setLoaderText('Analyzing with Gemini…');
    setStatus({ text: 'Analyzing…', color: 'var(--accent2)' });

    try {
      const data = await analyzeTranscript(text);
      setResults(data);
      setLoading(false);
      setShowResults(true);
      setStatus({ text: 'Ready', color: null });
      toast('Analysis complete!', 'success');
      loadHistory();
    } catch (err) {
      setLoading(false);
      setStatus({ text: 'Ready', color: null });
      toast(`Error: ${err.message}`, 'error');
    }
  };

  return (
    <>
      <Navbar status={status} user={user} onLogout={handleLogout} />
      
      {!user ? (
        <div className="auth-container">
          {authView === 'login' ? (
            <Login 
              onAuthSuccess={handleAuthSuccess} 
              onSwitchToRegister={() => setAuthView('register')} 
            />
          ) : (
            <Register 
              onAuthSuccess={handleAuthSuccess} 
              onSwitchToLogin={() => setAuthView('login')} 
            />
          )}
        </div>
      ) : (
        <>
          <Hero />
          <main className="container">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              {isRecording && (
                <div className="detection-indicator">
                  <span style={{ fontSize: '1.2rem' }}>⚡</span>
                  Financial conversation detected...
                </div>
              )}
            </div>

            {/* Tab Navigation Menu */}
            <div className="tab-menu" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setActiveTab('record')}
                className={`btn ${activeTab === 'record' ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: '25px', padding: '10px 24px', transition: 'all 0.3s' }}
              >
                🎙️ Record & Analyze
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: '25px', padding: '10px 24px', transition: 'all 0.3s' }}
              >
                📊 Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: '25px', padding: '10px 24px', transition: 'all 0.3s' }}
              >
                📙 History
              </button>
            </div>

            {/* TAB: Record & Analyze */}
            {activeTab === 'record' && (
              <div className="tab-content fade-in">
                <RecordCard
                  onTranscript={handleTranscript}
                  onFileUpload={handleFileUpload}
                  onStatusChange={setStatus}
                  onRecordingChange={setIsRecording}
                  onLanguageChange={setSelectedLang}
                />

                {showTranscript && (
                  <TranscriptCard
                    transcript={transcript}
                    langBadge={langBadge}
                    onTranscriptChange={setTranscript}
                    onAnalyze={handleAnalyze}
                  />
                )}

                {loading && <Loader text={loaderText} />}

                {showResults && <ResultsCard data={results} onGoToDashboard={() => setActiveTab('dashboard')} />}
              </div>
            )}

            {/* TAB: Dashboard */}
            {activeTab === 'dashboard' && (
               <div className="tab-content fade-in" style={{ marginTop: '20px' }}>
                <h2 style={{ color: '#fff', marginBottom: '24px', fontSize: '1.5rem', fontWeight: '700', textAlign: 'center' }}>
                  📊 Analytics Dashboard
                </h2>
                
                {/* Fallback to latest history item if no active analysis immediately available */}
                {(results || history.length > 0) ? (
                  <>
                    <InsightCards data={{
                      income: (results || history[0]).estimated_income,
                      emi: (results || history[0]).entities?.emi,
                      sip: (results || history[0]).entities?.sip,
                      banks: (results || history[0]).entities?.banks || [],
                      amounts: (results || history[0]).entities?.amounts || [],
                    }} />

                    <div className="dashboard-grid">
                      <FinancialCharts data={{
                        income: (results || history[0]).estimated_income,
                        emi: (results || history[0]).entities?.emi,
                        sip: (results || history[0]).entities?.sip
                      }} />
                      <RiskScoreMeter 
                        score={(results || history[0]).risk_score || 50} 
                        explanation={(results || history[0]).risk_explanation || 'No detailed analysis available.'} 
                      />
                      <DecisionTimeline history={history} />
                    </div>
                  </>
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No financial data available yet. Please record a conversation first!</p>
                )}
              </div>
            )}

            {/* TAB: History */}
            {activeTab === 'history' && (
              <div className="tab-content fade-in">
                <HistoryCard conversations={history} onRefresh={loadHistory} />
              </div>
            )}

          </main>
        </>
      )}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

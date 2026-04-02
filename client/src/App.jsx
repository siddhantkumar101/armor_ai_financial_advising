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
import { transcribeFile, analyzeTranscript, fetchHistory } from './api';

function AppContent() {
  const toast = useToast();
  const [status, setStatus] = useState({ text: 'Ready', color: null });
  const [transcript, setTranscript] = useState('');
  const [langBadge, setLangBadge] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaderText, setLoaderText] = useState('Processing…');
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);

  const loadHistory = useCallback(async () => {
    try {
      const data = await fetchHistory(15);
      setHistory(data.conversations || []);
    } catch (err) {
      console.error('History load error:', err);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

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
    setLoaderText('Transcribing audio with Gemini…');
    setStatus({ text: 'Transcribing…', color: 'var(--accent)' });

    try {
      const data = await transcribeFile(file);
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
      <Navbar status={status} />
      <Hero />
      <main className="container">
        <RecordCard
          onTranscript={handleTranscript}
          onFileUpload={handleFileUpload}
          onStatusChange={setStatus}
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

        {showResults && <ResultsCard data={results} />}

        <HistoryCard conversations={history} onRefresh={loadHistory} />
      </main>
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

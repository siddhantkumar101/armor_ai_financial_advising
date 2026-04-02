import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from './Toast';

export default function RecordCard({ onTranscript, onFileUpload, onStatusChange }) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState('00:00');
  const [lang, setLang] = useState('en-IN');
  
  const mediaRecorderRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const transcriptRef = useRef('');
  const fileInputRef = useRef(null);
  const toast = useToast();

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTimer('00:00');
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      setTimer(`${m}:${s}`);
    }, 250);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    if (speechRecognitionRef.current && isRecording) {
      speechRecognitionRef.current.onend = null;
      speechRecognitionRef.current.stop();
    }
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!navigator.mediaDevices || !window.MediaRecorder || !SpeechRecognition) {
      toast('Your browser misses some audio APIs. Use Chrome for live dictation.', 'error');
      return;
    }

    try {
      // 1. Setup speech recognition for LIVE transcribing
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;
      speechRecognitionRef.current = recognition;
      transcriptRef.current = '';

      recognition.onresult = (event) => {
        let finalTrans = '';
        let interimTrans = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTrans += event.results[i][0].transcript + ' ';
          else interimTrans += event.results[i][0].transcript;
        }
        const text = (finalTrans + interimTrans).trim();
        transcriptRef.current = text;
        onTranscript?.(text);
      };

      recognition.onerror = (event) => {
        if (event.error !== 'no-speech') console.error('Speech Recognition API issue (ignoring):', event.error);
        // Do not call stopRecording() to avoid interrupting the main MediaRecorder!
      };

      recognition.onend = () => {
        if (speechRecognitionRef.current && isRecording) {
          try { recognition.start(); } catch (e) { }
        }
      };

      // 2. Setup Web Audio API (MediaRecorder) for backend transcription
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.onstart = () => {
        setIsRecording(true);
        startTimer();
        onStatusChange?.({ text: 'Recording + Live Transcribing…', color: '#f43f5e' });
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setIsRecording(false);
        stopTimer();
        onStatusChange?.({ text: 'Ready', color: null });
        
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        if (audioBlob.size > 0) {
          let ext = 'webm';
          if (mediaRecorder.mimeType.includes('mp4')) ext = 'mp4';
          else if (mediaRecorder.mimeType.includes('ogg')) ext = 'ogg';

          const file = new File([audioBlob], `recording.${ext}`, { type: mediaRecorder.mimeType || 'audio/webm' });
          onFileUpload?.(file);
        }
      };

      // Start Both
      recognition.start();
      mediaRecorder.start(200);

    } catch (err) {
      console.error('Mic access denied or error:', err);
      toast('Microphone access denied or error occurred.', 'error');
      setIsRecording(false);
      onStatusChange?.({ text: 'Ready', color: null });
    }
  }, [lang, toast, startTimer, stopRecording, onTranscript, onFileUpload, onStatusChange, isRecording]);

  const toggleRecording = () => {
    if (!isRecording) startRecording();
    else stopRecording();
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onFileUpload?.(file);
    e.target.value = '';
  };

  useEffect(() => {
    return () => {
      stopTimer();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.stop();
      }
    };
  }, [stopTimer]);

  return (
    <section className="card record-card" id="recordCard">
      <div className="card-header">
        <h2>🎙️ Record Conversation</h2>
        <p className="card-sub">Speak naturally in Hindi, English, or Hinglish</p>
      </div>

      <div className="recorder-ui">
        <div className={`visualizer ${isRecording ? 'active' : ''}`}>
          <div className={`viz-bars ${isRecording ? 'active' : ''}`}>
            <span></span><span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          {!isRecording && <div className="viz-idle">🎤</div>}
        </div>

        <div className={`timer ${isRecording ? 'active' : ''}`}>{timer}</div>

        <div className="lang-selector">
          <label>Language:</label>
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en-IN">English (India/Hinglish)</option>
            <option value="hi-IN">Hindi (India)</option>
            <option value="en-US">English (US)</option>
          </select>
        </div>

        <div className="btn-row">
          <button
            className={`btn btn-record ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
          >
            <span className="btn-icon">{isRecording ? '⏹' : '⏺'}</span>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          <label className="btn btn-upload" htmlFor="fileInput">
            <span className="btn-icon">📂</span> Upload Audio
          </label>
          <input
            type="file"
            id="fileInput"
            ref={fileInputRef}
            accept="audio/*"
            hidden
            onChange={handleFile}
          />
        </div>
      </div>
    </section>
  );
}

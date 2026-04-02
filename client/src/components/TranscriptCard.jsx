import { useRef, useEffect } from 'react';

export default function TranscriptCard({ transcript, langBadge, onTranscriptChange, onAnalyze }) {
  const boxRef = useRef(null);

  useEffect(() => {
    if (boxRef.current && transcript) {
      boxRef.current.textContent = transcript;
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleInput = () => {
    if (boxRef.current) {
      onTranscriptChange?.(boxRef.current.textContent);
    }
  };

  return (
    <section className="card" id="transcriptCard">
      <div className="card-header">
        <h2>📝 Transcript</h2>
        {langBadge && <div className="lang-badge">{langBadge}</div>}
      </div>
      <div
        className="transcript-box"
        ref={boxRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        placeholder="Transcript will appear here, or you can type/paste manually..."
      ></div>
      <button className="btn btn-primary" onClick={onAnalyze}>
        <span className="btn-icon">🔍</span> Analyze Financially
      </button>
    </section>
  );
}

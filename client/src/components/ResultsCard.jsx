function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ResultsCard({ data, onGoToDashboard }) {
  if (!data) return null;

  const isFin = data.is_financial !== undefined ? data.is_financial : true;
  const conf = data.confidence_score !== undefined ? data.confidence_score : 0.8;
  const riskLevel = data.risk_level || 'medium';
  const sentiment = data.sentiment || 'neutral';
  const emotion = data.emotion || 'neutral';
  const entities = data.entities || {};

  const chips = [
    { label: 'Income', value: data.estimated_income, array: false },
    { label: 'EMI', value: entities.emi, array: false },
    { label: 'SIP', value: entities.sip, array: false },
    { label: 'Loan', value: entities.loan, array: false },
    { label: 'Amounts', value: entities.amounts, array: true },
    { label: 'Banks', value: entities.banks, array: true },
    { label: 'Investments', value: entities.investment_types, array: true },
    { label: 'Time Periods', value: entities.time_periods, array: true },
  ];

  // Parse financial advice into bullet points
  const adviceLines = (data.financial_advice || '')
    .split(/\n|(?=\d+\.\s)/)
    .map(l => l.replace(/^\d+\.\s*/, '').trim())
    .filter(l => l.length > 0);

  return (
    <section className="card results-card" id="resultsCard">
      <div className="card-header">
        <h2>📊 Financial Analysis</h2>
        <div className="badges-row">
          <span className={`badge ${isFin ? 'badge-financial' : 'badge-non-fin'}`}>
            {isFin ? '✅ Financial' : '❌ Non-Financial'}
          </span>
          <span className={`badge badge-${riskLevel}`}>
            ⚠️ Risk: {capitalize(riskLevel)}
          </span>
          <span className={`badge badge-${sentiment}`}>
            💬 {capitalize(sentiment)}
          </span>
          <span className="badge badge-neutral" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc' }}>
            😊 {capitalize(emotion)}
          </span>
          <span className="badge badge-neutral">
            Confidence: {Math.round(conf * 100)}%
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="result-block">
        <h3>💡 Summary</h3>
        <p>{data.summary || '—'}</p>
      </div>

      {/* Decision */}
      <div className="result-block">
        <h3>🎯 Decision Identified</h3>
        <p>{data.decision || '—'}</p>
      </div>

      {/* Detailed Financial Advice */}
      {adviceLines.length > 0 && (
        <div className="result-block" style={{ borderColor: 'rgba(6,214,160,0.3)', background: 'rgba(6,214,160,0.05)' }}>
          <h3 style={{ color: 'var(--accent3)' }}>🌱 Armor Insights & Advice</h3>
          <ul style={{ margin: '12px 0', paddingLeft: '20px', lineHeight: '1.8' }}>
            {adviceLines.map((line, i) => (
              <li key={i} style={{ marginBottom: '8px', color: 'var(--text-secondary, #ccc)' }}>
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Entities Grid */}
      <div className="result-block">
        <h3>🏷️ Extracted Entities</h3>
        <div className="entities-grid">
          {chips.map(({ label, value, array }) => {
            const hasVal = array ? (value && value.length > 0) : !!value;
            return (
              <div key={label} className={`entity-chip ${hasVal ? 'has-value' : ''}`}>
                <div className="label">{label}</div>
                {array ? (
                  hasVal ? (
                    <div className="tag-list">
                      {value.map((v, i) => <span key={i} className="tag">{v}</span>)}
                    </div>
                  ) : (
                    <span className="value" style={{ color: 'var(--text-muted)' }}>—</span>
                  )
                ) : (
                  <div className="value">
                    {value || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dashboard Prompt */}
      {onGoToDashboard && (
        <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px', background: 'rgba(79, 142, 247, 0.1)', borderRadius: '12px' }}>
          <p style={{ color: 'var(--text)', marginBottom: '12px' }}>Want to see these insights visualized?</p>
          <button 
            onClick={onGoToDashboard} 
            className="btn btn-primary"
            style={{ padding: '8px 20px', borderRadius: '20px' }}
          >
            📊 Visit Analytics Dashboard
          </button>
        </div>
      )}

    </section>
  );
}

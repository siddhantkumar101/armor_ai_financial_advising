function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ResultsCard({ data }) {
  if (!data) return null;

  const isFin = data.is_financial !== undefined ? data.is_financial : true;
  const conf = data.confidence_score !== undefined ? data.confidence_score : 0.8;
  const riskLevel = data.risk_level || 'medium';
  const sentiment = data.sentiment || 'neutral';
  const entities = data.entities || {};

  const chips = [
    { label: 'EMI', value: entities.emi, array: false },
    { label: 'SIP', value: entities.sip, array: false },
    { label: 'Loan', value: entities.loan, array: false },
    { label: 'Amounts', value: entities.amounts, array: true },
    { label: 'Banks', value: entities.banks, array: true },
    { label: 'Investments', value: entities.investment_types, array: true },
    { label: 'Time Periods', value: entities.time_periods, array: true },
  ];

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

      {/* Financial Advice */}
      {data.financial_advice && (
        <div className="result-block" style={{ borderColor: 'rgba(6,214,160,0.3)', background: 'rgba(6,214,160,0.05)' }}>
          <h3 style={{ color: 'var(--accent3)' }}>🌱 Armor Insights & Advice</h3>
          <p>{data.financial_advice}</p>
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
    </section>
  );
}

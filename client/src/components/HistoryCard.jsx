import { useState } from 'react';

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function HistoryCard({ conversations, onRefresh }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <section className="card history-card">
      <div className="card-header">
        <h2>🕒 Conversation History</h2>
        <button className="btn btn-sm" onClick={onRefresh}>↻ Refresh</button>
      </div>
      <div>
        {!conversations || conversations.length === 0 ? (
          <p className="muted">No history yet. Record a conversation to get started.</p>
        ) : (
          conversations.map(c => {
            const dt = new Date(c.timestamp + (c.timestamp.endsWith('Z') ? '' : 'Z'));
            const time = isNaN(dt.getTime()) ? c.timestamp : dt.toLocaleString('en-IN');
            const excerpt = c.transcript.length > 130
              ? c.transcript.slice(0, 130) + '…'
              : c.transcript;

            return (
              <div
                key={c.id}
                className="history-item"
                onClick={() => toggleExpand(c.id)}
              >
                <div className="history-meta">
                  <span
                    className={`badge ${c.is_financial ? 'badge-financial' : 'badge-non-fin'}`}
                    style={{ fontSize: '10px' }}
                  >
                    {c.is_financial ? '✅ Financial' : '❌ Non-Financial'}
                  </span>
                  <span
                    className={`badge badge-${c.risk_level}`}
                    style={{ fontSize: '10px' }}
                  >
                    ⚠️ {capitalize(c.risk_level)}
                  </span>
                  <span className="history-time">🕒 {time}</span>
                </div>
                <div className="history-transcript">{escapeHtml(excerpt)}</div>
                {expandedId === c.id && (
                  <div className="history-summary">
                    <strong>Summary:</strong> {escapeHtml(c.summary)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

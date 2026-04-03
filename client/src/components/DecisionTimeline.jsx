import React from 'react';
import { Calendar } from 'lucide-react';

export default function DecisionTimeline({ history }) {
  return (
    <div className="insight-card" style={{ gridColumn: 'span 1' }}>
      <div className="insight-header" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
        <Calendar size={20} style={{ color: '#6366f1' }} />
        <h3 className="insight-label">Decision Timeline</h3>
      </div>
      
      <div className="timeline">
        {history.slice(0, 5).map((item, i) => (
          <div key={i} className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-date">{new Date(item.timestamp).toLocaleDateString()}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#fff' }}>
                {item.analysis?.decision || 'Review Session'}
              </div>
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No decisions recorded yet.</p>
        )}
      </div>
    </div>
  );
}

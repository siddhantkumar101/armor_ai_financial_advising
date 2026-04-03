import React from 'react';
import { AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export default function RiskScoreMeter({ score, explanation }) {
  const getRiskColor = (s) => {
    if (s < 30) return '#10b981'; // Low
    if (s < 70) return '#f59e0b'; // Medium
    return '#ef4444'; // High
  };

  const getRiskIcon = (s) => {
    if (s < 30) return <ShieldCheck className="trend-up" size={20} />;
    if (s < 70) return <Activity style={{ color: '#f59e0b' }} size={20} />;
    return <AlertTriangle className="trend-down" size={20} />;
  };

  const color = getRiskColor(score);

  return (
    <div className="insight-card">
      <div className="insight-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="insight-label">Advanced Risk Score</h3>
        {getRiskIcon(score)}
      </div>
      
      <div className="insight-value" style={{ color }}>{score}/100</div>
      
      <div className="risk-meter-container">
        <div className="risk-bar-bg">
          <div 
            className="risk-bar-fill" 
            style={{ width: `${score}%`, backgroundColor: color }}
          ></div>
        </div>
        <p className="risk-explanation">{explanation}</p>
      </div>
    </div>
  );
}

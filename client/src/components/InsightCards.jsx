import React from 'react';
import { TrendingUp, Wallet, Landmark, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function InsightCards({ data }) {
  // Safely extract numeric value from strings like "₹50,000", "50000", or already-numeric values
  const parseAmount = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    const cleaned = String(val).replace(/[₹,\s]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const fmt = (val) => {
    const num = parseAmount(val);
    return num > 0 ? `₹${num.toLocaleString('en-IN')}` : '—';
  };

  const cards = [
    {
      label: 'Monthly Income',
      value: fmt(data.income),
      icon: <Wallet style={{ color: '#10b981' }} size={24} />,
      trend: parseAmount(data.income) > 0 ? 'Detected' : 'Not mentioned',
      trendUp: parseAmount(data.income) > 0
    },
    {
      label: 'Total EMIs',
      value: fmt(data.emi),
      icon: <Landmark style={{ color: '#ef4444' }} size={24} />,
      trend: parseAmount(data.emi) > 0 ? 'Active' : 'None',
      trendUp: false
    },
    {
      label: 'Monthly SIPs',
      value: fmt(data.sip),
      icon: <TrendingUp style={{ color: '#6366f1' }} size={24} />,
      trend: parseAmount(data.sip) > 0 ? 'On Track' : 'None',
      trendUp: parseAmount(data.sip) > 0
    }
  ];

  return (
    <div className="dashboard-grid">
      {cards.map((card, i) => (
        <div key={i} className="insight-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 className="insight-label">{card.label}</h3>
            {card.icon}
          </div>
          <div className="insight-value">{card.value}</div>
          <div className="insight-trend">
            {card.trendUp ? <ArrowUpRight className="trend-up" size={16} /> : <ArrowDownRight className="trend-down" size={16} />}
            <span className={card.trendUp ? 'trend-up' : 'trend-down'}>{card.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

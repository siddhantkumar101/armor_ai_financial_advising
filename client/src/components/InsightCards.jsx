import React from 'react';
import { TrendingUp, Wallet, Landmark, PiggyBank, Building2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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

  const income = parseAmount(data.income);
  const emi = parseAmount(data.emi);
  const sip = parseAmount(data.sip);
  const balance = Math.max(0, income - emi - sip);
  const banks = data.banks || [];

  const cards = [
    {
      label: 'Monthly Income',
      value: fmt(data.income),
      icon: <Wallet style={{ color: '#10b981' }} size={24} />,
      trend: income > 0 ? 'Detected' : 'Not mentioned',
      trendUp: income > 0
    },
    {
      label: 'Total EMIs',
      value: fmt(data.emi),
      icon: <Landmark style={{ color: '#ef4444' }} size={24} />,
      trend: emi > 0 ? 'Active' : 'None',
      trendUp: false
    },
    {
      label: 'Monthly SIPs',
      value: fmt(data.sip),
      icon: <TrendingUp style={{ color: '#6366f1' }} size={24} />,
      trend: sip > 0 ? 'On Track' : 'None',
      trendUp: sip > 0
    },
    {
      label: 'Savings / Balance',
      value: income > 0 ? `₹${balance.toLocaleString('en-IN')}` : '—',
      icon: <PiggyBank style={{ color: '#f59e0b' }} size={24} />,
      trend: balance > 0 ? 'After EMI & SIP' : 'N/A',
      trendUp: balance > 0
    },
    {
      label: 'Banks Mentioned',
      value: banks.length > 0 ? banks.join(', ') : '—',
      icon: <Building2 style={{ color: '#8b5cf6' }} size={24} />,
      trend: banks.length > 0 ? `${banks.length} detected` : 'None',
      trendUp: banks.length > 0
    },
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

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function FinancialCharts({ data }) {
  const parseAmount = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    const cleaned = String(val).replace(/[₹,\s]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const income = parseAmount(data.income);
  const emi = parseAmount(data.emi);
  const sip = parseAmount(data.sip);

  const chartData = [
    { name: 'Income', value: income, color: '#10b981' },
    { name: 'EMI', value: emi, color: '#ef4444' },
    { name: 'SIP', value: sip, color: '#6366f1' },
    { name: 'Balance', value: Math.max(0, income - emi - sip), color: '#3b82f6' },
  ];

  return (
    <div className="insight-card" style={{ gridColumn: 'span 2', minHeight: '300px' }}>
      <h3 className="insight-label">Financial Breakdown</h3>
      <div style={{ width: '100%', height: '240px', marginTop: '16px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
              }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

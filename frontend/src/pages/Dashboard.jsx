import React, { useEffect, useState, useMemo } from 'react';
import { analyticsApi } from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .incomeVsExpense()
      .then((res) => setData(res.data))
      .catch(() => setData({ income: 0, expense: 0, balance: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const cards = useMemo(
    () => [
      { label: 'Total Income', value: data.income, color: 'var(--success)' },
      { label: 'Total Expense', value: data.expense, color: 'var(--danger)' },
      { label: 'Balance', value: data.balance, color: 'var(--accent)' },
    ],
    [data]
  );

  if (loading) {
    return (
      <div className="container">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>Dashboard</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {cards.map((card) => (
          <div key={card.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: card.color }}>
              {typeof card.value === 'number' ? card.value.toFixed(2) : '0.00'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

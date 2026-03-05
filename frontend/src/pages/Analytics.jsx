import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { analyticsApi } from '../services/api';

const COLORS = ['#58a6ff', '#3fb950', '#d29922', '#f85149', '#a371f7', '#79c0ff'];

export default function Analytics() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [monthly, setMonthly] = useState([]);
  const [category, setCategory] = useState([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const now = new Date();
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    Promise.all([
      analyticsApi.monthly({ year }),
      analyticsApi.category({ startDate, endDate }),
      analyticsApi.incomeVsExpense({ startDate, endDate }),
    ])
      .then(([monthlyRes, categoryRes, incomeRes]) => {
        setMonthly(monthlyRes.data);
        setCategory(categoryRes.data);
        setIncomeVsExpense(incomeRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year]);

  const pieData = category.map((c, i) => ({ name: c.category, value: c.total, fill: COLORS[i % COLORS.length] }));
  const barData = monthly.map((m) => ({
    month: m.month?.slice(5) || m.month,
    income: m.income || 0,
    expense: m.expense || 0,
    balance: m.balance || 0,
  }));
  const lineData = monthly.map((m) => ({
    month: m.month,
    income: m.income || 0,
    expense: m.expense || 0,
  }));

  if (loading) {
    return (
      <div className="container">
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Analytics</h1>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={{ padding: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)' }}
        >
          {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Income vs Expense (Year)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[{ name: 'Income', value: incomeVsExpense.income }, { name: 'Expense', value: incomeVsExpense.expense }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" />
            <YAxis stroke="var(--text-muted)" />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
            <Bar dataKey="value" name="Amount">
              <Cell fill={COLORS[1]} />
              <Cell fill={COLORS[3]} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Category Distribution (Expenses)</h3>
        {pieData.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No expense data for this period.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Monthly Trend</h3>
        {lineData.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No data for this year.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke={COLORS[1]} name="Income" strokeWidth={2} />
              <Line type="monotone" dataKey="expense" stroke={COLORS[3]} name="Expense" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

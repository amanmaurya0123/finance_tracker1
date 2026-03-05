import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { transactionsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 20;

export default function Transactions() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'user';

  const [list, setList] = useState({ rows: [], total: 0, page: 1, totalPages: 0 });
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'add' | { id } for edit
  const [form, setForm] = useState({ type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().slice(0, 10) });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTransactions = useCallback((overridePage) => {
    const p = overridePage !== undefined ? overridePage : page;
    setLoading(true);
    transactionsApi
      .list({ page: p, limit: PAGE_SIZE, search: search || undefined, category: category || undefined, type: type || undefined, startDate: startDate || undefined, endDate: endDate || undefined })
      .then((res) => setList(res.data))
      .finally(() => setLoading(false));
  }, [page, search, category, type, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    transactionsApi.categories().then((res) => setCategories(res.data)).catch(() => {});
  }, [list.rows.length]);

  const openAdd = () => {
    setForm({ type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().slice(0, 10) });
    setError('');
    setModal('add');
  };

  const openEdit = (row) => {
    setForm({
      type: row.type,
      amount: row.amount,
      category: row.category,
      description: row.description || '',
      date: row.date?.slice(0, 10) || '',
    });
    setError('');
    setModal({ id: row.id });
  };

  const closeModal = () => setModal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);
    try {
      if (modal === 'add') {
        await transactionsApi.create({
          ...form,
          amount: parseFloat(form.amount),
          date: form.date,
        });
      } else {
        await transactionsApi.update(modal.id, {
          ...form,
          amount: parseFloat(form.amount),
          date: form.date,
        });
      }
      closeModal();
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await transactionsApi.delete(id);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Transactions</h1>
        {canEdit && (
          <button type="button" className="btn btn-primary" onClick={openAdd}>
            Add Transaction
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setPage(1) && fetchTransactions()}
            style={{ flex: '1 1 200px', padding: '0.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)' }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '0.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)' }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ padding: '0.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)' }}
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '0.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)' }}
            placeholder="Start date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: '0.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)' }}
            placeholder="End date"
          />
          <button type="button" className="btn btn-secondary" onClick={() => { setPage(1); fetchTransactions(1); }}>
            Filter
          </button>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        {loading ? (
          <p>Loading...</p>
        ) : list.rows.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No transactions found.</p>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem' }}>Amount</th>
                  {canEdit && <th style={{ padding: '0.75rem' }} />}
                </tr>
              </thead>
              <tbody>
                {list.rows.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem' }}>{row.date?.slice(0, 10)}</td>
                    <td style={{ padding: '0.75rem' }}>{row.type}</td>
                    <td style={{ padding: '0.75rem' }}>{row.category}</td>
                    <td style={{ padding: '0.75rem' }}>{row.description || '-'}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: row.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                      {row.type === 'income' ? '+' : '-'}{parseFloat(row.amount).toFixed(2)}
                    </td>
                    {canEdit && (
                      <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                        <button type="button" className="btn btn-secondary" style={{ marginRight: '0.5rem' }} onClick={() => openEdit(row)}>Edit</button>
                        <button type="button" className="btn btn-danger" onClick={() => handleDelete(row.id)}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {list.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
                <span style={{ alignSelf: 'center' }}>Page {page} of {list.totalPages}</span>
                <button className="btn btn-secondary" disabled={page >= list.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={closeModal}
        >
          <div className="card" style={{ minWidth: 320, maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>{modal === 'add' ? 'Add Transaction' : 'Edit Transaction'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} required>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required list="categories-list" />
                <datalist id="categories-list">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
              </div>
              {error && <p className="error-msg">{error}</p>}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                  {submitLoading ? 'Saving...' : 'Save'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

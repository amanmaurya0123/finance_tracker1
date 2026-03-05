import React, { useState, useEffect } from 'react';
import { usersApi } from '../services/api';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi
      .list()
      .then((res) => setUsers(res.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1rem' }}>Admin – Users</h1>
      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No users.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem' }}>{u.id}</td>
                  <td style={{ padding: '0.75rem' }}>{u.name}</td>
                  <td style={{ padding: '0.75rem' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem' }}>{u.role}</td>
                  <td style={{ padding: '0.75rem' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

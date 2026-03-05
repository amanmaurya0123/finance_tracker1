import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <NavLink
          to="/"
          end
          style={({ isActive }) => ({
            color: isActive ? 'var(--accent)' : 'var(--text)',
            fontWeight: isActive ? 600 : 400,
          })}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/transactions"
          style={({ isActive }) => ({
            color: isActive ? 'var(--accent)' : 'var(--text)',
            fontWeight: isActive ? 600 : 400,
          })}
        >
          Transactions
        </NavLink>
        <NavLink
          to="/analytics"
          style={({ isActive }) => ({
            color: isActive ? 'var(--accent)' : 'var(--text)',
            fontWeight: isActive ? 600 : 400,
          })}
        >
          Analytics
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            style={({ isActive }) => ({
              color: isActive ? 'var(--accent)' : 'var(--text)',
              fontWeight: isActive ? 600 : 400,
            })}
          >
            Admin
          </NavLink>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {user?.name} ({user?.role})
          </span>
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <main style={{ padding: '1.5rem' }}>
        <Outlet />
      </main>
    </div>
  );
}

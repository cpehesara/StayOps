import React, { useEffect, useState, useMemo } from 'react';
import '../styles/user-management.css';
import { fetchAllUsers } from '../api/user-management';

export default function OperationalManagersManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await fetchAllUsers();
        if (isMounted) setUsers(data || []);
      } catch {
        if (isMounted) setError('Failed to load users');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const opManagers = useMemo(() => users.filter(u => u.role === 'OPERATIONAL_MANAGER'), [users]);

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Operational Managers</h1>
          <span className="admin-breadcrumb">User Management / Operational Managers</span>
        </div>
      </div>

      <div className="admin-content">
        <div className="content-section">
          <h2 className="section-title">Manage Operational Managers</h2>
          {loading && <div className="metric-card"><div className="metric-label">Loading...</div></div>}
          {error && <div className="metric-card"><div className="metric-label" style={{color:'#c00'}}>{error}</div></div>}
          {!loading && !error && (
            <div className="metric-card">
              <div className="metric-label">Total: {opManagers.length}</div>
              <ul style={{margin:0, padding:'8px 0 0 16px'}}>
                {opManagers.map(u => (
                  <li key={u.id} style={{marginBottom:6, color:'#333'}}>
                    {u.email} — <span style={{color:'#666'}}>{u.username}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

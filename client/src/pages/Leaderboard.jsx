import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Forums.css';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await api.get('/users/leaderboard');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 0) return '🥇 1st';
    if (rank === 1) return '🥈 2nd';
    if (rank === 2) return '🥉 3rd';
    return `#${rank + 1}`;
  };

  return (
    <div className="forums-page page-enter">
      <div className="forums-hero">
        <div className="container text-center">
          <h1 className="forums-hero-title">
            Enthusiast <span className="gradient-text">Hall of Fame</span>
          </h1>
          <p className="forums-hero-subtitle">
            Celebrating the top contributors, mentors, and creators elevating the hobbyist community.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '900px' }}>
        {loading ? (
          <div className="forums-loading">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '80px', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-3)' }}></div>
            ))}
          </div>
        ) : (
          <div className="leaderboard-table-card glass-panel" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {users.map((u, idx) => (
                <Link
                  to={`/profile/${u._id}`}
                  key={u._id}
                  className={`animate-fade-in-up stagger-${Math.min(idx + 1, 8)}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-4) var(--space-6)',
                    borderRadius: 'var(--radius-xl)',
                    background: idx === 0 ? 'linear-gradient(90deg, rgba(234, 179, 8, 0.1), rgba(255, 255, 255, 0.02))' : idx === 1 ? 'linear-gradient(90deg, rgba(148, 163, 184, 0.1), rgba(255, 255, 255, 0.02))' : idx === 2 ? 'linear-gradient(90deg, rgba(217, 119, 6, 0.1), rgba(255, 255, 255, 0.02))' : 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--color-border)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{
                    fontSize: idx < 3 ? '1.25rem' : 'var(--fs-sm)',
                    fontWeight: 800,
                    minWidth: '50px',
                    color: idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#f59e0b' : 'var(--color-text-muted)'
                  }}>
                    {getRankBadge(idx)}
                  </div>

                  <img
                    src={u.avatar}
                    alt={u.username}
                    className="avatar avatar-md"
                    style={{ border: idx === 0 ? '2px solid #fbbf24' : '2px solid transparent' }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: 'var(--fs-base)' }}>
                        {u.username}
                      </span>
                      <span className={`badge badge-sm badge-${u.level?.toLowerCase() || 'novice'}`}>
                        {u.level}
                      </span>
                    </div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {u.threadCount || 0} threads • {u.postCount || 0} posts
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 800 }} className="gradient-text">
                      {u.reputation || 0}
                    </div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>
                      reputation
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;

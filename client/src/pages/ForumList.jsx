import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Forums.css';

const ForumList = () => {
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForums();
  }, []);

  const loadForums = async () => {
    try {
      const res = await api.get('/forums');
      setForums(res.data.data);
    } catch (error) {
      console.error('Error loading forums:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="forums-page page-enter">
        <div className="container">
          <div className="forums-loading">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-xl)' }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forums-page page-enter">
      <div className="forums-hero">
        <div className="container">
          <h1 className="forums-hero-title">Forum <span className="gradient-text">Categories</span></h1>
          <p className="forums-hero-subtitle">Browse all hobby communities and join the conversation</p>
        </div>
      </div>

      <div className="container">
        <div className="forums-list">
          {forums.map((forum, index) => (
            <Link
              to={`/forums/${forum._id}`}
              key={forum._id}
              className={`forum-list-item animate-fade-in-up stagger-${index + 1}`}
              style={{ '--card-color': forum.color }}
            >
              <div className="forum-list-icon" style={{ background: forum.gradient }}>
                <span>{forum.icon}</span>
              </div>
              <div className="forum-list-info">
                <h3 className="forum-list-name">{forum.name}</h3>
                <p className="forum-list-desc">{forum.description}</p>
              </div>
              <div className="forum-list-stats">
                <div className="forum-list-stat">
                  <span className="forum-stat-value">{forum.threadCount}</span>
                  <span className="forum-stat-label">Threads</span>
                </div>
                <div className="forum-list-stat">
                  <span className="forum-stat-value">{forum.postCount}</span>
                  <span className="forum-stat-label">Posts</span>
                </div>
              </div>
              <div className="forum-list-arrow">→</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumList;

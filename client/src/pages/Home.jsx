import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [forums, setForums] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [forumsRes, statsRes] = await Promise.all([
        api.get('/forums'),
        api.get('/forums/stats')
      ]);
      setForums(forumsRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="home page-enter">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
          <div className="hero-grid-pattern"></div>
        </div>

        <div className="container hero-content">
          <div className="hero-badge animate-fade-in-down">
            <span className="hero-badge-dot"></span>
            <span>Join 10,000+ Hobbyists Worldwide</span>
          </div>

          <h1 className="hero-title animate-fade-in">
            Where <span className="hero-gradient-text">Passion</span> Meets
            <br />
            <span className="hero-gradient-text">Community</span>
          </h1>

          <p className="hero-subtitle animate-fade-in">
            Connect with fellow enthusiasts, share your expertise, and discover new hobbies.
            From photography to gaming, cooking to coding — your tribe is here.
          </p>

          <div className="hero-actions animate-fade-in-up">
            {user ? (
              <Link to="/forums" className="btn btn-primary btn-lg">
                <span>Explore Forums</span>
                <span className="btn-arrow">→</span>
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  <span>Get Started Free</span>
                  <span className="btn-arrow">→</span>
                </Link>
                <Link to="/forums" className="btn btn-secondary btn-lg">
                  Browse Forums
                </Link>
              </>
            )}
          </div>

          {/* Stats bar */}
          {stats && (
            <div className="hero-stats animate-fade-in-up">
              <div className="hero-stat">
                <span className="hero-stat-value">{stats.totalForums}</span>
                <span className="hero-stat-label">Forums</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="hero-stat-value">{stats.totalThreads}</span>
                <span className="hero-stat-label">Threads</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="hero-stat-value">{stats.totalPosts}</span>
                <span className="hero-stat-label">Posts</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="hero-stat-value">∞</span>
                <span className="hero-stat-label">Passion</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">
              <span className="section-label-dot"></span>
              Explore
            </div>
            <h2 className="section-title">Find Your <span className="gradient-text">Community</span></h2>
            <p className="section-subtitle">
              Dive into 8 curated hobby categories with active discussions and passionate members.
            </p>
          </div>

          <div className="categories-grid">
            {forums.map((forum, index) => (
              <Link
                to={`/forums/${forum._id}`}
                key={forum._id}
                className={`category-card animate-fade-in-up stagger-${index + 1}`}
                style={{ '--card-color': forum.color }}
              >
                <div className="category-card-glow"></div>
                <div className="category-icon">{forum.icon}</div>
                <div className="category-info">
                  <h3 className="category-name">{forum.name}</h3>
                  <p className="category-desc">{forum.description}</p>
                </div>
                <div className="category-stats">
                  <span className="category-stat">
                    <span className="stat-icon">📝</span>
                    {forum.threadCount} threads
                  </span>
                  <span className="category-stat">
                    <span className="stat-icon">💬</span>
                    {forum.postCount} posts
                  </span>
                </div>
                <div className="category-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      {stats && stats.trendingThreads && stats.trendingThreads.length > 0 && (
        <section className="trending-section">
          <div className="container">
            <div className="section-header">
              <div className="section-label">
                <span className="section-label-dot fire"></span>
                Trending
              </div>
              <h2 className="section-title">Hot <span className="gradient-text">Discussions</span></h2>
              <p className="section-subtitle">
                The most talked about threads this week across all forums.
              </p>
            </div>

            <div className="trending-grid">
              {stats.trendingThreads.map((thread, index) => (
                <Link
                  to={`/threads/${thread._id}`}
                  key={thread._id}
                  className={`trending-card glass-card animate-fade-in-up stagger-${index + 1}`}
                >
                  <div className="trending-rank">#{index + 1}</div>
                  <div className="trending-content">
                    <div className="trending-forum-badge" style={{ background: thread.forum?.color + '22', color: thread.forum?.color }}>
                      {thread.forum?.icon} {thread.forum?.name}
                    </div>
                    <h3 className="trending-title">{thread.title}</h3>
                    <div className="trending-meta">
                      <div className="trending-author">
                        <img src={thread.author?.avatar} alt="" className="avatar avatar-sm" />
                        <span>{thread.author?.username}</span>
                      </div>
                      <div className="trending-stats">
                        <span>▲ {thread.voteScore}</span>
                        <span>💬 {thread.postCount}</span>
                        <span>👁 {thread.views}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Activity */}
      {stats && stats.recentThreads && stats.recentThreads.length > 0 && (
        <section className="recent-section">
          <div className="container">
            <div className="section-header">
              <div className="section-label">
                <span className="section-label-dot pulse"></span>
                Latest
              </div>
              <h2 className="section-title">Recent <span className="gradient-text">Activity</span></h2>
            </div>

            <div className="recent-list">
              {stats.recentThreads.map((thread, index) => (
                <Link
                  to={`/threads/${thread._id}`}
                  key={thread._id}
                  className={`recent-item animate-fade-in-up stagger-${index + 1}`}
                >
                  <div className="recent-forum-icon" style={{ background: thread.forum?.color + '22' }}>
                    {thread.forum?.icon}
                  </div>
                  <div className="recent-info">
                    <h4 className="recent-title">{thread.title}</h4>
                    <div className="recent-meta">
                      <span className="recent-author">
                        by <strong>{thread.author?.username}</strong>
                      </span>
                      <span className="recent-forum">in {thread.forum?.name}</span>
                      <span className="recent-time">{formatTimeAgo(thread.createdAt)}</span>
                    </div>
                  </div>
                  <div className="recent-stats-mini">
                    <span>💬 {thread.postCount}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!user && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-card">
              <div className="cta-bg-orb"></div>
              <h2 className="cta-title">Ready to Join the <span className="gradient-text">Community</span>?</h2>
              <p className="cta-subtitle">
                Create your free account and start connecting with thousands of hobbyists who share your passions.
              </p>
              <div className="cta-actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

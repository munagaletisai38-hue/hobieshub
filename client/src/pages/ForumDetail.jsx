import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Forums.css';

const ForumDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [forum, setForum] = useState(null);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [id, sort, page]);

  const loadData = async () => {
    try {
      const [forumRes, threadsRes] = await Promise.all([
        api.get(`/forums/${id}`),
        api.get(`/threads?forum=${id}&sort=${sort}&page=${page}&limit=10`)
      ]);
      setForum(forumRes.data.data);
      setThreads(threadsRes.data.data);
      setTotalPages(threadsRes.data.totalPages);
    } catch (error) {
      console.error('Error loading forum:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="forums-page page-enter">
        <div className="container">
          <div className="forums-loading">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-lg)' }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!forum) return null;

  return (
    <div className="forums-page page-enter">
      <div className="forum-detail-hero" style={{ '--card-color': forum.color }}>
        <div className="forum-detail-hero-bg" style={{ background: forum.gradient }}></div>
        <div className="container">
          <div className="forum-detail-header">
            <Link to="/forums" className="back-link">← All Forums</Link>
            <div className="forum-detail-title-row">
              <span className="forum-detail-icon">{forum.icon}</span>
              <div>
                <h1 className="forum-detail-name">{forum.name}</h1>
                <p className="forum-detail-desc">{forum.description}</p>
              </div>
            </div>
            <div className="forum-detail-stats">
              <span>{forum.threadCount} threads</span>
              <span>•</span>
              <span>{forum.postCount} posts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="forum-toolbar">
          <div className="sort-buttons">
            <button className={`sort-btn ${sort === 'latest' ? 'active' : ''}`} onClick={() => { setSort('latest'); setPage(1); }}>
              🕐 Latest
            </button>
            <button className={`sort-btn ${sort === 'popular' ? 'active' : ''}`} onClick={() => { setSort('popular'); setPage(1); }}>
              🔥 Popular
            </button>
            <button className={`sort-btn ${sort === 'active' ? 'active' : ''}`} onClick={() => { setSort('active'); setPage(1); }}>
              💬 Active
            </button>
          </div>

          {user && (
            <Link to={`/create-thread?forum=${id}`} className="btn btn-primary">
              ✏️ New Thread
            </Link>
          )}
        </div>

        {threads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No threads yet</h3>
            <p>Be the first to start a discussion in this forum!</p>
            {user && (
              <Link to={`/create-thread?forum=${id}`} className="btn btn-primary">Create First Thread</Link>
            )}
          </div>
        ) : (
          <div className="threads-list">
            {threads.map((thread, index) => (
              <Link
                to={`/threads/${thread._id}`}
                key={thread._id}
                className={`thread-item animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
              >
                <div className="thread-vote-col">
                  <span className="thread-vote-score">{thread.voteScore}</span>
                  <span className="thread-vote-label">votes</span>
                </div>

                <div className="thread-content-col">
                  <div className="thread-title-row">
                    {thread.isPinned && <span className="thread-pin">📌</span>}
                    {thread.isLocked && <span className="thread-lock">🔒</span>}
                    <h3 className="thread-title">{thread.title}</h3>
                  </div>
                  <div className="thread-tags">
                    {thread.tags?.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="thread-meta">
                    <div className="thread-author-info">
                      <img src={thread.author?.avatar} alt="" className="avatar avatar-sm" />
                      <span>{thread.author?.username}</span>
                      <span className={`badge badge-${thread.author?.level?.toLowerCase()}`}>{thread.author?.level}</span>
                    </div>
                    <span className="thread-time">{formatTimeAgo(thread.createdAt)}</span>
                  </div>
                </div>

                <div className="thread-stats-col">
                  <div className="thread-stat-item">
                    <span className="thread-stat-num">{thread.postCount}</span>
                    <span className="thread-stat-lbl">replies</span>
                  </div>
                  <div className="thread-stat-item">
                    <span className="thread-stat-num">{thread.views}</span>
                    <span className="thread-stat-lbl">views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              ← Previous
            </button>
            <span className="pagination-info">Page {page} of {totalPages}</span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumDetail;

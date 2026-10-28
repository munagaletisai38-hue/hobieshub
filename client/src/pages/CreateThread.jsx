import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CreateThread.css';

const CreateThread = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const preselectedForum = searchParams.get('forum') || '';

  const [forums, setForums] = useState([]);
  const [selectedForum, setSelectedForum] = useState(preselectedForum);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadForums();
  }, [user]);

  const loadForums = async () => {
    try {
      const res = await api.get('/forums');
      setForums(res.data.data);
      if (!selectedForum && res.data.data.length > 0) {
        setSelectedForum(res.data.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching forums:', err);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = currentTag.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
        setTags([...tags, trimmed]);
        setCurrentTag('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const insertFormatting = (prefix, suffix = '') => {
    setContent(prev => prev + `${prefix}text${suffix}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !selectedForum) {
      setError('Please provide a title, content, and select a forum.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        forum: selectedForum,
        tags
      };

      const res = await api.post('/threads', payload);
      navigate(`/threads/${res.data.data._id}`);
    } catch (err) {
      console.error('Failed to create thread:', err);
      setError(err.response?.data?.message || 'Failed to create discussion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeForum = forums.find(f => f._id === selectedForum);

  return (
    <div className="create-thread-page page-enter">
      <div className="container">
        {/* Header */}
        <div className="create-thread-header">
          <Link to={selectedForum ? `/forums/${selectedForum}` : '/forums'} className="back-link">
            ← Cancel & Back
          </Link>
          <h1 className="create-thread-title">
            Start a New <span className="gradient-text">Discussion</span>
          </h1>
          <p className="create-thread-subtitle">
            Share your projects, ask questions, or exchange ideas with fellow enthusiasts.
          </p>
        </div>

        {error && (
          <div className="create-thread-error animate-fade-in-up">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="create-thread-grid">
          {/* Main Form */}
          <div className="create-thread-main">
            <form onSubmit={handleSubmit} className="thread-form glass-panel">
              {/* Forum Selector */}
              <div className="form-group">
                <label className="form-label">Select Hobby Community</label>
                <div className="forum-selector-grid">
                  {forums.map(f => (
                    <button
                      key={f._id}
                      type="button"
                      className={`forum-pill-btn ${selectedForum === f._id ? 'selected' : ''}`}
                      onClick={() => setSelectedForum(f._id)}
                      style={{ '--forum-accent': f.color }}
                    >
                      <span className="forum-pill-icon">{f.icon}</span>
                      <span className="forum-pill-name">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="form-group">
                <label htmlFor="thread-title" className="form-label">
                  Discussion Title <span className="required-star">*</span>
                </label>
                <input
                  id="thread-title"
                  type="text"
                  className="form-input form-input-lg"
                  placeholder="e.g. Best macro lenses for beginner wildlife photography?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={150}
                  required
                />
                <div className="form-hint">
                  <span>Be descriptive and specific to get better engagement.</span>
                  <span>{title.length}/150</span>
                </div>
              </div>

              {/* Tags Input */}
              <div className="form-group">
                <label className="form-label">Tags (Up to 5)</label>
                <div className="tags-input-container">
                  {tags.map(t => (
                    <span key={t} className="tag-chip">
                      #{t}
                      <button type="button" className="tag-remove-btn" onClick={() => removeTag(t)}>✕</button>
                    </span>
                  ))}
                  {tags.length < 5 && (
                    <input
                      type="text"
                      className="tag-input-inline"
                      placeholder="Add tag and press Enter..."
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                  )}
                </div>
                <span className="form-hint">Press Enter or comma to add a tag</span>
              </div>

              {/* Content Editor with Write / Preview Tabs */}
              <div className="form-group">
                <div className="editor-tab-header">
                  <label className="form-label" style={{ margin: 0 }}>Content Body <span className="required-star">*</span></label>
                  <div className="tab-switch">
                    <button
                      type="button"
                      className={`tab-btn ${!previewMode ? 'active' : ''}`}
                      onClick={() => setPreviewMode(false)}
                    >
                      ✏️ Write
                    </button>
                    <button
                      type="button"
                      className={`tab-btn ${previewMode ? 'active' : ''}`}
                      onClick={() => setPreviewMode(true)}
                    >
                      👁️ Live Preview
                    </button>
                  </div>
                </div>

                {!previewMode ? (
                  <div className="editor-container">
                    <div className="editor-toolbar">
                      <button type="button" className="toolbar-btn" onClick={() => insertFormatting('**', '**')}>
                        <strong>B</strong>
                      </button>
                      <button type="button" className="toolbar-btn" onClick={() => insertFormatting('*', '*')}>
                        <em>I</em>
                      </button>
                      <button type="button" className="toolbar-btn" onClick={() => insertFormatting('`', '`')}>
                        &lt;/&gt;
                      </button>
                      <button type="button" className="toolbar-btn" onClick={() => insertFormatting('> ')}>
                        ”
                      </button>
                      <button type="button" className="toolbar-btn" onClick={() => insertFormatting('### ')}>
                        H3
                      </button>
                      <button type="button" className="toolbar-btn" onClick={() => insertFormatting('- ')}>
                        • List
                      </button>
                    </div>
                    <textarea
                      className="form-textarea"
                      rows="12"
                      placeholder="Write your discussion here. Detailed explanations, your gear/setup, tips, or questions are appreciated..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    ></textarea>
                  </div>
                ) : (
                  <div className="editor-preview-box">
                    {content.trim() ? (
                      content.split('\n').map((line, idx) => (
                        <p key={idx}>{line || <br />}</p>
                      ))
                    ) : (
                      <p className="preview-empty">Start typing in the Write tab to see how your post will look.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="form-actions">
                <Link to="/forums" className="btn btn-secondary">
                  Discard
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading || !title.trim() || !content.trim()}
                >
                  {loading ? 'Publishing Discussion...' : '🚀 Publish Discussion'}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Guidelines */}
          <aside className="create-thread-sidebar">
            {activeForum && (
              <div className="sidebar-card glass-panel forum-preview-card" style={{ '--card-color': activeForum.color }}>
                <div className="forum-preview-header">
                  <span className="forum-preview-icon">{activeForum.icon}</span>
                  <div>
                    <h4>Posting in {activeForum.name}</h4>
                    <p>{activeForum.description}</p>
                  </div>
                </div>
                <div className="forum-preview-stats">
                  <span>{activeForum.threadCount} threads</span>
                  <span>{activeForum.postCount} posts</span>
                </div>
              </div>
            )}

            <div className="sidebar-card glass-panel community-rules-card">
              <h4>✨ Community Guidelines</h4>
              <ul className="rules-list">
                <li>
                  <span className="rule-icon">🎯</span>
                  <div>
                    <strong>Keep it relevant</strong>
                    <p>Post in the category that best matches your topic.</p>
                  </div>
                </li>
                <li>
                  <span className="rule-icon">🤝</span>
                  <div>
                    <strong>Be constructive & kind</strong>
                    <p>Encourage beginners and offer helpful critique.</p>
                  </div>
                </li>
                <li>
                  <span className="rule-icon">🔍</span>
                  <div>
                    <strong>Search first</strong>
                    <p>Check if a similar topic was recently discussed.</p>
                  </div>
                </li>
                <li>
                  <span className="rule-icon">💡</span>
                  <div>
                    <strong>Share the details</strong>
                    <p>Include settings, materials, specs, or logs.</p>
                  </div>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CreateThread;

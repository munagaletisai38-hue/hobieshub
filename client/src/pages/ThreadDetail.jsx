import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Thread.css';

const ThreadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [voting, setVoting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadThreadAndPosts();
  }, [id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const loadThreadAndPosts = async () => {
    try {
      const [threadRes, postsRes] = await Promise.all([
        api.get(`/threads/${id}`),
        api.get(`/posts?thread=${id}&limit=50`)
      ]);
      setThread(threadRes.data.data);
      setPosts(postsRes.data.data);
    } catch (error) {
      console.error('Error loading thread:', error);
      showToast('Failed to load thread.');
    } finally {
      setLoading(false);
    }
  };

  const handleThreadVote = async (type) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (voting) return;
    setVoting(true);
    try {
      const res = await api.put(`/threads/${id}/vote`, { type });
      setThread(prev => ({
        ...prev,
        voteScore: res.data.data.voteScore,
        upvotes: res.data.data.upvotes,
        downvotes: res.data.data.downvotes
      }));
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setVoting(false);
    }
  };

  const handlePostVote = async (postId, type) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.put(`/posts/${postId}/vote`, { type });
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          return {
            ...p,
            voteScore: res.data.data.voteScore,
            upvotes: res.data.data.upvotes,
            downvotes: res.data.data.downvotes
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Post vote failed:', error);
    }
  };

  const handleCreateReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmittingReply(true);
    try {
      const payload = {
        content: replyContent,
        thread: id,
        parentPost: replyingTo ? replyingTo._id : null
      };
      const res = await api.post('/posts', payload);
      setPosts(prev => [...prev, res.data.data]);
      setThread(prev => ({
        ...prev,
        postCount: prev.postCount + 1
      }));
      setReplyContent('');
      setReplyingTo(null);
      showToast('Reply posted successfully!');
    } catch (error) {
      console.error('Reply submission failed:', error);
      showToast('Failed to post reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const insertFormatting = (prefix, suffix = '') => {
    setReplyContent(prev => prev + `${prefix}text${suffix}`);
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

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Thread link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="thread-page page-enter">
        <div className="container">
          <div className="thread-skeleton-box skeleton" style={{ height: '300px', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-6)' }}></div>
          <div className="thread-skeleton-box skeleton" style={{ height: '160px', borderRadius: 'var(--radius-xl)' }}></div>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="thread-page page-enter">
        <div className="container text-center" style={{ padding: 'var(--space-16) 0' }}>
          <h2>Thread not found</h2>
          <p style={{ color: 'var(--color-text-secondary)', margin: 'var(--space-4) 0 var(--space-8)' }}>This thread may have been removed or does not exist.</p>
          <Link to="/forums" className="btn btn-primary">Return to Forums</Link>
        </div>
      </div>
    );
  }

  const hasUpvotedThread = user && thread.upvotes?.includes(user._id || user.id);
  const hasDownvotedThread = user && thread.downvotes?.includes(user._id || user.id);

  return (
    <div className="thread-page page-enter">
      {toastMessage && (
        <div className="thread-toast-notification">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="thread-nav-bar">
        <div className="container">
          <nav className="breadcrumbs">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/forums">Forums</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to={`/forums/${thread.forum?._id}`}>
              <span className="breadcrumb-forum-badge" style={{ borderColor: thread.forum?.color }}>
                {thread.forum?.icon} {thread.forum?.name}
              </span>
            </Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{thread.title}</span>
          </nav>
        </div>
      </div>

      <div className="container">
        {/* Main OP Thread Card */}
        <article className="op-card glass-panel animate-fade-in-up">
          <div className="op-header">
            <div className="op-badges">
              {thread.isPinned && <span className="badge badge-pinned">📌 Pinned</span>}
              {thread.isLocked && <span className="badge badge-locked">🔒 Locked</span>}
              {thread.forum && (
                <span className="badge badge-category" style={{ backgroundColor: `${thread.forum.color}22`, color: thread.forum.color, borderColor: thread.forum.color }}>
                  {thread.forum.icon} {thread.forum.name}
                </span>
              )}
            </div>
            <h1 className="op-title">{thread.title}</h1>
            <div className="op-tags">
              {thread.tags?.map(t => (
                <span key={t} className="tag tag-glow">#{t}</span>
              ))}
            </div>
          </div>

          <div className="op-body-grid">
            {/* Author Sidebar */}
            <aside className="author-card">
              <Link to={`/profile/${thread.author?._id}`} className="author-avatar-wrapper">
                <img src={thread.author?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Hobby'} alt={thread.author?.username} className="author-avatar" />
              </Link>
              <Link to={`/profile/${thread.author?._id}`} className="author-username">
                {thread.author?.username}
              </Link>
              <span className={`badge badge-${thread.author?.level?.toLowerCase() || 'novice'}`}>
                {thread.author?.level || 'Member'}
              </span>
              <div className="author-stats">
                <div className="author-stat-item">
                  <span className="stat-label">Reputation</span>
                  <span className="stat-value">{thread.author?.reputation || 0} ✨</span>
                </div>
                <div className="author-stat-item">
                  <span className="stat-label">Posts</span>
                  <span className="stat-value">{thread.author?.postCount || 0}</span>
                </div>
              </div>
            </aside>

            {/* Content & Vote Section */}
            <div className="op-main-content">
              <div className="op-meta-info">
                <span className="meta-time">Posted {formatTimeAgo(thread.createdAt)}</span>
                <span className="meta-dot">•</span>
                <span className="meta-views">👁️ {thread.views || 0} views</span>
              </div>

              <div className="op-text-content">
                {thread.content.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Action Bar */}
              <div className="op-action-bar">
                <div className="vote-widget">
                  <button
                    className={`vote-btn upvote ${hasUpvotedThread ? 'active' : ''}`}
                    onClick={() => handleThreadVote('up')}
                    aria-label="Upvote"
                    title="Upvote thread"
                  >
                    ▲
                  </button>
                  <span className={`vote-count ${thread.voteScore > 0 ? 'positive' : thread.voteScore < 0 ? 'negative' : ''}`}>
                    {thread.voteScore}
                  </span>
                  <button
                    className={`vote-btn downvote ${hasDownvotedThread ? 'active' : ''}`}
                    onClick={() => handleThreadVote('down')}
                    aria-label="Downvote"
                    title="Downvote thread"
                  >
                    ▼
                  </button>
                </div>

                <div className="op-secondary-actions">
                  <button className="btn-action" onClick={copyShareLink}>
                    🔗 Share
                  </button>
                  {!thread.isLocked && (
                    <button
                      className="btn-action reply-action"
                      onClick={() => {
                        document.getElementById('reply-composer')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      💬 Reply to Thread
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Replies Section */}
        <section className="replies-section">
          <div className="replies-header">
            <h2 className="replies-title">
              Community Discussion <span className="replies-counter">{posts.length}</span>
            </h2>
          </div>

          {posts.length === 0 ? (
            <div className="empty-replies glass-panel">
              <div className="empty-replies-icon">💭</div>
              <h3>No replies yet</h3>
              <p>Be the first enthusiast to share your thoughts, tips, or experiences!</p>
            </div>
          ) : (
            <div className="replies-list">
              {posts.map((post, index) => {
                const hasUpvotedPost = user && post.upvotes?.includes(user._id || user.id);
                const hasDownvotedPost = user && post.downvotes?.includes(user._id || user.id);

                return (
                  <div
                    key={post._id}
                    id={`post-${post._id}`}
                    className={`reply-card glass-panel animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
                  >
                    <div className="reply-body-grid">
                      {/* Mini author sidebar */}
                      <div className="reply-author-col">
                        <Link to={`/profile/${post.author?._id}`}>
                          <img
                            src={post.author?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Enthusiast'}
                            alt={post.author?.username}
                            className="avatar avatar-md"
                          />
                        </Link>
                        <Link to={`/profile/${post.author?._id}`} className="reply-author-name">
                          {post.author?.username}
                        </Link>
                        <span className={`badge badge-sm badge-${post.author?.level?.toLowerCase() || 'novice'}`}>
                          {post.author?.level || 'Member'}
                        </span>
                      </div>

                      {/* Reply Content */}
                      <div className="reply-content-col">
                        <div className="reply-meta-row">
                          <span className="reply-timestamp">{formatTimeAgo(post.createdAt)}</span>
                          {post.parentPost && (
                            <span className="replying-to-badge">
                              Replying to reference #{post.parentPost._id?.slice(-4)}
                            </span>
                          )}
                        </div>

                        <div className="reply-text">
                          {post.content.split('\n').map((para, pIdx) => (
                            <p key={pIdx}>{para}</p>
                          ))}
                        </div>

                        <div className="reply-actions-row">
                          <div className="vote-widget vote-widget-sm">
                            <button
                              className={`vote-btn upvote ${hasUpvotedPost ? 'active' : ''}`}
                              onClick={() => handlePostVote(post._id, 'up')}
                            >
                              ▲
                            </button>
                            <span className={`vote-count ${post.voteScore > 0 ? 'positive' : post.voteScore < 0 ? 'negative' : ''}`}>
                              {post.voteScore || 0}
                            </span>
                            <button
                              className={`vote-btn downvote ${hasDownvotedPost ? 'active' : ''}`}
                              onClick={() => handlePostVote(post._id, 'down')}
                            >
                              ▼
                            </button>
                          </div>

                          {!thread.isLocked && (
                            <button
                              className="btn-reply-quote"
                              onClick={() => {
                                setReplyingTo(post);
                                document.getElementById('reply-composer')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                            >
                              ↩️ Quote / Reply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Reply Composer Box */}
        <section id="reply-composer" className="reply-composer-section">
          {thread.isLocked ? (
            <div className="thread-locked-banner glass-panel">
              <span className="locked-icon">🔒</span>
              <div>
                <h4>This discussion has been locked</h4>
                <p>New replies can no longer be added to this thread.</p>
              </div>
            </div>
          ) : user ? (
            <div className="composer-card glass-panel">
              <div className="composer-header">
                <h3>Join the Conversation</h3>
                {replyingTo && (
                  <div className="replying-notice">
                    <span>Replying to <strong>@{replyingTo.author?.username}</strong></span>
                    <button className="cancel-reply-btn" onClick={() => setReplyingTo(null)}>✕ Cancel</button>
                  </div>
                )}
              </div>

              {/* Formatting Toolbar */}
              <div className="composer-toolbar">
                <button type="button" className="toolbar-btn" onClick={() => insertFormatting('**', '**')} title="Bold">
                  <strong>B</strong>
                </button>
                <button type="button" className="toolbar-btn" onClick={() => insertFormatting('*', '*')} title="Italic">
                  <em>I</em>
                </button>
                <button type="button" className="toolbar-btn" onClick={() => insertFormatting('`', '`')} title="Code">
                  &lt;/&gt;
                </button>
                <button type="button" className="toolbar-btn" onClick={() => insertFormatting('> ')} title="Quote">
                  ”
                </button>
                <button type="button" className="toolbar-btn" onClick={() => insertFormatting('[', '](https://)')} title="Link">
                  🔗
                </button>
              </div>

              <form onSubmit={handleCreateReply}>
                <textarea
                  className="composer-textarea"
                  rows="6"
                  placeholder="Contribute your expertise, ask a follow-up question, or share your passion..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  required
                ></textarea>

                <div className="composer-footer">
                  <span className="char-count">{replyContent.length} characters</span>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingReply || !replyContent.trim()}
                  >
                    {submittingReply ? 'Posting...' : '🚀 Post Reply'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="composer-login-prompt glass-panel">
              <div className="prompt-icon">💡</div>
              <h3>Have something to add to this discussion?</h3>
              <p>Log in or create a free enthusiast account to reply, upvote, and earn community reputation.</p>
              <div className="prompt-actions">
                <Link to="/login" className="btn btn-primary">Sign In</Link>
                <Link to="/register" className="btn btn-secondary">Create Account</Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ThreadDetail;

import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Search.css';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('q') || '';
  const filterType = searchParams.get('type') || 'all';

  const [inputVal, setInputVal] = useState(query);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInputVal(query);
    if (query.trim()) {
      executeSearch(query, filterType);
    }
  }, [query, filterType]);

  const executeSearch = async (searchTerm, type) => {
    try {
      setLoading(true);
      const res = await api.get(`/search?q=${encodeURIComponent(searchTerm)}&type=${type}&limit=20`);
      setResults(res.data.data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim(), type: filterType });
    }
  };

  const setFilter = (type) => {
    setSearchParams({ q: query, type });
  };

  const totalThreads = results?.threads?.total || 0;
  const totalPosts = results?.posts?.total || 0;
  const totalUsers = results?.users?.total || 0;
  const grandTotal = totalThreads + totalPosts + totalUsers;

  return (
    <div className="search-page page-enter">
      <div className="container">
        {/* Search Bar Section */}
        <div className="search-header-panel glass-panel">
          <h1 className="search-title">
            Search <span className="gradient-text">HobbyHub</span>
          </h1>
          <p className="search-subtitle">
            Find topics, guides, discussions, and fellow enthusiasts across all hobbies.
          </p>

          <form onSubmit={handleSearchSubmit} className="search-form-hero">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input-field"
                placeholder="Search keywords, techniques, gear, tags, users..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                autoFocus
              />
              {inputVal && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setInputVal('');
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary search-submit-btn">
              Search
            </button>
          </form>

          {/* Quick Filter Tabs */}
          {query && (
            <div className="search-filter-tabs">
              <button
                className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Results ({grandTotal})
              </button>
              <button
                className={`filter-tab ${filterType === 'threads' ? 'active' : ''}`}
                onClick={() => setFilter('threads')}
              >
                Discussions ({totalThreads})
              </button>
              <button
                className={`filter-tab ${filterType === 'posts' ? 'active' : ''}`}
                onClick={() => setFilter('posts')}
              >
                Replies ({totalPosts})
              </button>
              <button
                className={`filter-tab ${filterType === 'users' ? 'active' : ''}`}
                onClick={() => setFilter('users')}
              >
                Members ({totalUsers})
              </button>
            </div>
          )}
        </div>

        {/* Results Area */}
        <div className="search-results-section">
          {loading ? (
            <div className="search-loading">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '90px', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-4)' }}></div>
              ))}
            </div>
          ) : !query.trim() ? (
            <div className="search-placeholder glass-panel">
              <div className="placeholder-icon">💡</div>
              <h3>Explore Topics</h3>
              <p>Type in keywords like "camera", "arduino", "recipes", "keyboards", or an enthusiast's username.</p>
            </div>
          ) : grandTotal === 0 ? (
            <div className="search-empty glass-panel">
              <div className="placeholder-icon">🔎</div>
              <h3>No results found for "{query}"</h3>
              <p>Try searching with different terms or check for spelling errors.</p>
            </div>
          ) : (
            <div className="results-container">
              {/* Threads */}
              {(filterType === 'all' || filterType === 'threads') && results?.threads?.data?.length > 0 && (
                <div className="result-group">
                  <h3 className="result-group-title">Discussions ({results.threads.total})</h3>
                  <div className="threads-list">
                    {results.threads.data.map(thread => (
                      <Link to={`/threads/${thread._id}`} key={thread._id} className="thread-item glass-panel">
                        <div className="thread-vote-col">
                          <span className="thread-vote-score">{thread.voteScore || 0}</span>
                          <span className="thread-vote-label">votes</span>
                        </div>
                        <div className="thread-content-col">
                          <h4 className="thread-title">{thread.title}</h4>
                          <p className="search-snippet">
                            {thread.content?.slice(0, 160)}...
                          </p>
                          <div className="thread-meta">
                            {thread.forum && (
                              <span className="tag" style={{ color: thread.forum.color }}>
                                {thread.forum.icon} {thread.forum.name}
                              </span>
                            )}
                            <span className="thread-time">by @{thread.author?.username}</span>
                          </div>
                        </div>
                        <div className="thread-stats-col">
                          <span className="thread-stat-num">{thread.postCount || 0}</span>
                          <span className="thread-stat-lbl">replies</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {(filterType === 'all' || filterType === 'posts') && results?.posts?.data?.length > 0 && (
                <div className="result-group">
                  <h3 className="result-group-title">Replies ({results.posts.total})</h3>
                  <div className="search-posts-list">
                    {results.posts.data.map(post => (
                      <div key={post._id} className="search-post-card glass-panel">
                        <div className="search-post-header">
                          <span className="post-author-tag">@{post.author?.username}</span>
                          <span>replied in</span>
                          <Link to={`/threads/${post.thread?._id}`} className="post-thread-title">
                            {post.thread?.title || 'View Discussion'} →
                          </Link>
                        </div>
                        <p className="search-post-content">{post.content}</p>
                        <div className="search-post-footer">
                          <span>❤️ {post.voteScore || 0} upvotes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {(filterType === 'all' || filterType === 'users') && results?.users?.data?.length > 0 && (
                <div className="result-group">
                  <h3 className="result-group-title">Members ({results.users.total})</h3>
                  <div className="search-users-grid">
                    {results.users.data.map(u => (
                      <Link to={`/profile/${u._id}`} key={u._id} className="search-user-card glass-panel">
                        <img src={u.avatar} alt={u.username} className="avatar avatar-lg" />
                        <div className="search-user-info">
                          <div className="search-user-top">
                            <h4 className="search-username">{u.username}</h4>
                            <span className={`badge badge-sm badge-${u.level?.toLowerCase() || 'novice'}`}>
                              {u.level || 'Novice'}
                            </span>
                          </div>
                          <p className="search-user-bio">{u.bio || 'Hobby enthusiast'}</p>
                          <span className="search-user-rep">✨ {u.reputation || 0} reputation</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;

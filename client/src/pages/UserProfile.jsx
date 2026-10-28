import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Profile.css';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  // If no :id is in route, check currentUser
  const targetUserId = id || (currentUser ? currentUser._id || currentUser.id : null);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('threads'); // 'threads' | 'posts' | 'edit'
  const [editBio, setEditBio] = useState('');
  const [editInterests, setEditInterests] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const isOwnProfile = currentUser && targetUserId && (currentUser._id === targetUserId || currentUser.id === targetUserId);

  useEffect(() => {
    if (targetUserId) {
      loadProfile(targetUserId);
    } else {
      setLoading(false);
    }
  }, [targetUserId]);

  const loadProfile = async (uid) => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${uid}`);
      setProfileData(res.data.data);
      if (res.data.data.user) {
        setEditBio(res.data.data.user.bio || '');
        setEditInterests(res.data.data.user.interests?.join(', ') || '');
        setEditAvatar(res.data.data.user.avatar || '');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!isOwnProfile) return;
    setSaving(true);
    try {
      const interestsArray = editInterests.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.put(`/users/${targetUserId}`, {
        bio: editBio,
        interests: interestsArray,
        avatar: editAvatar
      });
      setProfileData(prev => ({
        ...prev,
        user: res.data.data
      }));
      setFeedbackMsg('Profile updated successfully!');
      setTimeout(() => setFeedbackMsg(''), 3000);
      setActiveTab('threads');
    } catch (err) {
      console.error('Update profile error:', err);
      setFeedbackMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const formatJoinedDate = (d) => {
    if (!d) return 'Recently';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  const avatarSeeds = ['Felix', 'Luna', 'Atlas', 'Nova', 'Jasper', 'Echo', 'Orion'];

  if (loading) {
    return (
      <div className="profile-page page-enter">
        <div className="container">
          <div className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-2xl)', marginBottom: 'var(--space-6)' }}></div>
          <div className="skeleton" style={{ height: '350px', borderRadius: 'var(--radius-2xl)' }}></div>
        </div>
      </div>
    );
  }

  if (!profileData || !profileData.user) {
    return (
      <div className="profile-page page-enter">
        <div className="container text-center" style={{ padding: 'var(--space-16) 0' }}>
          <h2>User Profile Not Found</h2>
          <p style={{ color: 'var(--color-text-secondary)', margin: 'var(--space-4) 0 var(--space-8)' }}>
            The requested member profile could not be retrieved.
          </p>
          <Link to="/" className="btn btn-primary">Return Home</Link>
        </div>
      </div>
    );
  }

  const { user, recentThreads = [], recentPosts = [] } = profileData;

  return (
    <div className="profile-page page-enter">
      <div className="container">
        {feedbackMsg && (
          <div className="profile-toast animate-fade-in-up">
            ✨ {feedbackMsg}
          </div>
        )}

        {/* Profile Hero Card */}
        <div className="profile-card glass-panel">
          <div className="profile-banner">
            <div className="profile-banner-mesh"></div>
          </div>

          <div className="profile-header-content">
            <div className="profile-avatar-wrapper">
              <img src={user.avatar} alt={user.username} className="profile-avatar" />
              <div className="profile-rank-indicator">
                {user.level === 'Legend' ? '👑' : user.level === 'Master' ? '⭐' : user.level === 'Expert' ? '🔥' : '✨'}
              </div>
            </div>

            <div className="profile-user-info">
              <div className="profile-name-row">
                <h1 className="profile-username">{user.username}</h1>
                <span className={`badge badge-lg badge-${user.level?.toLowerCase() || 'novice'}`}>
                  {user.level || 'Novice'}
                </span>
                {isOwnProfile && (
                  <button
                    className={`btn-edit-profile-toggle ${activeTab === 'edit' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'edit' ? 'threads' : 'edit')}
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              <p className="profile-bio">{user.bio || 'Passionate hobbyist exploring crafts and projects.'}</p>

              {user.interests && user.interests.length > 0 && (
                <div className="profile-interests">
                  {user.interests.map((interest, i) => (
                    <span key={i} className="interest-pill">
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="profile-stats-bar">
            <div className="profile-stat-box">
              <span className="stat-num gradient-text">{user.reputation || 0}</span>
              <span className="stat-desc">Reputation Score</span>
            </div>
            <div className="profile-stat-box">
              <span className="stat-num">{user.threadCount || recentThreads.length || 0}</span>
              <span className="stat-desc">Discussions Started</span>
            </div>
            <div className="profile-stat-box">
              <span className="stat-num">{user.postCount || recentPosts.length || 0}</span>
              <span className="stat-desc">Replies Contributed</span>
            </div>
            <div className="profile-stat-box">
              <span className="stat-num">{formatJoinedDate(user.createdAt)}</span>
              <span className="stat-desc">Member Since</span>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        {user.badges && user.badges.length > 0 && (
          <div className="profile-badges-card glass-panel">
            <h3 className="section-title">🏆 Earned Badges</h3>
            <div className="badges-grid">
              {user.badges.map((badge, idx) => (
                <div key={idx} className="badge-showcase-item">
                  <span className="badge-item-icon">🏅</span>
                  <div className="badge-item-info">
                    <span className="badge-item-name">{badge.name || badge}</span>
                    <span className="badge-item-desc">{badge.description || 'Awarded for active participation'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigator */}
        <div className="profile-tabs-nav">
          <button
            className={`profile-tab-btn ${activeTab === 'threads' ? 'active' : ''}`}
            onClick={() => setActiveTab('threads')}
          >
            💬 Discussions ({recentThreads.length})
          </button>
          <button
            className={`profile-tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            💭 Replies ({recentPosts.length})
          </button>
          {isOwnProfile && (
            <button
              className={`profile-tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              ⚙️ Account Settings
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="profile-tab-content">
          {activeTab === 'threads' && (
            <div className="threads-list">
              {recentThreads.length === 0 ? (
                <div className="empty-profile-state glass-panel">
                  <p>No discussions created yet.</p>
                  {isOwnProfile && (
                    <Link to="/create-thread" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
                      Start Your First Thread
                    </Link>
                  )}
                </div>
              ) : (
                recentThreads.map(thread => (
                  <Link to={`/threads/${thread._id}`} key={thread._id} className="thread-item glass-panel">
                    <div className="thread-vote-col">
                      <span className="thread-vote-score">{thread.voteScore || 0}</span>
                      <span className="thread-vote-label">votes</span>
                    </div>
                    <div className="thread-content-col">
                      <div className="thread-title-row">
                        <h3 className="thread-title">{thread.title}</h3>
                      </div>
                      <div className="thread-meta">
                        {thread.forum && (
                          <span className="tag" style={{ color: thread.forum.color }}>
                            {thread.forum.icon} {thread.forum.name}
                          </span>
                        )}
                        <span className="thread-time">{new Date(thread.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="thread-stats-col">
                      <span className="thread-stat-num">{thread.postCount || 0}</span>
                      <span className="thread-stat-lbl">replies</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="profile-posts-list">
              {recentPosts.length === 0 ? (
                <div className="empty-profile-state glass-panel">
                  <p>No replies contributed yet.</p>
                  <Link to="/forums" className="btn btn-secondary" style={{ marginTop: 'var(--space-4)' }}>
                    Browse Forums
                  </Link>
                </div>
              ) : (
                recentPosts.map(post => (
                  <div key={post._id} className="profile-post-card glass-panel">
                    <div className="profile-post-header">
                      <span>Replied in discussion:</span>
                      <Link to={`/threads/${post.thread?._id}`} className="post-thread-link">
                        {post.thread?.title || 'View Thread'} →
                      </Link>
                    </div>
                    <p className="profile-post-text">{post.content}</p>
                    <div className="profile-post-footer">
                      <span>❤️ {post.voteScore || 0} votes</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'edit' && isOwnProfile && (
            <div className="edit-profile-card glass-panel">
              <h3 className="section-title">Customize Your Profile</h3>
              <form onSubmit={handleUpdateProfile} className="edit-profile-form">
                <div className="form-group">
                  <label className="form-label">Avatar Selection</label>
                  <div className="avatar-picker-row">
                    <img src={editAvatar} alt="Preview" className="avatar-preview" />
                    <div className="avatar-presets">
                      <span className="preset-label">Pick an avatar:</span>
                      <div className="preset-chips">
                        {avatarSeeds.map(seed => {
                          const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                          return (
                            <img
                              key={seed}
                              src={url}
                              alt={seed}
                              className={`avatar-preset-img ${editAvatar === url ? 'selected' : ''}`}
                              onClick={() => setEditAvatar(url)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    style={{ marginTop: 'var(--space-3)' }}
                    placeholder="Or paste custom image URL"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio-input" className="form-label">About You (Bio)</label>
                  <textarea
                    id="bio-input"
                    className="form-textarea"
                    rows="4"
                    placeholder="Tell other enthusiasts about your favorite hobbies, gear, and experience..."
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    maxLength={300}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="interests-input" className="form-label">Your Hobbies / Interests (Comma separated)</label>
                  <input
                    id="interests-input"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Photography, Mechanical Keyboards, Baking, 3D Printing"
                    value={editInterests}
                    onChange={(e) => setEditInterests(e.target.value)}
                  />
                </div>

                <div className="edit-form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActiveTab('threads')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

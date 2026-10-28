import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <span className="brand-icon-inner">H</span>
          </div>
          <span className="brand-text">
            Hobby<span className="brand-accent">Hub</span>
          </span>
        </Link>

        <div className={`navbar-center ${mobileOpen ? 'mobile-open' : ''}`}>
          <div className="nav-links">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              <span className="nav-link-icon">🏠</span>
              <span>Home</span>
            </Link>
            <Link to="/forums" className={`nav-link ${location.pathname.startsWith('/forums') ? 'active' : ''}`}>
              <span className="nav-link-icon">💬</span>
              <span>Forums</span>
            </Link>
            <Link to="/leaderboard" className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}>
              <span className="nav-link-icon">🏆</span>
              <span>Hall of Fame</span>
            </Link>
            {user && (
              <Link to="/create-thread" className={`nav-link ${location.pathname === '/create-thread' ? 'active' : ''}`}>
                <span className="nav-link-icon">✏️</span>
                <span>New Thread</span>
              </Link>
            )}
          </div>

          <form className="nav-search" onSubmit={handleSearch}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search forums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>

          <div className="nav-actions">
            {user ? (
              <div className="user-menu">
                <Link to={`/profile/${user._id}`} className="user-menu-trigger">
                  <img src={user.avatar} alt={user.username} className="avatar avatar-sm" />
                  <span className="user-name">{user.username}</span>
                  <span className={`badge badge-${user.level.toLowerCase()}`}>{user.level}</span>
                </Link>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-actions">
                <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </div>
            )}
          </div>
        </div>

        <button
          className={`mobile-toggle ${mobileOpen ? 'active' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

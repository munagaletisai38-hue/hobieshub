import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-glow"></div>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="brand-icon">
                <span className="brand-icon-inner">H</span>
              </div>
              <span className="brand-text">
                Hobby<span className="brand-accent">Hub</span>
              </span>
            </Link>
            <p className="footer-desc">
              Where passionate hobbyists connect, share knowledge, and grow together. Join our vibrant community today.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Twitter">𝕏</a>
              <a href="#" className="social-link" aria-label="GitHub">⌨</a>
              <a href="#" className="social-link" aria-label="Discord">💬</a>
            </div>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Community</h4>
            <ul className="footer-links">
              <li><Link to="/forums">Forums</Link></li>
              <li><Link to="/forums">Categories</Link></li>
              <li><Link to="/search">Search</Link></li>
              <li><Link to="/">Leaderboard</Link></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Popular Hobbies</h4>
            <ul className="footer-links">
              <li><Link to="/forums">📸 Photography</Link></li>
              <li><Link to="/forums">🎮 Gaming</Link></li>
              <li><Link to="/forums">🎵 Music</Link></li>
              <li><Link to="/forums">💻 Technology</Link></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Guidelines</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} HobbyHub. Built with passion for hobbyists everywhere.</p>
          <p className="footer-tech">Powered by React • Express • MongoDB</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ForumList from './pages/ForumList';
import ForumDetail from './pages/ForumDetail';
import ThreadDetail from './pages/ThreadDetail';
import CreateThread from './pages/CreateThread';
import UserProfile from './pages/UserProfile';
import Search from './pages/Search';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Register from './pages/Register';

// Helper to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <div className="app-layout">
      <ScrollToTop />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forums" element={<ForumList />} />
          <Route path="/forums/:id" element={<ForumDetail />} />
          <Route path="/threads/:id" element={<ThreadDetail />} />
          <Route path="/create-thread" element={<CreateThread />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/:id" element={<UserProfile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

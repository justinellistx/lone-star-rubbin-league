import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Trophy, ChevronDown } from 'lucide-react';
import { useComputedStandings } from '../hooks/useSupabase';
import '../styles/layout.css';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef(null);
  const location = useLocation();
  const { standings } = useComputedStandings();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close "More" dropdown on route change
  useEffect(() => {
    setMoreMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Standings', path: '/standings' },
    { label: 'Results', path: '/results' },
    { label: 'Teams', path: '/teams' },
    { label: 'Drivers', path: '/drivers' },
    { label: 'Schedule', path: '/schedule' },
    { label: 'News', path: '/news' },
    { label: 'Podcast', path: '/podcast' },
    { label: 'Interviews', path: '/interviews' },
  ];

  const moreLinks = [
    { label: 'Head-to-Head', path: '/head-to-head' },
    { label: 'Power Rankings', path: '/power-rankings' },
    { label: 'Awards', path: '/awards' },
    { label: 'Rivalries', path: '/rivalries' },
    { label: 'What-If Calculator', path: '/what-if' },
    { label: 'Incident Heatmap', path: '/heatmap' },
    { label: 'Season Timeline', path: '/timeline' },
    { label: "Pick'em", path: '/pickem' },
    { label: 'Arcade', path: '/game' },
  ];

  const isMoreActive = moreLinks.some((link) => location.pathname === link.path);

  const topDrivers = standings ? standings.slice(0, 9) : [];

  return (
    <div className="layout-wrapper">
      {/* ESPN-Style Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo/Brand */}
          <Link to="/" className="navbar-brand">
            <Trophy size={20} className="brand-icon" />
            <span className="brand-text">LSR LEAGUE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links-desktop">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* More Dropdown */}
            <div className="more-dropdown" ref={moreMenuRef}>
              <button
                className={`nav-link more-btn ${isMoreActive ? 'active' : ''}`}
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              >
                More <ChevronDown size={12} style={{ marginLeft: '3px', transform: moreMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </button>
              {moreMenuOpen && (
                <div className="more-dropdown-menu">
                  {moreLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className={({ isActive }) =>
                        `more-dropdown-item ${isActive ? 'active' : ''}`
                      }
                      onClick={() => setMoreMenuOpen(false)}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Admin Link */}
          <div className="nav-actions">
            <Link to="/admin" className="nav-link admin-link">
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `mobile-nav-link ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              <hr className="mobile-menu-divider" />
              <span className="mobile-section-label">More</span>
              {moreLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `mobile-nav-link ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              <hr className="mobile-menu-divider" />
              <Link
                to="/admin"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Scoreboard Ticker Strip */}
      <div className="ticker-bar" style={{ marginTop: '48px', position: 'fixed', left: 0, right: 0, zIndex: 999 }}>
        <div className="ticker-inner">
          <div className="ticker-label">STANDINGS</div>
          {topDrivers.map((d, i) => (
            <Link to={`/drivers/${d.id}`} key={d.id} className="ticker-item" style={{ textDecoration: 'none' }}>
              <span className="ticker-pos">{i + 1}</span>
              <span className="ticker-name">{d.name}</span>
              <span className="ticker-points">{d.points}</span>
            </Link>
          ))}
          {topDrivers.length === 0 && (
            <div className="ticker-item">
              <span className="ticker-name" style={{ color: 'var(--text-secondary)' }}>Season data loading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>LONE STAR RUBBIN' LEAGUE</h3>
              <p className="text-secondary">iRacing Competitive Racing</p>
            </div>
            <div className="footer-season">
              <p className="text-secondary">Season 2026</p>
              <p className="text-secondary">&copy; 2026 All rights reserved</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="text-secondary">Powered by iRacing</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      setMobileOpen(false);
    } else {
      navigate('/');
    }
  }

  function handleLogout() {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate('/');
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={() => setMobileOpen(false)}>
          ✍️ BlogPlatform
        </Link>

        {/* Desktop search */}
        <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search posts…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search posts"
          />
          <button type="submit" className={styles.searchBtn} aria-label="Submit search">
            🔍
          </button>
        </form>

        {/* Desktop nav */}
        <nav className={styles.desktopNav}>
          {user ? (
            <div className={styles.userMenu} ref={dropdownRef}>
              <button
                className={styles.userBtn}
                onClick={() => setDropdownOpen(v => !v)}
                aria-expanded={dropdownOpen}
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className={styles.avatar}
                />
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.chevron}>{dropdownOpen ? '▲' : '▼'}</span>
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <Link
                    to="/create"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    ✏️ New Post
                  </Link>
                  <button className={styles.dropdownItem} onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/login" className={`btn btn-ghost ${styles.navLink}`}>Login</Link>
              <Link to="/register" className={`btn btn-primary`}>Register</Link>
            </div>
          )}
        </nav>

        {/* Hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <div className="container">
            <form className={styles.mobileSearchForm} onSubmit={handleSearchSubmit}>
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Search posts…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                aria-label="Search posts"
              />
              <button type="submit" className={styles.searchBtn}>🔍</button>
            </form>
            {user ? (
              <div className={styles.mobileLinks}>
                <span className={styles.mobileUser}>Logged in as {user.name}</span>
                <Link to="/create" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                  ✏️ New Post
                </Link>
                <button className={styles.mobileLink} onClick={handleLogout}>
                  🚪 Logout
                </button>
              </div>
            ) : (
              <div className={styles.mobileLinks}>
                <Link to="/login" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

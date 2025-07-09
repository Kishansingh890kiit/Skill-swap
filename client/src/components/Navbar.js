import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = forwardRef((props, ref) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([
    // Initial dummy notifications can be removed
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useImperativeHandle(ref, () => ({
    addNotification: (notification) =>
      setNotifications((prev) => [notification, ...prev]),
    clearNotifications: () => setNotifications([]),
  }));

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3002'}/api/ai/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: search })
        });
        const data = await res.json();
        setSearchResults(data.results || []);
        setShowSearchDropdown(true);
      } catch (err) {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
      setSearchLoading(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleResultClick = (user) => {
    setShowSearchDropdown(false);
    setSearch('');
    navigate(`/profile?name=${encodeURIComponent(user.name)}`);
  };

  const searchInputRef = React.useRef();
  const searchDropdownRef = React.useRef();

  // Close dropdown if click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-blue-100 transition-shadow duration-300 ${scrolled ? 'shadow-2xl' : 'shadow-lg'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-800">SkillSwap Hub</span>
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="hidden md:flex w-full max-w-xs relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search users or skills..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-400 transition"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                autoComplete="off"
              />
              <span className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
              </span>
              {showSearchDropdown && (
                <div ref={searchDropdownRef} className="absolute left-0 top-12 w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-blue-100 dark:border-gray-700 z-50 animate-fadeIn max-h-72 overflow-y-auto">
                  {searchLoading && <div className="p-3 text-gray-400 text-sm flex items-center gap-2"><svg className="animate-spin h-4 w-4 mr-2 text-blue-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Searching...</div>}
                  {!searchLoading && searchResults.length === 0 && search.trim() && <div className="p-3 text-gray-400 text-sm">No results found</div>}
                  {!searchLoading && searchResults.length > 0 && searchResults.map((user, i) => (
                    <div
                      key={user._id || user.name + i}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer transition"
                      onMouseDown={() => handleResultClick(user)}
                    >
                      <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&size=32`} alt={user.name} className="w-8 h-8 rounded-full object-cover" onError={e => {e.target.onerror=null;e.target.src='https://ui-avatars.com/api/?name=User&background=random&size=32';}} />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.skillsHave && user.skillsHave.map((s, j) => (
                            <span key={s + j} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">{s}</span>
                          ))}
                          {user.skillsWant && user.skillsWant.map((s, j) => (
                            <span key={s + j + 'w'} className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hamburger for mobile */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-8.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95-7.07l-.71.71M6.34 4.93l-.71-.71" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
              )}
            </button>
            {/* Notification Bell */}
            <div className="relative">
              <button
                aria-label="Notifications"
                className="relative p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors group"
                onClick={() => setShowNotifications((v) => !v)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 group-hover:animate-bell-wiggle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-pulse shadow-lg">
                    {notifications.length}
                  </span>
                )}
              </button>
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-blue-100 z-50 animate-fadeIn">
                  <div className="p-2">
                    {notifications.length === 0 ? (
                      <div className="text-gray-500 text-sm text-center py-4">No notifications</div>
                    ) : notifications.map((n) => (
                      <a
                        key={n.id}
                        href={n.link}
                        className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition"
                        onClick={() => setShowNotifications(false)}
                      >
                        {n.text}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="nav-link"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="nav-link"
                >
                  Profile
                </Link>
                {/* Avatar and dropdown */}
                <div className="relative group ml-2">
                  <img
                    src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&size=48`}
                    alt="avatar"
                    className="w-10 h-10 rounded-full border-2 border-blue-300 shadow-sm cursor-pointer"
                  />
                  {/* Status indicator */}
                  <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-blue-100 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto z-50">
                    <Link to="/profile" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-t-lg">Profile</Link>
                    <Link to="/settings" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700">Settings</Link>
                    <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700">Help</a>
                    <div className="border-t border-blue-100 dark:border-gray-700 my-1" />
                    <button
                      onClick={toggleDarkMode}
                      aria-label="Toggle dark mode"
                      className="w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700"
                    >
                      {darkMode ? (
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 text-yellow-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 3v1m0 16v1m8.66-8.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95-7.07l-.71.71M6.34 4.93l-.71-.71' /></svg>
                      ) : (
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 text-gray-700 dark:text-gray-200' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z' /></svg>
                      )}
                      <span>Toggle Theme</span>
                    </button>
                    <div className="border-t border-blue-100 dark:border-gray-700 my-1" />
                <button
                  onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-b-lg"
                >
                  Logout
                </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="nav-link"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow transition-all duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
        {/* Mobile menu slide-in */}
        <div className={`md:hidden fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        <div className={`md:hidden fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg z-50 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col p-6 space-y-4">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="self-end p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Close menu"
            >
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors w-max"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-8.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95-7.07l-.71.71M6.34 4.93l-.71-.71" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
              )}
            </button>
            <Link to="/dashboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            <Link to="/profile" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
            {user ? (
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 rounded-md"
              >Logout</button>
            ) : (
              <>
                <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="ml-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow transition-all duration-200" onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
});

export default Navbar; 
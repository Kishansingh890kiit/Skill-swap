import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import Chat from './pages/Chat';

function App() {
  const navbarRef = useRef();
  return (
    <Router>
      <AuthProvider>
        <ChatProvider addNotification={navbarRef}>
          <div className="min-h-screen bg-gray-100">
            <Navbar ref={navbarRef} />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard addNotification={navbarRef} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <PrivateRoute>
                      <Chat addNotification={navbarRef} />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 
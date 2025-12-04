import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import Signup from './Signup';

const AuthButton: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-white dark:bg-[#1a1a1a] pixel-border px-4 py-2">
          <span className="text-sm font-pixel text-pixel-accent dark:text-[#50a0ff]">
            [{user.username}]
          </span>
        </div>
        <button
          onClick={logout}
          className="pixel-button bg-pixel-accent dark:bg-[#50a0ff] text-black dark:text-black px-4 py-3 text-sm font-pixel"
        >
          QUIT
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowLogin(true)}
        className="pixel-button bg-pixel-accent dark:bg-[#50a0ff] text-black dark:text-black px-5 py-3 text-sm font-pixel"
      >
        LOGIN
      </button>

      {showLogin && (
        <Login
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
          onClose={() => setShowLogin(false)}
        />
      )}

      {showSignup && (
        <Signup
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
          onClose={() => setShowSignup(false)}
        />
      )}
    </>
  );
};

export default AuthButton;


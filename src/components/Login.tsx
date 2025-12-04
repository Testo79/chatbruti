import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onSwitchToSignup: () => void;
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        onClose();
      } else {
        setError('Nom d\'utilisateur ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1a1a1a] pixel-border max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-pixel text-black dark:text-white pixel-text">[LOGIN]</h2>
          <button
            onClick={onClose}
            className="text-black dark:text-white text-2xl font-pixel hover:text-pixel-accent dark:hover:text-[#50a0ff]"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-pixel-accent dark:bg-[#50a0ff] pixel-border px-4 py-3">
              <p className="text-sm font-pixel text-white dark:text-black">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-pixel text-black dark:text-white mb-2">
              USERNAME/EMAIL
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pixel-input"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-pixel text-black dark:text-white mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pixel-input"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full pixel-button bg-pixel-accent dark:bg-[#50a0ff] text-black dark:text-black px-5 py-4 text-sm font-pixel disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'LOADING...' : 'LOGIN'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-xs font-pixel text-black dark:text-white">
            NO ACCOUNT?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-pixel-accent dark:text-[#50a0ff] font-pixel hover:opacity-75"
            >
              [SIGNUP]
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


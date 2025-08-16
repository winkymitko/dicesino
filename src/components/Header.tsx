// project/src/components/Header.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-gray-950 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="text-white font-semibold">Dicesino</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/games" className="text-gray-300 hover:text-white">Games</Link>
          <Link to="/profile" className="text-gray-300 hover:text-white">Profile</Link>
          {user ? (
            <>
              <span className="text-gray-400">
                Balance:{' '}
                <span className="text-white font-medium">
                  ${(Number(user.virtualBalance ?? 0)).toFixed(2)}
                </span>
              </span>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="px-3 py-1 rounded bg-gray-800 text-gray-100 hover:bg-gray-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
              <Link to="/register" className="text-gray-300 hover:text-white">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;


import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Admin' && password === 'Admin2492') {
      onLogin(true);
    } else {
      setError('Invalid credentials. Access Denied.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl border border-sky-100 shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-sky-500 rounded-2xl flex items-center justify-center text-white text-3xl mb-4 shadow-lg shadow-sky-200">
            <i className="fa-solid fa-user-shield"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admin Login</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">NETTOOLZ Control Panel</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Username</label>
              <input
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-sky-100 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-sky-50/50"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-sky-100 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-sky-50/50"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{error}</div>}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 border-2 border-sky-100 text-sm font-bold rounded-xl text-slate-500 hover:bg-sky-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 shadow-lg shadow-sky-200"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

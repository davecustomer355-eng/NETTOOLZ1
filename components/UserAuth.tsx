
import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../supabase';

interface UserAuthProps {
  onAuth: (user: User) => void;
  onCancel: () => void;
}

const UserAuth: React.FC<UserAuthProps> = ({ onAuth, onCancel }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(`Google Sign-In failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user) {
          const { data: userDoc, error: docError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (userDoc) {
            onAuth(userDoc as User);
          } else {
            const newUser: User = {
              id: data.user.id,
              email: data.user.email || '',
              password: '',
              balance: 0,
              orders: []
            };
            await supabase.from('users').upsert(newUser);
            onAuth(newUser);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user) {
          const newUser: User = {
            id: data.user.id,
            email: data.user.email || '',
            password: '',
            balance: 0,
            orders: []
          };
          await supabase.from('users').upsert(newUser);
          onAuth(newUser);
        }
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-skyblue-100 dark:border-slate-800 shadow-xl transition-colors">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white">{isLogin ? 'Customer Login' : 'Create Account'}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Access your NETTOOLZ portal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Email</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-skyblue-50 dark:bg-slate-800 border border-skyblue-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-skyblue-500 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
            placeholder="name@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Password</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-skyblue-50 dark:bg-slate-800 border border-skyblue-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-skyblue-500 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
            placeholder="••••••••"
          />
        </div>
        
        {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 dark:bg-red-900/10 py-2 rounded-lg">{error}</p>}

        <button type="submit" disabled={loading} className="w-full bg-skyblue-500 hover:bg-skyblue-600 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:bg-slate-300">
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 font-bold tracking-widest">Or continue with</span>
          </div>
        </div>

        <button 
          type="button" 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold py-4 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Google</span>
        </button>

        <div className="flex flex-col space-y-4 items-center justify-center text-sm mt-6">
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-skyblue-500 dark:text-skyblue-400 font-bold hover:underline">
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
          <button type="button" onClick={onCancel} className="text-slate-400 dark:text-slate-500 font-bold hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default UserAuth;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AlertCircle, LogIn } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data?.user) {
        navigate('/admin');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#f5a623] rounded-lg mb-4">
              <LogIn className="w-6 h-6 text-[#0a0a0f]" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-[#8a8a9a] mt-2">Lone Star Rubbin' League</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-[#1a1a2e] border border-[#e63946] rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#e63946] flex-shrink-0 mt-0.5" />
              <p className="text-[#e63946] text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-[#8a8a9a] rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-[#8a8a9a] rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#f5a623] text-[#0a0a0f] font-semibold rounded-lg hover:bg-[#e59b1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-[#8a8a9a] text-sm mt-6">
            Admin only • Contact the league admin for access
          </p>
        </div>
      </div>
    </div>
  );
}

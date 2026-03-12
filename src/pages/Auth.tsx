import { useState } from 'react';
import { useAuth } from '../lib/hooks/useAuth';

export function Auth() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const err = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password);

    if (err) {
      setError(err.message);
    } else if (mode === 'register') {
      setSuccess('Check your email to confirm your account.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🟠</div>
          <h1 className="text-2xl font-bold text-white">Daily Check-In</h1>
          <p className="text-gray-400 text-sm mt-1">Track your daily performance</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6">
          <div className="flex mb-6 bg-zinc-800 rounded-xl p-1">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                  ${mode === m ? 'bg-orange-500 text-white' : 'text-gray-400'}`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500 transition"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500 transition"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-900/30 border border-green-700 rounded-xl px-4 py-3 text-sm text-green-400">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 text-base"
            >
              {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

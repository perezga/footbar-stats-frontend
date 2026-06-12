import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLogin, useSignup } from '../api/hooks.js';

export function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);

  const login = useLogin();
  const signup = useSignup();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignup) {
      signup.mutate(
        { email, password, nickname },
        {
          onSuccess: () => navigate(from, { replace: true }),
          onError: (err: any) => setError(err.message || 'Signup failed'),
        },
      );
    } else {
      login.mutate(
        { email, password },
        {
          onSuccess: () => navigate(from, { replace: true }),
          onError: (err: any) => setError(err.message || 'Login failed'),
        },
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-100 tracking-tight">FOOTBAR STATS</h1>
          <p className="text-slate-400 mt-2">Your independent football performance dashboard.</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">
            {isSignup ? 'Create account' : 'Sign in'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                  placeholder="e.g. Pichichi"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={login.isPending || signup.isPending}
              className="w-full bg-brand hover:bg-brand/90 text-white font-bold py-3 rounded-lg mt-2 transition-colors disabled:opacity-50"
            >
              {login.isPending || signup.isPending
                ? 'Processing...'
                : isSignup
                  ? 'Sign up'
                  : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-slate-400 hover:text-brand text-sm font-medium transition-colors"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

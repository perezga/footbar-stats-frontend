import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useLogout, usePlayers, useProfile } from '../api/hooks.js';
import { usePlayerContext } from '../api/PlayerContext.js';

const tabs = [
  { to: '/', label: 'Profile' },
  { to: '/sessions', label: 'Sessions' },
  { to: '/stats', label: 'Stats' },
  { to: '/league', label: 'League' },
  { to: '/compare', label: 'Compare' },
  { to: '/settings', label: 'Settings' },
];

export function Layout() {
  const { activePlayerId, setActivePlayerId } = usePlayerContext();
  const { data: players } = usePlayers();
  const profile = useProfile(true);
  const logout = useLogout();
  const nav = useNavigate();

  const activePlayer = players?.find((p) => p.id === activePlayerId);

  const onLogout = async () => {
    await logout.mutateAsync(activePlayerId ?? undefined);
    setActivePlayerId(null);
    nav('/login', { replace: true });
  };

  return (
    <div className="min-h-screen">
      <header className="bg-brand-panel border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          {profile.data?.profile_pic && (
            <img
              src={profile.data.profile_pic}
              alt=""
              className="h-9 w-9 rounded-full border border-slate-700"
            />
          )}
          <div className="flex flex-col">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Player
            </div>
            <div className="text-sm text-slate-200 font-semibold">
              {activePlayer?.name ?? 'Loading...'}
            </div>
          </div>

          <nav className="ml-6 flex gap-1">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm ${
                    isActive ? 'bg-brand text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <button
              type="button"
              onClick={() => nav('/login')}
              className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4"
            >
              Switch Player
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="text-sm text-slate-400 hover:text-red-400 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

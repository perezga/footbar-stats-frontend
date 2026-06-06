import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useLogout, useProfile } from '../api/hooks.js';

const tabs = [
  { to: '/', label: 'Profile' },
  { to: '/sessions', label: 'Sessions' },
  { to: '/stats', label: 'Stats' },
  { to: '/league', label: 'League' },
];

export function Layout() {
  const profile = useProfile(true);
  const logout = useLogout();
  const nav = useNavigate();

  const onLogout = async () => {
    await logout.mutateAsync();
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
          <div className="text-sm text-slate-300">
            {profile.data
              ? `${profile.data.first_name} ${profile.data.last_name}`.trim() ||
                profile.data.nickname
              : 'Footbar Stats'}
          </div>
          <nav className="ml-6 flex gap-1">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm ${
                    isActive
                      ? 'bg-brand text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={onLogout}
            className="ml-auto text-sm text-slate-400 hover:text-slate-200"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
